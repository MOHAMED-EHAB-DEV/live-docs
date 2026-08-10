"use client";

import React, { useState } from "react";
import CodeBlock from "@tiptap/extension-code-block";
import { all, createLowlight } from "lowlight";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";

export const lowlight = createLowlight(all);
const customLowlightPluginKey = new PluginKey("customLowlight");

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
  { label: "Bash / Shell", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "Plain Text", value: "plaintext" },
];

const THEMES: Record<string, { name: string; bg: string; text: string; header: string; border: string }> = {
  vscode: {
    name: "VS Code Dark",
    bg: "bg-[#1e1e1e]",
    text: "text-[#d4d4d4]",
    header: "bg-[#252526] border-[#333333]",
    border: "border-[#333333]",
  },
  onedark: {
    name: "One Dark",
    bg: "bg-[#282c34]",
    text: "text-[#abb2bf]",
    header: "bg-[#21252b] border-[#3e4451]",
    border: "border-[#3e4451]",
  },
  dracula: {
    name: "Dracula",
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    header: "bg-[#21222c] border-[#44475a]",
    border: "border-[#44475a]",
  },
  github: {
    name: "GitHub Dark",
    bg: "bg-[#0d1117]",
    text: "text-[#c9d1d9]",
    header: "bg-[#161b22] border-[#30363d]",
    border: "border-[#30363d]",
  },
  cyberpunk: {
    name: "Cyberpunk",
    bg: "bg-[#12072b]",
    text: "text-[#00ffcc]",
    header: "bg-[#1c0c45] border-[#ff007f]",
    border: "border-[#ff007f]/50",
  },
};

function parseNodes(nodes: any[], className: string[] = []): any[] {
  return nodes.flatMap((node) => {
    const classes = [
      ...className,
      ...(node.properties && node.properties.className ? node.properties.className : []),
    ];
    if (node.children) {
      return parseNodes(node.children, classes);
    }
    return {
      text: node.value,
      classes,
    };
  });
}

function getHighlightNodes(result: any) {
  return result.value || result.children || [];
}

function getDecorations(doc: any, name: string) {
  const decorations: any[] = [];
  if (!doc) return DecorationSet.empty;

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === name) {
      let from = pos + 1;
      const language = node.attrs.language || "javascript";
      const isRegistered = lowlight.registered(language) || lowlight.listLanguages().includes(language);

      let nodes: any[] = [];
      try {
        nodes = isRegistered
          ? getHighlightNodes(lowlight.highlight(language, node.textContent))
          : getHighlightNodes(lowlight.highlightAuto(node.textContent));
      } catch {
        nodes = getHighlightNodes(lowlight.highlightAuto(node.textContent));
      }

      parseNodes(nodes).forEach((n: any) => {
        const to = from + n.text.length;
        if (n.classes && n.classes.length) {
          const decoration = Decoration.inline(from, to, {
            class: n.classes.join(" "),
          });
          decorations.push(decoration);
        }
        from = to;
      });

      return false;
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const CodeBlockComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  editor,
  deleteNode,
}) => {
  const currentLanguage = node.attrs.language || "javascript";
  const currentTheme = node.attrs.theme || "vscode";
  const [copied, setCopied] = useState(false);

  const themeConfig = THEMES[currentTheme] || THEMES.vscode;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    updateAttributes({ language: newLang });
    editor.view.dispatch(editor.state.tr.setMeta("forceDecorationUpdate", true));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    updateAttributes({ theme: newTheme });
  };

  return (
    <NodeViewWrapper
      className={cn(
        "relative my-6 rounded-xl overflow-hidden border shadow-2xl transition-all duration-200 not-prose",
        themeConfig.border,
        `theme-${currentTheme}`
      )}
    >
      {/* Code Block Top Header Bar with Settings (Without macOS circles) */}
      <div className={cn("flex items-center justify-between px-3.5 py-2 select-none border-b", themeConfig.header)}>
        {/* Code icon / language / theme */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-blue-400 font-mono font-bold text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 me-1">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>

          {/* Language Selector */}
          <select
            value={currentLanguage}
            onChange={handleLanguageChange}
            className="h-6.5 px-2 bg-dark-400/80 hover:bg-dark-400 text-blue-100 text-[11px] font-mono font-medium rounded-md border border-dark-400/60 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
            contentEditable={false}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-dark-300 text-white">
                {lang.label}
              </option>
            ))}
          </select>

          {/* Theme Selector */}
          <select
            value={currentTheme}
            onChange={handleThemeChange}
            className="h-6.5 px-2 bg-dark-400/80 hover:bg-dark-400 text-blue-100 text-[11px] font-medium rounded-md border border-dark-400/60 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
            contentEditable={false}
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key} className="bg-dark-300 text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions (Copy / Delete) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            contentEditable={false}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-300 hover:text-white bg-dark-300/60 hover:bg-dark-300 rounded-md transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <svg className="size-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
          {editor.isEditable && (
            <button
              type="button"
              onClick={() => deleteNode()}
              contentEditable={false}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
              title="Delete code block"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Highlighted Code Content */}
      <pre className={cn("p-4 font-mono text-sm leading-relaxed overflow-x-auto min-h-17.5 focus:outline-none", themeConfig.bg, themeConfig.text)}>
        <NodeViewContent as={"code" as any} className={`language-${currentLanguage}`} />
      </pre>
    </NodeViewWrapper>
  );
};

export const CustomCodeBlock = CodeBlock.extend({
  name: "codeBlock",

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: "javascript",
        parseHTML: (element) =>
          element.getAttribute("data-language") ||
          element.className.replace("language-", "") ||
          "javascript",
        renderHTML: (attributes) => ({
          "data-language": attributes.language,
          class: `language-${attributes.language}`,
        }),
      },
      theme: {
        default: "vscode",
        parseHTML: (element) => element.getAttribute("data-theme") || "vscode",
        renderHTML: (attributes) => ({
          "data-theme": attributes.theme,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addProseMirrorPlugins() {
    const name = this.name;

    const plugin: Plugin = new Plugin({
      key: customLowlightPluginKey,
      state: {
        init: (_, { doc }) => getDecorations(doc, name),
        apply: (transaction, decorationSet, oldState, newState) => {
          if (transaction.docChanged || transaction.getMeta("forceDecorationUpdate") || oldState.doc !== newState.doc) {
            return getDecorations(newState.doc, name);
          }
          return decorationSet.map(transaction.mapping, transaction.doc);
        },
      },
      props: {
        decorations(state) {
          return customLowlightPluginKey.getState(state);
        },
      },
    });

    return [plugin];
  },
});
