import { daysAgoLabel, type RelatedSession } from "../../lib/recall";
import type { LearningSession } from "../../types";
import "./RecallBanner.css";

interface RecallBannerProps {
  related: RelatedSession[];
  onOpenSession: (session: LearningSession) => void;
  onDismiss: () => void;
}

export default function RecallBanner({ related, onOpenSession, onDismiss }: RecallBannerProps) {
  if (related.length === 0) return null;
  const top = related[0];
  const tag = top.sharedTags[0];

  return (
    <div className="recall-banner">
      <p>
        You explored <strong>{tag}</strong> {daysAgoLabel(top.session.updatedAt)} in "
        {top.session.pageTitle}" — review first?
      </p>
      <div className="recall-banner-actions">
        <button onClick={() => onOpenSession(top.session)}>Review</button>
        <button onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
