"use client";

import React, { useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";

export const ImageNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
  getPos,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({
    top: "-48px",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showSettings && !selected) return;

    const updatePosition = () => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const stickyThreshold = 140; // Top header & editor sticky toolbar offset

      if (rect.top < stickyThreshold && rect.bottom > stickyThreshold + 60) {
        const offset = stickyThreshold - rect.top + 8;
        const maxOffset = rect.height - 48;
        setToolbarStyle({
          top: `${Math.min(offset, maxOffset)}px`,
        });
      } else {
        setToolbarStyle({
          top: "-48px",
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showSettings, selected]);

  const isEditable = editor.isEditable;
  const currentWidth = node.attrs.width || "100%";
  const currentAlignment = node.attrs.alignment || "center";

  const handleResize = (w: string) => {
    updateAttributes({ width: w });
  };

  const handleAlign = (alignment: string) => {
    updateAttributes({ alignment });
  };

  const handleDuplicate = () => {
    if (typeof getPos === "function") {
      const pos = getPos();
      if (typeof pos === "number") {
        editor
          .chain()
          .focus()
          .insertContentAt(pos + node.nodeSize, {
            type: "image",
            attrs: { ...node.attrs },
          })
          .run();
      }
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            updateAttributes({ src: data.url });
            setIsUploading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Cloudinary upload failed, using base64 fallback:", err);
      }
      updateAttributes({ src: base64 });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <NodeViewWrapper
      className={cn(
        "relative my-6 pt-2 flex flex-col group select-none",
        node.attrs.alignment === "left" && "items-start",
        node.attrs.alignment === "right" && "items-end",
        (!node.attrs.alignment || node.attrs.alignment === "center") && "items-center"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        ref={imageContainerRef}
        className={cn(
          "relative inline-block rounded-xl overflow-visible transition-all duration-200",
          selected && "ring-2 ring-blue-500 shadow-xl"
        )}
        style={{ width: currentWidth, maxWidth: "100%" }}
        onMouseEnter={() => setShowSettings(true)}
        onMouseLeave={() => setShowSettings(false)}
      >
        {/* Floating Settings Bar above Image */}
        {isEditable && (showSettings || selected) && (
          <div
            style={toolbarStyle}
            className="absolute inset-s-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 bg-dark-200/95 border border-dark-400 backdrop-blur-md rounded-xl shadow-2xl transition-all duration-75 whitespace-nowrap"
          >
            {/* Size Options */}
            <div className="flex items-center gap-0.5 pe-1 border-e border-dark-400">
              <button
                type="button"
                onClick={() => handleResize("25%")}
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded font-medium transition-colors",
                  currentWidth === "25%"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Small (25%)"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleResize("50%")}
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded font-medium transition-colors",
                  currentWidth === "50%"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Medium (50%)"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleResize("75%")}
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded font-medium transition-colors",
                  currentWidth === "75%"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Large (75%)"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handleResize("100%")}
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded font-medium transition-colors",
                  currentWidth === "100%"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Full width (100%)"
              >
                100%
              </button>
            </div>

            {/* Alignment Options */}
            <div className="flex items-center gap-0.5 pe-1 border-e border-dark-400">
              <button
                type="button"
                onClick={() => handleAlign("left")}
                className={cn(
                  "p-1 rounded transition-colors",
                  currentAlignment === "left"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Align Left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                >
                  <line x1="21" x2="3" y1="6" y2="6" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                  <line x1="17" x2="3" y1="18" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("center")}
                className={cn(
                  "p-1 rounded transition-colors",
                  currentAlignment === "center"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Align Center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                >
                  <line x1="21" x2="3" y1="6" y2="6" />
                  <line x1="17" x2="7" y1="12" y2="12" />
                  <line x1="19" x2="5" y1="18" y2="18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlign("right")}
                className={cn(
                  "p-1 rounded transition-colors",
                  currentAlignment === "right"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-dark-300"
                )}
                title="Align Right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                >
                  <line x1="21" x2="3" y1="6" y2="6" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                  <line x1="21" x2="7" y1="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Replace Button */}
            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={isUploading}
              className="p-1 text-gray-300 hover:text-white hover:bg-dark-300 rounded transition-colors"
              title="Replace image"
            >
              {isUploading ? (
                <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              )}
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1 text-gray-300 hover:text-white hover:bg-dark-300 rounded transition-colors"
              title="Duplicate image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => deleteNode()}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
              title="Delete image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}

        {/* Image Element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || "Uploaded image"}
          title={node.attrs.title}
          className="w-full h-auto rounded-xl object-contain block shadow-md border border-dark-400/50"
        />
      </div>
    </NodeViewWrapper>
  );
};

export const CustomImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) =>
          element.style.width || element.getAttribute("width") || "100%",
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width}; max-width: 100%;`,
        }),
      },
      alignment: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
