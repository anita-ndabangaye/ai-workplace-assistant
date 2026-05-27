import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ListTodo } from "lucide-react";
import { AiToolShell } from "@/components/ai-tool-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/tasks")({ component: Tasks });

function Tasks() {
  const [goal, setGoal] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [hours, setHours] = React.useState("10");
  const [horizon, setHorizon] = React.useState("This week");

  return (
    <AiToolShell
      title="AI Task Planner"
      description="Describe a goal and get a prioritized, time-boxed plan."
      icon={<ListTodo className="h-6 w-6 text-primary-foreground" />}
      system="You are a productivity coach. Break the user's goal into a concrete, prioritized plan. Output markdown with: ## Plan Overview (1-2 sentences), ## Tasks (numbered list, each with **Priority** (High/Med/Low), estimated time, and a 1-line description), ## Suggested Schedule (when to do what, grouped by day if relevant). Keep it realistic given the available time."
      buildPrompt={() => {
        if (!goal.trim()) return null;
        return `Goal: ${goal}
Time horizon: ${horizon}
Available hours: ${hours}
Hard deadline: ${deadline || "(none)"}`;
      }}
      ctaLabel="Build plan"
      inputs={
        <>
          <div>
            <Label>What's the goal? *</Label>
            <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Launch the new pricing page and announcement email" className="min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Time horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Today","This week","Next 2 weeks","This month","This quarter"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Available hours</Label>
              <Input value={hours} onChange={(e) => setHours(e.target.value)} type="number" min="1" />
            </div>
          </div>
          <div>
            <Label>Hard deadline (optional)</Label>
            <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="e.g. Friday EOD" />
          </div>
        </>
      }
    />
  );
}
