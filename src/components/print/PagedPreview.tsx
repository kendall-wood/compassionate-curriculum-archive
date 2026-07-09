"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Runs Paged.js over the hidden #cc-book-source markup and renders the
// paginated result into #cc-book-pages. Paged.js polyfills CSS Paged Media
// (@page margins, :left/:right mirroring, margin-box page numbers,
// target-counter for the TOC) which Chrome does not support natively.
export function PagedPreview() {
  const started = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [pageCount, setPageCount] = useState(0);
  const t = useTranslations("print");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        // The book is always light-theme and unzoomed regardless of the
        // reader's saved web preferences.
        document.documentElement.classList.remove("dark");
        document.documentElement.style.setProperty("--zoom", "1");

        // Imported lazily: pagedjs touches browser globals at import time.
        const { Previewer, Handler, registerHandlers } = await import(
          "pagedjs"
        );

        // Keep-with-next enforcement. Paged.js does not reliably honor
        // break-inside: avoid on .cc-activity-lead (heading + rule + pill +
        // first block), so when a page break lands inside a lead we move
        // the break to just before it and drop the partial fragment from
        // the current page. Guard: if the lead already starts at the top
        // of the page (nothing fit above it), let it split normally to
        // avoid an infinite relayout loop.
        class KeepLeadWithNext extends Handler {
          afterPageLayout(
            pageFragment: Element,
            _page: unknown,
            breakToken: { node?: Node; offset?: number } | undefined
          ) {
            if (!breakToken || !breakToken.node) return;
            const el =
              breakToken.node.nodeType === Node.ELEMENT_NODE
                ? (breakToken.node as Element)
                : breakToken.node.parentElement;
            const lead = el?.closest?.(".cc-activity-lead");
            if (!lead) return;

            const ref = lead.getAttribute("data-ref");
            if (!ref) return;
            const partial = pageFragment.querySelector(
              `[data-ref="${ref}"]`
            ) as HTMLElement | null;
            if (!partial) return;

            const area = pageFragment.querySelector(".pagedjs_page_content");
            if (area) {
              const delta =
                partial.getBoundingClientRect().top -
                area.getBoundingClientRect().top;
              if (delta < 40) return; // lead is already first on the page
            }

            breakToken.node = lead;
            breakToken.offset = undefined;
            partial.remove();
          }
        }
        registerHandlers(KeepLeadWithNext);

        const source = document.getElementById("cc-book-source");
        const target = document.getElementById("cc-book-pages");
        if (!source || !target) throw new Error("print source/target missing");

        const previewer = new Previewer();
        const flow = await previewer.preview(
          source.innerHTML,
          ["/print/book.css"],
          target
        );
        setPageCount(flow.total);
        setStatus("ready");
        // Signal for scripts/export-pdf.mjs, which waits on this before
        // asking Chrome to print.
        (window as unknown as Record<string, unknown>).__ccBookReady =
          flow.total;
      } catch (err) {
        console.error("Paged.js preview failed", err);
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div
      className="cc-no-print"
      style={{
        position: "fixed",
        top: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.75rem 1.25rem",
        background: "#000",
        color: "#fff",
        fontSize: "0.875rem",
      }}
    >
      <span>
        {status === "loading" && t("preparing")}
        {status === "ready" && t("pages", { count: pageCount })}
        {status === "error" && t("error")}
      </span>
      <button
        type="button"
        onClick={() => window.print()}
        disabled={status !== "ready"}
        style={{
          border: "1px solid #fff",
          padding: "0.375rem 0.875rem",
          background: status === "ready" ? "#fff" : "transparent",
          color: status === "ready" ? "#000" : "#888",
        }}
      >
        {t("saveAsPdf")}
      </button>
    </div>
  );
}
