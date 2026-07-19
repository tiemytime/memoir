import { useEffect, useState } from "react";
import type { LearningSession } from "../types";
import { listSessions } from "../lib/storage";
import { daysAgoLabel } from "../lib/recall";

export default function App() {
  const [sessions, setSessions] = useState<LearningSession[] | null>(null);

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  async function openWorkspace() {
    const win = await chrome.windows.getCurrent();
    if (win.id !== undefined) {
      await chrome.sidePanel.open({ windowId: win.id });
    }
    window.close();
  }

  const latest = sessions?.[0];

  return (
    <div className="popup">
      <div className="popup-brand">
        <span className="popup-dot" aria-hidden="true" />
        <span className="popup-title">Learning Memory</span>
      </div>
      <p className="popup-tagline">
        Write your first thought. Let AI expand it. Never lose the thread.
      </p>

      <div className="popup-stat">
        {sessions === null ? (
          <span className="popup-stat-loading">Loading…</span>
        ) : sessions.length === 0 ? (
          <span>No sessions yet — start your first one.</span>
        ) : (
          <>
            <span className="popup-stat-count">
              {sessions.length} learning session{sessions.length === 1 ? "" : "s"} saved
            </span>
            {latest && (
              <span className="popup-stat-latest">
                Last: {latest.pageTitle} · {daysAgoLabel(latest.updatedAt)}
              </span>
            )}
          </>
        )}
      </div>

      <button className="popup-open-button" onClick={openWorkspace}>
        Open Workspace →
      </button>
    </div>
  );
}
