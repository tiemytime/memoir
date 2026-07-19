import { useEffect, useState } from "react";
import { getApiKey, setApiKey } from "../../lib/gemini";
import { loadDemoData } from "../../lib/seed";
import "./Settings.css";

interface SettingsProps {
  onClose: () => void;
  onSeeded: () => void;
}

export default function Settings({ onClose, onSeeded }: SettingsProps) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    getApiKey().then(setKey);
  }, []);

  async function handleSave() {
    await setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleLoadDemoData() {
    setSeeding(true);
    try {
      await loadDemoData();
      onSeeded();
      setSeeded(true);
      setTimeout(() => setSeeded(false), 1500);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="settings">
      <label className="settings-label">
        Gemini API key
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste your AI Studio API key"
        />
      </label>
      <div className="settings-actions">
        <button onClick={handleSave}>{saved ? "Saved" : "Save"}</button>
        <button onClick={onClose}>Close</button>
      </div>
      <p className="settings-hint">
        Get a free key at aistudio.google.com/apikey. Stored only in this browser, sent only to
        Gemini.
      </p>

      <hr className="settings-divider" />

      <div>
        <button onClick={handleLoadDemoData} disabled={seeding}>
          {seeded ? "Loaded" : seeding ? "Loading…" : "Load demo data"}
        </button>
        <p className="settings-hint">
          Adds 3 realistic past learning sessions (Authentication, Cookies, OAuth) so the memory
          recall banner has something to find.
        </p>
      </div>
    </div>
  );
}
