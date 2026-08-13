"use client";

import React, { useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";

const TEXT_COLORS = [
  { name: "Default (White)", color: "#ffffff" },
  { name: "Slate", color: "#94a3b8" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Green", color: "#10b981" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", color: "transparent" },
  { name: "Yellow", color: "#ca8a0455" },
  { name: "Green", color: "#16a34a55" },
  { name: "Blue", color: "#2563eb55" },
  { name: "Purple", color: "#9333ea55" },
  { name: "Red", color: "#dc262655" },
  { name: "Orange", color: "#ea580c55" },
];

interface PickerProps {
  editor: Editor;
  size?: "sm" | "xs";
}

export const TextColorPicker = ({ editor, size = "sm" }: PickerProps) => {
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const currentColor = editor.getAttributes("textStyle").color || "#ffffff";

  const setTextColor = (color: string) => {
    if (color === "#ffffff") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  const safeHexColor = currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#3b82f6";

  return (
    <Popover placement="bottom-start" offset={6}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded-lg text-xs text-blue-100 hover:bg-dark-400 hover:text-white transition-colors cursor-pointer",
            size === "xs" ? "h-7 px-1.5" : "h-8 px-2"
          )}
          title="Text Color"
        >
          <span className="flex flex-col items-center justify-center font-bold font-serif text-sm leading-none">
            A
            <span
              className="w-3.5 h-0.75 rounded-full mt-0.5"
              style={{ backgroundColor: currentColor }}
            />
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3 opacity-60"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 bg-dark-200 border border-dark-400 rounded-xl shadow-2xl backdrop-blur-xl z-160">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
              Text Color
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setTextColor(c.color)}
                  className={cn(
                    "size-7 rounded-lg flex items-center justify-center transition-transform hover:scale-115 border border-white/10 cursor-pointer",
                    currentColor === c.color && "ring-2 ring-blue-500 scale-110"
                  )}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                >
                  {currentColor === c.color && (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        c.color === "#ffffff" ? "text-black" : "text-white"
                      )}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Full Spectrum Browser Color Picker */}
          <div className="pt-2.5 border-t border-dark-400/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                onClick={() => customColorInputRef.current?.click()}
                className="relative size-7 rounded-lg border border-white/20 cursor-pointer overflow-hidden flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)",
                }}
                title="Pick custom color"
              >
                <input
                  ref={customColorInputRef}
                  type="color"
                  value={safeHexColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="opacity-0 absolute inset-0 size-full cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-200">Custom Color</span>
                <span className="text-[10px] text-gray-400 font-mono">{currentColor}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => customColorInputRef.current?.click()}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors cursor-pointer"
            >
              Palette
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const HighlightPicker = ({ editor, size = "sm" }: PickerProps) => {
  const customHighlightInputRef = useRef<HTMLInputElement>(null);
  const currentHighlight = editor.getAttributes("highlight").color || "transparent";

  const setHighlightColor = (color: string) => {
    if (color === "transparent") {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  const safeHexHighlight =
    currentHighlight.startsWith("#") && currentHighlight.length >= 7
      ? currentHighlight.slice(0, 7)
      : "#ca8a04";

  return (
    <Popover placement="bottom-start" offset={6}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded-lg text-xs text-blue-100 hover:bg-dark-400 hover:text-white transition-colors cursor-pointer",
            size === "xs" ? "h-7 px-1.5" : "h-8 px-2"
          )}
          title="Highlight Color"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            style={
              currentHighlight !== "transparent"
                ? { color: currentHighlight.replace("55", "") }
                : {}
            }
          >
            <path d="m9 11-6 6v3h3l6-6" />
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3 opacity-60"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 bg-dark-200 border border-dark-400 rounded-xl shadow-2xl backdrop-blur-xl z-160">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
              Highlight Color
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setHighlightColor(c.color)}
                  className={cn(
                    "h-7 rounded-md flex items-center justify-center transition-transform hover:scale-110 border border-white/15 cursor-pointer text-xs font-medium",
                    currentHighlight === c.color && "ring-2 ring-blue-500 scale-105",
                    c.color === "transparent" && "bg-dark-300 text-gray-400"
                  )}
                  style={c.color !== "transparent" ? { backgroundColor: c.color } : {}}
                  title={c.name}
                >
                  {c.color === "transparent" ? (
                    "None"
                  ) : currentHighlight === c.color ? (
                    <span className="text-xs text-white font-bold">✓</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Full Spectrum Browser Color Picker for Highlight */}
          <div className="pt-2.5 border-t border-dark-400/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                onClick={() => customHighlightInputRef.current?.click()}
                className="relative size-7 rounded-lg border border-white/20 cursor-pointer overflow-hidden flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)",
                }}
                title="Pick custom highlight color"
              >
                <input
                  ref={customHighlightInputRef}
                  type="color"
                  value={safeHexHighlight}
                  onChange={(e) => setHighlightColor(e.target.value + "55")}
                  className="opacity-0 absolute inset-0 size-full cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-gray-200">Custom Highlight</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {currentHighlight === "transparent" ? "None" : currentHighlight}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => customHighlightInputRef.current?.click()}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors cursor-pointer"
            >
              Palette
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const ColorPicker = TextColorPicker;
