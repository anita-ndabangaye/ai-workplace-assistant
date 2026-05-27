import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface AiToolShellProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  inputs: React.ReactNode;
  buildPrompt: () => string | null;
  system: string;
  ctaLabel?: string;
}

export function AiToolShell({ title, description, icon, inputs, buildPrompt, system, ctaLabel = "Generate" }: AiToolShellProps) {
  const [output, setOutput] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  async function run() {
    const prompt = buildPrompt();
    if (!prompt) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setLoading(true);
    setOutput("");
    setEditing(false);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ system, prompt }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        if (res.status === 429) toast.error("Rate limit reached. Please try again shortly.");
        else if (res.status === 402) toast.error("AI credits exhausted. Add credits in workspace settings.");
        else toast.error("Generation failed.");
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Inputs</h2>
          <div className="space-y-4">{inputs}</div>
          <Button onClick={run} disabled={loading} className="w-full mt-6 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4 mr-2" /> {ctaLabel}</>}
          </Button>
        </Card>

        <Card className="p-6 shadow-soft min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Output</h2>
            {output && !loading && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> {editing ? "Preview" : "Edit"}
                </Button>
                <Button size="sm" variant="ghost" onClick={copy}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[300px]">
            {!output && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                <Sparkles className="h-8 w-8 mb-2 opacity-30" />
                Your AI-generated output will appear here.
              </div>
            )}
            {loading && !output && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking…
              </div>
            )}
            {output && editing && (
              <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[320px] font-mono text-sm" />
            )}
            {output && !editing && (
              <div className="prose-chat text-sm">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )}
          </div>
          {output && (
            <p className="mt-4 pt-4 border-t text-[11px] text-muted-foreground">
              ⚠️ AI-generated. Review for accuracy and tone before using.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
