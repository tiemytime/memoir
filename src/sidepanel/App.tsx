import { useEffect, useState } from "react";
import type { LearningSession } from "../types";
import { createSession, deleteSession, listSessions, updateSession } from "../lib/storage";
import { getActiveTabContext, getBlockedPageReason, type PageContext } from "../lib/context";
import { callGemini, getApiKey } from "../lib/gemini";
import { findRelatedSessions, type RelatedSession } from "../lib/recall";
import Notebook from "./components/Notebook";
import Companion from "./components/Companion";
import History from "./components/History";
import Settings from "./components/Settings";
import RecallBanner from "./components/RecallBanner";
import Connections from "./components/Connections";

type View = "notebook" | "history" | "connections" | "settings";

export default function App() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [view, setView] = useState<View>("notebook");
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);
  const [relatedSessions, setRelatedSessions] = useState<RelatedSession[]>([]);

  useEffect(() => {
    refreshSessions();
  }, []);

  async function refreshSessions() {
    setSessions(await listSessions());
  }

  async function refreshContext() {
    setPageContext(await getActiveTabContext());
  }

  async function handleNewSession() {
    const context = await getActiveTabContext();
    const reason = getBlockedPageReason(context?.url ?? "");
    if (reason) {
      setBlockedReason(reason);
      return;
    }
    setBlockedReason(null);
    setExpandError(null);
    setRelatedSessions([]);
    setPageContext(context);
    const session = await createSession({
      url: context?.url ?? "",
      pageTitle: context?.title ?? "Untitled page",
    });
    setCurrentSession(session);
    setView("notebook");
    await refreshSessions();
  }

  async function handleNotesChange(notes: string) {
    if (!currentSession) return;
    const updated = await updateSession(currentSession.id, { notes });
    if (updated) {
      setCurrentSession(updated);
      await refreshSessions();
    }
  }

  async function handleExpand(notes: string) {
    if (!currentSession) return;
    setExpandError(null);

    const apiKey = await getApiKey();
    if (!apiKey) {
      setExpandError("Add your Gemini API key in Settings first.");
      return;
    }

    setExpanding(true);
    try {
      const result = await callGemini({
        apiKey,
        notes,
        pageTitle: currentSession.pageTitle,
        selectionText: pageContext?.selectionText,
      });
      const updated = await updateSession(currentSession.id, {
        aiExpansion: result.expansion,
        tags: result.tags,
      });
      if (updated) {
        setCurrentSession(updated);
        const allSessions = await listSessions();
        setRelatedSessions(findRelatedSessions(updated.id, result.tags, allSessions));
        await refreshSessions();
      }
    } catch (err) {
      setExpandError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setExpanding(false);
    }
  }

  function handleSelectSession(session: LearningSession) {
    setCurrentSession(session);
    setPageContext({ title: session.pageTitle, url: session.url, selectionText: "" });
    setExpandError(null);
    setRelatedSessions([]);
    setView("notebook");
  }

  async function handleDeleteSession(id: string) {
    await deleteSession(id);
    if (currentSession?.id === id) setCurrentSession(null);
    await refreshSessions();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-dot" aria-hidden="true" />
          <h1 className="app-title">Learning Memory</h1>
        </div>
        <div className="app-header-actions">
          <button
            className="btn btn-ghost"
            onClick={() => setView(view === "settings" ? "notebook" : "settings")}
          >
            ⚙
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setView(view === "connections" ? "notebook" : "connections")}
          >
            {view === "connections" ? "← Back" : "Connections"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setView(view === "history" ? "notebook" : "history")}
          >
            {view === "history" ? "← Back" : "History"}
          </button>
          <button className="btn btn-primary" onClick={handleNewSession}>
            + New Session
          </button>
        </div>
      </header>

      {view === "settings" ? (
        <Settings onClose={() => setView("notebook")} onSeeded={refreshSessions} />
      ) : view === "history" ? (
        <History
          sessions={sessions}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
        />
      ) : view === "connections" ? (
        <Connections sessions={sessions} onSelect={handleSelectSession} />
      ) : currentSession ? (
        <div className="workspace">
          <RecallBanner
            related={relatedSessions}
            onOpenSession={handleSelectSession}
            onDismiss={() => setRelatedSessions([])}
          />
          <Notebook
            session={currentSession}
            onNotesChange={handleNotesChange}
            onExpand={handleExpand}
            expanding={expanding}
          />
          <Companion
            session={currentSession}
            pageContext={pageContext}
            onRefreshContext={refreshContext}
            expanding={expanding}
            expandError={expandError}
          />
        </div>
      ) : (
        <div className="empty-state">
          <p>Click "New Session" to start learning on this page.</p>
          {blockedReason && <p className="empty-state-warning">{blockedReason}</p>}
        </div>
      )}
    </div>
  );
}
