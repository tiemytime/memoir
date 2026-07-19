import type { LearningSession } from "../types";

const INDEX_KEY = "sessionIds";
const sessionKey = (id: string) => `session:${id}`;

// Serializes all storage mutations so concurrent create/update/delete calls
// can't race on the shared sessionIds index array.
let writeQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(op);
  writeQueue = result.catch(() => undefined);
  return result;
}

async function getIndex(): Promise<string[]> {
  const { [INDEX_KEY]: ids } = await chrome.storage.local.get(INDEX_KEY);
  return Array.isArray(ids) ? ids : [];
}

async function setIndex(ids: string[]): Promise<void> {
  await chrome.storage.local.set({ [INDEX_KEY]: ids });
}

export async function createSession(
  data: Pick<LearningSession, "url" | "pageTitle">,
): Promise<LearningSession> {
  return enqueue(async () => {
    const now = Date.now();
    const session: LearningSession = {
      id: crypto.randomUUID(),
      url: data.url,
      pageTitle: data.pageTitle,
      createdAt: now,
      updatedAt: now,
      notes: "",
      tags: [],
    };
    await chrome.storage.local.set({ [sessionKey(session.id)]: session });
    const ids = await getIndex();
    await setIndex([session.id, ...ids]);
    return session;
  });
}

export async function getSession(id: string): Promise<LearningSession | undefined> {
  const { [sessionKey(id)]: session } = await chrome.storage.local.get(sessionKey(id));
  return session as LearningSession | undefined;
}

export async function listSessions(): Promise<LearningSession[]> {
  const ids = await getIndex();
  if (ids.length === 0) return [];
  const keys = ids.map(sessionKey);
  const result = await chrome.storage.local.get(keys);
  return ids
    .map((id) => result[sessionKey(id)] as LearningSession | undefined)
    .filter((s): s is LearningSession => Boolean(s))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<LearningSession, "id" | "createdAt">>,
): Promise<LearningSession | undefined> {
  return enqueue(async () => {
    const existing = await getSession(id);
    if (!existing) return undefined;
    const updated: LearningSession = {
      ...existing,
      ...patch,
      updatedAt: Date.now(),
    };
    await chrome.storage.local.set({ [sessionKey(id)]: updated });
    return updated;
  });
}

/**
 * Writes fully-formed sessions as-is (preserving their own timestamps), unlike
 * createSession which always stamps "now". Used only by dev/demo seeding.
 */
export async function seedSessions(newSessions: LearningSession[]): Promise<void> {
  return enqueue(async () => {
    const entries: Record<string, LearningSession> = {};
    for (const session of newSessions) entries[sessionKey(session.id)] = session;
    await chrome.storage.local.set(entries);
    const ids = await getIndex();
    const newIds = newSessions.map((session) => session.id);
    await setIndex([...newIds, ...ids.filter((id) => !newIds.includes(id))]);
  });
}

export async function deleteSession(id: string): Promise<void> {
  return enqueue(async () => {
    await chrome.storage.local.remove(sessionKey(id));
    const ids = await getIndex();
    await setIndex(ids.filter((existingId) => existingId !== id));
  });
}
