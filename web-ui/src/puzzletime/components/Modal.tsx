/* A centered modal sheet (Help / Stats), matching the iOS half-sheet feel. */
import React, { useEffect } from "react";
import { CloseIcon } from "./icons";

interface ModalProps {
  title: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, accent, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pt-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="pt-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pt-modal-head">
          <h2 style={accent ? { color: accent } : undefined}>{title}</h2>
          <button className="pt-icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>
        <div className="pt-modal-body">{children}</div>
      </div>
    </div>
  );
}
