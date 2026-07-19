export interface PageContext {
  title: string;
  url: string;
  selectionText: string;
}

const BLOCKED_HOSTS = [
  "google.com",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "yandex.com",
  "baidu.com",
];

const BLOCKED_URL_PREFIXES = ["chrome://", "chrome-extension://", "edge://", "about:", "data:"];

/** Returns why this page isn't valid learning content, or null if it's fine. */
export function getBlockedPageReason(url: string): string | null {
  if (!url) return "No page detected.";
  if (BLOCKED_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return "This is a browser page, not learning content — open the page you're actually learning from first.";
  }
  try {
    const bareHost = new URL(url).hostname.replace(/^www\./, "");
    if (BLOCKED_HOSTS.includes(bareHost)) {
      return "This is a search engine page, not learning content — open the page you're actually learning from first.";
    }
  } catch {
    return "Couldn't read this page's URL.";
  }
  return null;
}

export async function getActiveTabContext(): Promise<PageContext | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      title: document.title,
      url: location.href,
      selectionText: window.getSelection()?.toString() ?? "",
    }),
  });

  return (injection?.result as PageContext | undefined) ?? null;
}
