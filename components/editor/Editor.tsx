"use client";

import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  AnchoredThreads,
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useEditorStatus,
} from "@liveblocks/react-lexical";
import { useThreads } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import { PreserveSelectionPlugin } from "./plugins/PreserveSelectionPlugin";
import { FloatingToolbar } from "./components/FloatingToolbar";
import "./globals.css";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import Comments from "../Comments";
import DeleteModel from "../DeleteModel";

const initialConfig = liveblocksConfig({
  namespace: "Editor",
  nodes: [
    HorizontalRuleNode,
    CodeNode,
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
  ],
  onError: (error: unknown) => {
    console.error(error);
    throw error;
  },
  theme: {
    text: {
      bold: "lexical-bold",
      italic: "lexical-italic",
      underline: "lexical-underline",
      strikethrough: "lexical-strikethrough",
    },
  },
});

export function Editor({
  roomId,
  currentUserType,
  users,
  folderId,
}: {
  roomId: string;
  currentUserType: UserType;
  users: User[];
  folderId: string;
}) {
  return (
    <ClientSideSuspense fallback={<Skeleton />}>
      <LexicalEditor
        roomId={roomId}
        currentUserType={currentUserType}
        users={users}
        folderId={folderId}
      />
    </ClientSideSuspense>
  );
}

function LexicalEditor({
  roomId,
  currentUserType,
  users,
  folderId,
}: {
  roomId: string;
  currentUserType: UserType;
  users: User[];
  folderId: string;
}) {
  const status = useEditorStatus();
  const { threads } = useThreads();

  // Used by the drag handle
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <LiveblocksPlugin>
          <div className="toolbar-wrapper flex min-w-full justify-between">
            <ToolbarPlugin />
            {currentUserType === "editor" && (
              <DeleteModel
                roomId={roomId}
                users={users}
                isDashboard={false}
                folderId={folderId}
              />
            )}
          </div>
          <div className="relative flex flex-row justify-between h-[calc(100%-60px)] w-full flex-1">
            <div className="relative editor-wrapper h-full w-full overflow-y-auto overflow-x-hidden">
              <FloatingComposer className="w-[350px]" />

              <FloatingThreads threads={threads} className="block xl:hidden" />

              {status === "not-loaded" || status === "loading" ? (
                <Skeleton />
              ) : (
                <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
                  <div className="absolute left-full -ml-8">
                    <AnchoredThreads
                      threads={threads}
                      className="w-[270px] hidden xl:block"
                    />
                  </div>
                  <RichTextPlugin
                    contentEditable={
                      <div ref={onRef}>
                        <ContentEditable className="editor-input relative outline-none w-full h-full px-8 py-4" />
                      </div>
                    }
                    placeholder={
                      <span className="pointer-events-none absolute top-7 mt-px left-8 text-muted-foreground text-slate-500 w-full h-full">
                        Try mentioning a user with @
                      </span>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />

                  {floatingAnchorElem ? (
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                  ) : null}

                  <FloatingToolbar />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                </div>
              )}
            </div>
          </div>
          <Comments />
          <PreserveSelectionPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </LiveblocksPlugin>
      </div>
    </LexicalComposer>
  );
}

function Skeleton() {
  return (
    <div className=" xl:mr-[200px]">
      <div className="relative max-w-[740px] w-full mx-auto p-8">
        <div className="h-[60px]" />
        <div className="mx-8 mt-4">
          <div className="bg-gray-200/40 animate-pulse h-11 rounded-lg w-[400px] max-w-full" />
          <div className="bg-gray-200/40 animate-pulse w-full h-32 rounded-lg mt-8"></div>
        </div>
      </div>
    </div>
  );
}
