import React from "react";
import ReactDOM from "react-dom";
import Spinner from "./Spinner";

export default function BlockingOverlay({
  open,
  variant = "loading",
  message = "Loading data…",
}) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[min(92vw,720px)] rounded-2xl bg-white/80 shadow-xl"
      >
        <div className="p-10 text-center">
          <p
            className={
              variant === "error"
                ? "mb-6 text-red font-semibold"
                : "mb-6 text-gray-800"
            }
          >
            {variant === "error"
              ? (message || "Sorry, the server is busy now. Please try later.")
              : message}
          </p>

          <div className="mx-auto flex items-center justify-center">
            <Spinner size="8" />
            <span className="ml-2 text-sm text-gray-700">please wait...</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}