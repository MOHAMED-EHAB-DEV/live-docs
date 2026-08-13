"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { CustomCollaborationCursor } from "./CustomCollaborationCursor";
import { Extension } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useSocket } from "./SocketProvider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CustomImage } from "./CustomImage";
import { CustomCodeBlock } from "./CustomCodeBlock";
import { TextColorPicker, HighlightPicker } from "./ColorPicker";
import DeveloperBadge from "@/components/DeveloperBadge";
import TextAlign from "@tiptap/extension-text-align";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";

const SmartEnterExtension = Extension.create({
  name: "smartEnter",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        // In a heading: split and turn next line into paragraph while keeping inline text styles (bold, italic, underline, strike, color)
        if ($from.parent.type.name === "heading") {
          if ($from.parentOffset === $from.parent.content.size) {
            (editor.chain() as any).splitBlock({ keepMarks: true }).setParagraph().run();
            return true;
          }
        }

        // In an empty blockquote line: exit quote into paragraph
        if ($from.parent.type.name === "blockquote" || $from.node(-1)?.type.name === "blockquote") {
          if ($from.parent.content.size === 0) {
            (editor.chain() as any).setParagraph().run();
            return true;
          }
        }

        return false;
      },
    };
  },
});

interface EditorProps {
  roomId: string;
  currentUserType: "editor" | "viewer";
  currentUserEmail: string;
  initialContent?: string;
}

export const Editor = ({ roomId, currentUserType, currentUserEmail, initialContent }: EditorProps) => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const wsUrl = (`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/yjs` || "ws://localhost:7860/yjs")
      .replace(/^http/, "ws");
    const wsProvider = new WebsocketProvider(
      wsUrl,
      roomId,
      doc,
      {
        connect: true,
        resyncInterval: 15000,
        maxBackoffTime: 5000,
        disableBc: false,
      }
    );

    setYdoc(doc);
    setProvider(wsProvider);

    return () => {
      setProvider(null);
      setYdoc(null);
      try {
        wsProvider.disconnect();
        (wsProvider as any).destroy?.();
      } catch (e) {}
      try {
        (doc as any).destroy?.();
      } catch (e) {}
    };
  }, [roomId]);

  if (!provider || !ydoc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 w-full">
        <Loader text="Connecting to document..." size={32} />
      </div>
    );
  }

  return (
    <TiptapEditor
      key={roomId}
      provider={provider}
      ydoc={ydoc}
      documentId={roomId}
      currentUserType={currentUserType}
      currentUserEmail={currentUserEmail}
      initialContent={initialContent}
    />
  );
};

const getRandomColor = () => {
  const colors = [
    "#958DF1",
    "#F98181",
    "#FBBC88",
    "#FAF594",
    "#70CFF8",
    "#94FADB",
    "#B9F18D",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface TiptapEditorProps {
  provider: WebsocketProvider;
  ydoc: Y.Doc;
  documentId: string;
  currentUserType: "editor" | "viewer";
  currentUserEmail: string;
  initialContent?: string;
}

const blockLabels: Record<string, string> = {
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  blockquote: "Quote",
  codeBlock: "Code Block",
};

const listLabels: Record<string, string> = {
  none: "No List",
  bulletList: "Bullet List",
  orderedList: "Numbered List",
};

const TiptapEditor = ({ provider, ydoc, documentId, currentUserType, currentUserEmail, initialContent }: TiptapEditorProps) => {
  const [, setSelectionTick] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isInitialContentApplied = React.useRef(false);

  const forceToolbarUpdate = useCallback(() => {
    requestAnimationFrame(() => {
      setSelectionTick((t) => (t + 1) % 100000);
    });
  }, []);

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        undoRedo: false,
        underline: false,
      }),
      CustomCodeBlock,
      SmartEnterExtension,
      Collaboration.configure({
        document: ydoc,
      }),
      CustomCollaborationCursor.configure({
        provider,
        user: {
          name: currentUserEmail,
          color: getRandomColor(),
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editable: currentUserType === "editor",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4 sm:p-8 w-full",
      },
      handleScrollToSelection: (view: any) => {
        // Suppress automatic viewport scrolling on remote edits and remote cursor updates
        return !view.hasFocus();
      },
    },
    onSelectionUpdate: () => {
      forceToolbarUpdate();
    },
    onTransaction: ({ transaction }) => {
      if (transaction.docChanged || transaction.selectionSet || transaction.storedMarksSet) {
        forceToolbarUpdate();
      }
    },
    onUpdate: ({ editor }) => {
      forceToolbarUpdate();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const html = editor.getHTML();
      
      // Prevent saving empty boilerplate if initialContent is still hydrating
      if (editor.isEmpty && initialContent && !isInitialContentApplied.current) {
        return;
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: html })
          });
        } catch(e) {
          console.error('Error auto-saving document to DB', e);
        }
      }, 2000);
    }
  }, [provider, currentUserType]);

  useEffect(() => {
    if (!editor || !provider || isInitialContentApplied.current || !initialContent) return;

    const checkAndSetInitialContent = () => {
      if (isInitialContentApplied.current) return;
      
      const isDocEmpty = editor.isEmpty || editor.getText().trim() === "";
      if (isDocEmpty && initialContent && initialContent.trim() !== "" && initialContent !== "<p></p>") {
        editor.commands.setContent(initialContent, { emitUpdate: false });
        isInitialContentApplied.current = true;
      } else if (!isDocEmpty) {
        isInitialContentApplied.current = true;
      }
    };

    if (provider.synced) {
      checkAndSetInitialContent();
    }

    const onSync = (isSynced: boolean) => {
      if (isSynced) {
        checkAndSetInitialContent();
      }
    };

    (provider as any).on?.("sync", onSync);

    const timer = setTimeout(checkAndSetInitialContent, 200);

    return () => {
      (provider as any).off?.("sync", onSync);
      clearTimeout(timer);
    };
  }, [editor, provider, initialContent]);

  if (!editor) {
    return null;
  }

  const getCurrentBlock = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("blockquote")) return "blockquote";
    if (editor.isActive("codeBlock")) return "codeBlock";
    return "paragraph";
  };

  const handleBlockChange = (val: string) => {
    const chain = editor.chain().focus() as any;
    if (val === "paragraph") chain.setParagraph().run();
    else if (val === "h1") chain.toggleHeading({ level: 1 }).run();
    else if (val === "h2") chain.toggleHeading({ level: 2 }).run();
    else if (val === "h3") chain.toggleHeading({ level: 3 }).run();
    else if (val === "blockquote") chain.toggleBlockquote().run();
    else if (val === "codeBlock") chain.toggleCodeBlock().run();
  };

  const getCurrentList = () => {
    if (editor.isActive("bulletList")) return "bulletList";
    if (editor.isActive("orderedList")) return "orderedList";
    return "none";
  };

  const handleListChange = (val: string) => {
    const chain = editor.chain().focus() as any;
    if (val === "none") {
      if (editor.isActive("bulletList")) chain.toggleBulletList().run();
      if (editor.isActive("orderedList")) chain.toggleOrderedList().run();
    } else if (val === "bulletList") {
      if (editor.isActive("orderedList")) {
        chain.toggleOrderedList().toggleBulletList().run();
      } else if (!editor.isActive("bulletList")) {
        chain.toggleBulletList().run();
      }
    } else if (val === "orderedList") {
      if (editor.isActive("bulletList")) {
        chain.toggleBulletList().toggleOrderedList().run();
      } else if (!editor.isActive("orderedList")) {
        chain.toggleOrderedList().run();
      }
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            editor.chain().focus().setImage({ src: data.url }).run();
            setIsUploading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Cloudinary upload failed, using base64 fallback:", err);
      }
      editor.chain().focus().setImage({ src: base64 }).run();
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex-col flex bg-dark-200/80 backdrop-blur-xl rounded-2xl shadow-xl border border-dark-400 mt-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* CREATIVE RICH ICON-DRIVEN TOOLBAR */}
      {currentUserType === "editor" && (
        <div className="sticky top-20 z-30 flex flex-wrap w-full bg-dark-300/90 backdrop-blur-xl p-2 border-b border-dark-400 rounded-t-2xl justify-start items-center gap-1.5 shadow-sm">
          {/* Block Type Select */}
          <Select
            value={getCurrentBlock()}
            defaultValue="paragraph"
            onValueChange={handleBlockChange}
          >
            <SelectTrigger className="h-8 min-w-9 px-2 bg-dark-400/50 hover:bg-dark-400 border border-dark-400/60 rounded-lg text-xs gap-1.5 shadow-none">
              <SelectValue placeholder={blockLabels[getCurrentBlock()] || "Paragraph"}>
                {blockLabels[getCurrentBlock()] || "Paragraph"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-200 border border-dark-400 rounded-xl p-1 z-150 shadow-2xl">
              <SelectItem value="paragraph" className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-gray-300">¶</span>
                  <span>Paragraph</span>
                </div>
              </SelectItem>
              <SelectItem value="h1" className="text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-400">H1</span>
                  <span>Heading 1</span>
                </div>
              </SelectItem>
              <SelectItem value="h2" className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400">H2</span>
                  <span>Heading 2</span>
                </div>
              </SelectItem>
              <SelectItem value="h3" className="text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400">H3</span>
                  <span>Heading 3</span>
                </div>
              </SelectItem>
              <SelectItem value="blockquote" className="text-xs italic">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-400">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  </svg>
                  <span>Quote</span>
                </div>
              </SelectItem>
              <SelectItem value="codeBlock" className="text-xs font-mono">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-400">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                  <span>Code Block</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Lists Select */}
          <Select
            value={getCurrentList()}
            defaultValue="none"
            onValueChange={handleListChange}
          >
            <SelectTrigger className="h-8 min-w-9 px-2 bg-dark-400/50 hover:bg-dark-400 border border-dark-400/60 rounded-lg text-xs gap-1.5 shadow-none">
              <SelectValue placeholder={listLabels[getCurrentList()] || "No List"}>
                {listLabels[getCurrentList()] || "No List"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-200 border border-dark-400 rounded-xl p-1 z-150 shadow-2xl">
              <SelectItem value="none" className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">✕</span>
                  <span>No List</span>
                </div>
              </SelectItem>
              <SelectItem value="bulletList" className="text-xs">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-400">
                    <line x1="9" x2="21" y1="6" y2="6" /><line x1="9" x2="21" y1="12" y2="12" /><line x1="9" x2="21" y1="18" y2="18" />
                    <circle cx="4" cy="6" r="1.5" fill="currentColor" /><circle cx="4" cy="12" r="1.5" fill="currentColor" /><circle cx="4" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                  <span>Bullet List</span>
                </div>
              </SelectItem>
              <SelectItem value="orderedList" className="text-xs">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-blue-400">
                    <line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" />
                    <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                  </svg>
                  <span>Numbered List</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-5 bg-dark-400 mx-1" />

          {/* Text Style Group (Pure Icons) */}
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bold") ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive("bold") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z" /><path d="M6 4h8a4 4 0 0 1 0 8H6V4Z" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("italic") ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive("italic") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("underline") ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive("underline") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("strike") ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive("strike") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleStrike().run()}
            title="Strikethrough"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" x2="20" y1="12" y2="12" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("code") ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive("code") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleCode().run()}
            title="Inline Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </Button>

          <div className="w-px h-5 bg-dark-400 mx-1" />

          {/* Text Color & Highlight Pickers */}
          <TextColorPicker editor={editor} />
          <HighlightPicker editor={editor} />

          <div className="w-px h-5 bg-dark-400 mx-1" />

          {/* Alignment Group (Pure Icons) */}
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive({ textAlign: "left" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("left").run()}
            title="Align Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line x1="17" x2="3" y1="18" y2="18" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive({ textAlign: "center" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("center").run()}
            title="Align Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="17" x2="7" y1="12" y2="12" /><line x1="19" x2="5" y1="18" y2="18" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
            className={cn("h-8 px-2 rounded-lg", editor.isActive({ textAlign: "right" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("right").run()}
            title="Align Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="9" y1="12" y2="12" /><line x1="21" x2="7" y1="18" y2="18" />
            </svg>
          </Button>

          <div className="w-px h-5 bg-dark-400 mx-1" />

          {/* Insert Image */}
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            variant={editor.isActive("image") ? "default" : "ghost"}
            className={cn("h-8 px-2.5 rounded-lg", editor.isActive("image") && "bg-blue-600 text-white shadow-sm")}
            onClick={addImage}
            title="Insert Image"
          >
            {isUploading ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}
          </Button>

          {/* Horizontal Rule */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 rounded-lg text-blue-100 hover:text-white hover:bg-dark-400"
            onClick={() => (editor.chain().focus() as any).setHorizontalRule?.().run() || (editor.chain().focus() as any).setHorizontalRule().run()}
            title="Horizontal Divider"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <line x1="3" x2="21" y1="12" y2="12" />
            </svg>
          </Button>

          {/* Clear Formatting */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 rounded-lg text-blue-100 hover:text-white hover:bg-dark-400"
            onClick={() => (editor.chain().focus() as any).unsetAllMarks().clearNodes().run()}
            title="Clear Formatting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </svg>
          </Button>
        </div>
      )}

      {/* FLOATING TEXT SELECTION BUBBLE MENU (Pure Icons) */}
      {editor && currentUserType === "editor" && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top", offset: 8 }}
          shouldShow={({ editor, from, to }: any) => {
            return !editor.isActive("image") && from !== to && editor.isEditable;
          }}
          className="flex items-center gap-0.5 p-1 bg-dark-200/95 border border-dark-400 backdrop-blur-md rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50"
        >
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("bold") ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive("bold") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleBold().run()}
            title="Bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z" /><path d="M6 4h8a4 4 0 0 1 0 8H6V4Z" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("italic") ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive("italic") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleItalic().run()}
            title="Italic"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("underline") ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive("underline") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
            title="Underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("strike") ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive("strike") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleStrike().run()}
            title="Strikethrough"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" x2="20" y1="12" y2="12" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive("code") ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive("code") && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).toggleCode().run()}
            title="Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </Button>

          <div className="w-px h-4 bg-dark-400 mx-0.5" />

          {/* Bubble Menu Text Color & Highlight Pickers */}
          <TextColorPicker editor={editor} size="xs" />
          <HighlightPicker editor={editor} size="xs" />

          <div className="w-px h-4 bg-dark-400 mx-0.5" />

          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive({ textAlign: "left" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("left").run()}
            title="Align Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line x1="17" x2="3" y1="18" y2="18" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive({ textAlign: "center" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("center").run()}
            title="Align Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="17" x2="7" y1="12" y2="12" /><line x1="19" x2="5" y1="18" y2="18" />
            </svg>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
            className={cn("h-7 px-1.5 rounded-lg", editor.isActive({ textAlign: "right" }) && "bg-blue-600 text-white shadow-sm")}
            onClick={() => (editor.chain().focus() as any).setTextAlign("right").run()}
            title="Align Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="9" y1="12" y2="12" /><line x1="21" x2="7" y1="18" y2="18" />
            </svg>
          </Button>
        </BubbleMenu>
      )}

      {/* EDITOR AREA */}
      <div className="w-full flex-1">
        <EditorContent editor={editor} />
      </div>

      {/* DOCUMENT FOOTER BADGE */}
      <DeveloperBadge variant="footer" />
    </div>
  );
};
