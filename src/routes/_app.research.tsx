import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Search } from "lucide-react";
import { AiToolShell } from "@/components/ai-tool-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/research")({ component: Research });

function Research() {
  const [topic, setTopic] = React.useState("");
  const [questions, setQuestions] = React.useState("");
  const [depth, setDepth] = React.useState("Brief");
  const [audience, setAudience] = React.useState("Executive");

  return (
    <AiToolShell
      title="AI Research Assistant"
      description="Get a structured briefing on any topic for any audience."
      icon={<Search className="h-6 w-6 text-primary-foreground" />}
      system="You are a research analyst. Provide a structured briefing in markdown with: ## Overview, ## Key Points (bullets), ## Considerations / Tradeoffs, ## Recommended Next Steps, ## What to verify (note that facts should be confirmed independently). Tailor depth and language to the requested audience. Be balanced and cite when something is your inference vs widely-known."
      buildPrompt={() => {
        if (!topic.trim()) return null;
        return `Topic: ${topic}
Audience: ${audience}
Depth: ${depth}
Specific questions to address:
${questions || "(none — cover what's most important)"}`;
      }}
      ctaLabel="Research"
      inputs={
        <>
          <div>
            <Label>Topic *</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Adopting AI coding assistants on a 20-person engineering team" />
          </div>
          <div>
            <Label>Specific questions (optional)</Label>
            <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder="What metrics should we track? What are common pitfalls?" className="min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Executive","Manager","Technical team","General"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Brief","Standard","Deep dive"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      }
    />
  );
}
