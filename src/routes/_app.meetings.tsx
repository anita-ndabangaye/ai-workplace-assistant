import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { FileText } from "lucide-react";
import { AiToolShell } from "@/components/ai-tool-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/meetings")({ component: Meetings });

function Meetings() {
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");

  return (
    <AiToolShell
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a structured recap."
      icon={<FileText className="h-6 w-6 text-primary-foreground" />}
      system="You summarize meeting notes. Always output markdown with these sections in order: ## Summary (2-3 sentences), ## Key Decisions (bullets), ## Action Items (bullets with owner if mentioned, format: '- [ ] Task — @owner (due if mentioned)'), ## Open Questions (bullets). Be concise and faithful to the source."
      buildPrompt={() => {
        if (!notes.trim()) return null;
        return `Meeting: ${title || "(untitled)"}\n\nRaw notes / transcript:\n${notes}`;
      }}
      ctaLabel="Summarize"
      inputs={
        <>
          <div>
            <Label>Meeting title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 planning sync" />
          </div>
          <div>
            <Label>Raw notes or transcript *</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste the meeting transcript or your raw notes here…" className="min-h-[280px] font-mono text-xs" />
          </div>
        </>
      }
    />
  );
}
