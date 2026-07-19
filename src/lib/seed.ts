import type { LearningSession } from "../types";
import { seedSessions } from "./storage";

const DAY = 86_400_000;
const now = Date.now();

const DEMO_TEMPLATES: Omit<LearningSession, "id">[] = [
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication",
    pageTitle: "HTTP Authentication - MDN",
    createdAt: now - 8 * DAY,
    updatedAt: now - 8 * DAY,
    notes: "- first page = login\n- verifies who you are\n- password vs token",
    aiExpansion:
      "**Beginner explanation**\n\nAuthentication is the process of verifying a user's identity — answering \"who are you?\" before letting them in.\n\n**Common methods**\n- Username & password\n- Google OAuth\n- OTP\n- Biometrics\n\n**Related concepts**\nAuthorization (what you can access once verified), sessions, cookies.",
    tags: ["authentication", "login", "identity"],
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies",
    pageTitle: "Using HTTP cookies - MDN",
    createdAt: now - 5 * DAY,
    updatedAt: now - 5 * DAY,
    notes: "- cookie stores session id\n- server remembers you're logged in",
    aiExpansion:
      "**Beginner explanation**\n\nA session cookie lets the server recognize you across requests after you've already authenticated, so you don't log in on every page.\n\n**Related concepts**\nAuthentication, tokens, JWT.",
    tags: ["sessions", "cookies", "authentication"],
  },
  {
    url: "https://www.oauth.com/oauth2-servers/getting-ready/",
    pageTitle: "OAuth 2.0 — Getting Ready",
    createdAt: now - 3 * DAY,
    updatedAt: now - 3 * DAY,
    notes: "- google auth\n- lets app access your account without your password",
    aiExpansion:
      "**Beginner explanation**\n\nOAuth 2.0 lets a third-party app access parts of your account (like your Google profile) without ever seeing your password.\n\n**Related concepts**\nAuthentication, authorization, access tokens.",
    tags: ["oauth", "authentication", "authorization"],
  },
];

export async function loadDemoData(): Promise<void> {
  const sessions: LearningSession[] = DEMO_TEMPLATES.map((template) => ({
    ...template,
    id: crypto.randomUUID(),
  }));
  await seedSessions(sessions);
}
