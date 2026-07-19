import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { PageContext } from "../../lib/context";
import type { LearningSession } from "../../types";
import "./Companion.css";

interface CompanionProps {
  session: LearningSession;
  pageContext: PageContext | null;
  onRefreshContext: () => void;
  expanding: boolean;
  expandError: string | null;
}

export default function Companion({
  session,
  pageContext,
  onRefreshContext,
  expanding,
  expandError,
}: CompanionProps) {
  const expansionHtml = useMemo(() => {
    if (!session.aiExpansion) return "";
    return DOMPurify.sanitize(marked.parse(session.aiExpansion, { async: false }));
  }, [session.aiExpansion]);

  return (
    <div className="companion">
      <div className="panel-label">AI Companion</div>

      <div className="context-box">
        <div className="context-box-header">
          <span>Reading this page</span>
          <button className="context-refresh" onClick={onRefreshContext}>
            ⟳ Refresh
          </button>
        </div>
        {pageContext ? (
          <>
            <p className="context-title">{pageContext.title}</p>
            {pageContext.selectionText && (
              <p className="context-selection">"{pageContext.selectionText.slice(0, 140)}"</p>
            )}
          </>
        ) : (
          <p className="context-empty">No page context captured yet.</p>
        )}
      </div>

      {expanding && (
        <div className="companion-status">
          <span className="spinner" aria-hidden="true" />
          Thinking through your notes…
        </div>
      )}
      {expandError && <p className="companion-error">{expandError}</p>}
      {!expanding && !expandError && session.aiExpansion && (
        <div className="companion-expansion" dangerouslySetInnerHTML={{ __html: expansionHtml }} />
      )}
      {!expanding && !expandError && !session.aiExpansion && (
        <div className="companion-empty">
          <p className="companion-placeholder">
            Write a few notes on the left, then click <strong>Expand</strong>.
          </p>
          <p className="companion-subtext">
            The AI reads this page, your notes, and anything you've highlighted — then builds on
            what you started, instead of replacing it.
          </p>
        </div>
      )}
    </div>
  );
}
