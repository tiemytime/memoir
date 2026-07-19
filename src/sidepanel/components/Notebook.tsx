import { useEffect, useRef, useState } from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "./Notebook.css";
import type { LearningSession } from "../../types";

interface NotebookProps {
  session: LearningSession;
  onNotesChange: (notes: string) => void;
  onExpand: (notes: string) => void;
  expanding: boolean;
}

const SAVE_DEBOUNCE_MS = 500;

// No file storage exists yet, so media blocks would just be broken — leave them out of the schema
// entirely rather than merely hiding them from the slash menu.
const MEDIA_BLOCK_KEYS = ["audio", "file", "image", "video"] as const;
const blockSpecsWithoutMedia = Object.fromEntries(
  Object.entries(defaultBlockSpecs).filter(
    ([key]) => !(MEDIA_BLOCK_KEYS as readonly string[]).includes(key),
  ),
) as Omit<typeof defaultBlockSpecs, (typeof MEDIA_BLOCK_KEYS)[number]>;
const schema = BlockNoteSchema.create({ blockSpecs: blockSpecsWithoutMedia });

export default function Notebook({ session, onNotesChange, onExpand, expanding }: NotebookProps) {
  const editor = useCreateBlockNote({ schema });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadedSessionId = useRef<string | null>(null);
  const [hasContent, setHasContent] = useState(Boolean(session.notes.trim()));

  useEffect(() => {
    if (loadedSessionId.current === session.id) return;
    loadedSessionId.current = session.id;
    setHasContent(Boolean(session.notes.trim()));
    (async () => {
      const blocks = session.notes.trim()
        ? await editor.tryParseMarkdownToBlocks(session.notes)
        : [];
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [session.id, session.notes, editor]);

  async function handleChange() {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    setHasContent(markdown.trim().length > 0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onNotesChange(markdown), SAVE_DEBOUNCE_MS);
  }

  async function handleExpandClick() {
    // Flush any pending debounced save so the AI call always sees the latest text,
    // instead of racing a 500ms-old snapshot.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    onNotesChange(markdown);
    onExpand(markdown);
  }

  return (
    <div className="notebook">
      <div className="panel-label">Your Notes</div>
      <div className="notebook-editor">
        <BlockNoteView editor={editor} onChange={handleChange} />
      </div>
      <div className="notebook-footer">
        <button
          className="expand-button"
          onClick={handleExpandClick}
          disabled={expanding || !hasContent}
        >
          {expanding ? "Expanding…" : "Expand →"}
        </button>
      </div>
    </div>
  );
}
