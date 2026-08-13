"use client";

import Image from "next/image";
import { Button } from "./ui/Button";
import Loader from "./Loader";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "doc" | "folder" | "search";
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
}

const EmptyState = ({
  title = "No documents or folders yet",
  description = "Get started by creating a new document to start collaborating, or create folders to keep organized.",
  icon = "doc",
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isLoading = false,
}: EmptyStateProps) => {
  return (
    <div className="flex w-full max-w-182.5 flex-col items-center justify-center rounded-2xl bg-dark-200/60 backdrop-blur-md border border-white/5 px-6 py-12 sm:px-10 sm:py-16 text-center my-4 shadow-xl shadow-black/20 transition-all">
      {/* Decorative Icon Glow Frame */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-blue-500/15 blur-xl pointer-events-none" />
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-dark-350/90 border border-blue-500/30 shadow-inner shadow-blue-500/10">
          {icon === "search" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          ) : icon === "folder" ? (
            <Image
              src="/assets/icons/folder.svg"
              alt="Folder"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
          ) : (
            <Image
              src="/assets/icons/doc.svg"
              alt="Document"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
          )}
        </div>
      </div>

      {/* Text Info */}
      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
        {description}
      </p>

      {/* Action Buttons */}
      {(onAction || onSecondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAction && actionText && (
            <Button
              type="button"
              onClick={onAction}
              disabled={isLoading}
              className="gradient-blue text-white text-sm font-semibold h-10 px-5 rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader text="Creating..." size={16} />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{actionText}</span>
                </>
              )}
            </Button>
          )}

          {onSecondaryAction && secondaryActionText && (
            <Button
              type="button"
              variant="outline"
              onClick={onSecondaryAction}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl border border-dark-400 bg-dark-300/80 text-sm font-medium text-blue-100 hover:bg-dark-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
            >
              <Image
                src="/assets/icons/folder.svg"
                alt="Folder"
                width={14}
                height={14}
              />
              <span>{secondaryActionText}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
