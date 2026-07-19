import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Learning Memory",
  description: "A memory layer for learning — write your own thoughts first, let AI expand them, and never lose track of what you learned.",
  version: "0.1.0",
  icons: {
    16: "public/icons/icon16.png",
    48: "public/icons/icon48.png",
    128: "public/icons/icon128.png",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      16: "public/icons/icon16.png",
      48: "public/icons/icon48.png",
      128: "public/icons/icon128.png",
    },
  },
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  permissions: ["storage", "unlimitedStorage", "sidePanel", "scripting", "activeTab"],
  host_permissions: [
    "https://generativelanguage.googleapis.com/*",
    "http://*/*",
    "https://*/*",
  ],
});
