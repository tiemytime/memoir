import type { LearningSession } from "../types";

export interface RelatedSession {
  session: LearningSession;
  sharedTags: string[];
}

export function findRelatedSessions(
  currentSessionId: string,
  currentTags: string[],
  allSessions: LearningSession[],
): RelatedSession[] {
  if (currentTags.length === 0) return [];
  const currentSet = new Set(currentTags);

  return allSessions
    .filter((session) => session.id !== currentSessionId)
    .map((session) => ({
      session,
      sharedTags: session.tags.filter((tag) => currentSet.has(tag)),
    }))
    .filter((related) => related.sharedTags.length > 0)
    .sort((a, b) => b.session.updatedAt - a.session.updatedAt);
}

export function daysAgoLabel(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
