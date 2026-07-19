import { groupSessionsByTag } from "../../lib/recall";
import type { LearningSession } from "../../types";
import "./Connections.css";

interface ConnectionsProps {
  sessions: LearningSession[];
  onSelect: (session: LearningSession) => void;
}

export default function Connections({ sessions, onSelect }: ConnectionsProps) {
  const clusters = groupSessionsByTag(sessions);

  if (clusters.length === 0) {
    return (
      <p className="connections-empty">
        No connections yet — once two sessions share a concept tag, they'll show up here linked
        together.
      </p>
    );
  }

  return (
    <div className="connections">
      {clusters.map((cluster) => (
        <div key={cluster.tag} className="connections-group">
          <div className="connections-tag">
            <span className="connections-tag-dot" aria-hidden="true" />
            {cluster.tag}
            <span className="connections-tag-count">{cluster.sessions.length}</span>
          </div>
          <ul className="connections-list">
            {cluster.sessions.map((session) => (
              <li key={session.id}>
                <button className="connections-item" onClick={() => onSelect(session)}>
                  {session.pageTitle || session.url}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
