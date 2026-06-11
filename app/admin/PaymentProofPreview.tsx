"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PaymentProofPreviewProps = {
  url: string;
  alt: string;
  thumbnailClassName?: string;
};

function isPdfUrl(url: string) {
  return url.toLowerCase().includes(".pdf");
}

export function PaymentProofPreview({
  url,
  alt,
  thumbnailClassName = "relative h-32 w-40",
}: PaymentProofPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (isPdfUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block shrink-0 overflow-hidden rounded-md border border-neutral-200 transition-colors hover:border-purple-950"
      >
        <div className="flex h-32 w-40 items-center justify-center bg-neutral-50 text-xs font-medium text-neutral-600">
          View PDF
        </div>
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group block shrink-0 overflow-hidden rounded-md border border-neutral-200 text-left transition-colors hover:border-purple-950"
        aria-label={`View payment proof for ${alt}`}
      >
        <div className={thumbnailClassName}>
          <Image
            src={url}
            alt={alt}
            fill
            sizes="160px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <span className="block bg-neutral-50 px-3 py-2 text-center text-xs font-medium text-neutral-600 group-hover:text-purple-950">
          View proof
        </span>
      </button>

      {isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4"
              onClick={() => setIsOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Payment proof preview"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Close
              </button>
              <div
                className="relative max-h-[85vh] max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  src={url}
                  alt={alt}
                  width={1200}
                  height={1600}
                  className="max-h-[85vh] w-auto rounded-lg object-contain"
                  unoptimized
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
