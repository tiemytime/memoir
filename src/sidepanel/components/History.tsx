import type { LearningSession } from "../../types";

interface HistoryProps {
  sessions: LearningSession[];
  onSelect: (session: LearningSession) => void;
  onDelete: (id: string) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function History({ sessions, onSelect, onDelete }: HistoryProps) {
  if (sessions.length === 0) {
    return <p className="history-empty">No learning sessions yet.</p>;
  }

  return (
    <ul className="history-list">
      {sessions.map((session) => (
        <li key={session.id} className="history-item">
          <button className="history-item-main" onClick={() => onSelect(session)}>
            <span className="history-item-title">{session.pageTitle || session.url}</span>
            <span className="history-item-meta">
              {formatDate(session.updatedAt)}
              {session.tags.length > 0 ? ` · ${session.tags.join(", ")}` : ""}
            </span>
            <span className="history-item-notes">{session.notes.slice(0, 80)}</span>
          </button>
          <button
            className="history-item-delete"
            aria-label="Delete session"
            onClick={() => onDelete(session.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
