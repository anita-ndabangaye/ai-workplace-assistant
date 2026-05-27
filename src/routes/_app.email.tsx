import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Mail } from "lucide-react";
import { AiToolShell } from "@/components/ai-tool-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/email")({ component: EmailGen });

function EmailGen() {
  const [recipient, setRecipient] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [tone, setTone] = React.useState("Professional");
  const [length, setLength] = React.useState("Medium");

  return (
    <AiToolShell
      title="Smart Email Generator"
      description="Draft polished, on-brand emails by describing your goal."
      icon={<Mail className="h-6 w-6 text-primary-foreground" />}
      system="You are an expert business writer. Write clear, polite, well-structured emails. Output ONLY the email (subject line on first line as 'Subject: ...', then a blank line, then the body). No commentary."
      buildPrompt={() => {
        if (!goal.trim()) return null;
        return `Write a ${tone.toLowerCase()} email of ${length.toLowerCase()} length.
Recipient: ${recipient || "(unspecified)"}
Subject hint: ${subject || "(infer one)"}
Goal / what to convey:
${goal}`;
      }}
      inputs={
        <>
          <div>
            <Label>Recipient</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, my manager" />
          </div>
          <div>
            <Label>Subject (optional)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Project update" />
          </div>
          <div>
            <Label>What should the email say? *</Label>
            <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Request a 1:1 next week to discuss Q3 priorities and blockers…" className="min-h-[120px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional","Friendly","Formal","Direct","Apologetic","Persuasive","Enthusiastic"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Short","Medium","Long"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      }
    />
  );
}
