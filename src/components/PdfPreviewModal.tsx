"use client";

export function PdfPreviewModal({
  open,
  onClose,
  pdfUrl,
  downloadLabel,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  downloadLabel: string;
  closeLabel: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fg/60"
      onClick={onClose}
    >
      <div
        className="bg-bg border border-fg flex flex-col"
        style={{ width: "min(860px, 95vw)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-fg shrink-0">
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-[0.5rem] px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors"
          >
            {downloadLabel}
            <span aria-hidden="true">↓</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>

        {/* PDF embed — height shows ~2 pages at letter size */}
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full grow min-h-0"
          style={{ height: "75vh" }}
          aria-label="PDF preview"
        >
          <div className="p-[2rem] text-[1.25rem] text-fg">
            Your browser cannot preview PDFs inline.{" "}
            <a
              href={pdfUrl}
              download
              className="underline decoration-fg underline-offset-2 hover:text-accent hover:decoration-accent transition-colors"
            >
              Download the PDF
            </a>{" "}
            instead.
          </div>
        </object>
      </div>
    </div>
  );
}
