"use client";

import { useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AdminButton } from "@/app/admin/AdminButton";
import { XIcon } from "@/app/admin/AdminIcons";

type AdminDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AdminDrawer({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AdminDrawerProps) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200]" data-lenis-prevent>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-hidden bg-white text-black shadow-2xl"
        data-lenis-prevent
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-medium text-black">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
            )}
          </div>
          <AdminButton
            variant="icon"
            aria-label="Close drawer"
            onClick={onClose}
            icon={<XIcon />}
          />
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 touch-pan-y overflow-y-scroll overscroll-contain px-5 py-5 [-webkit-overflow-scrolling:touch]"
          onWheel={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-neutral-100 px-5 py-4">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
