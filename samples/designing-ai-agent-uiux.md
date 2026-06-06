# Designing AI Agent UI/UX

## Introduction

The shift from chatbots to agents is the most consequential interface change since the move from desktop applications to the web. A chatbot answers; an agent acts. That distinction sounds small until you try to design for it — and discover that nearly every assumption carried over from chat-first interfaces breaks under the weight of multi-step, tool-using, partially-autonomous systems.

This is a working synthesis of the agent UX literature as of mid-2026, drawn from Nielsen Norman Group's *State of UX 2026* report, Smashing Magazine's design pattern work, the Anthropic and OpenAI developer docs, and the practitioner blogs at Hatchworks, Mantlr, and Fuse Lab Creative. It is not exhaustive. It is opinionated. The goal is to give designers and product teams a shared vocabulary for a discipline that is still being named.

## Why Agent UX Is Different

A chatbot is a typewriter you talk to. The model produces tokens; the surface renders them. The interaction shape is request, response, request, response — symmetric and reversible.

An agent is a worker you delegate to. It pursues a goal across tools, time, and external systems. It maintains state between turns. It can succeed silently, fail silently, or partially succeed in ways neither party fully understands. The shape of the interaction is no longer symmetric — the user gives an intent, then waits and watches.

This asymmetry is the source of nearly every novel UX problem in agent design:

- **State communication.** What is the agent doing right now? What did it just decide? What is it waiting for?
- **Override surface.** How does the user reach into a running workflow without breaking it?
- **Trust accumulation.** How does the agent earn the right to act more autonomously next time?
- **Failure recovery.** When something goes wrong, where does the conversation go?

None of these are chatbot problems. All of them are agent problems.

## Five Core Patterns

Across every credible piece of agent UX writing in 2026, five patterns recur. They are not novel inventions — they are the design vocabulary the field has converged on.

### Planning Visibility

The agent must show its plan before executing it. This is the difference between a worker who says "I'll handle it" and a worker who says "I'll handle it by doing A, then B, then C — let me know if any of those are wrong." The first is faster; the second builds trust faster.

In Claude Code, this surfaces as the plan-mode interruption: the agent drafts the steps, the user approves, then execution proceeds. In Cursor, the same pattern appears as the inline code-action preview before file changes commit. The implementation varies; the design discipline doesn't.

The mistake teams make is treating planning visibility as a debug feature — something to expose during development and hide in production. It is not. It is the primary trust surface. Hiding it forces the user to either over-trust or under-trust, with no path between.

### Tool-Use Disclosure

Whenever the agent calls an external tool, that call should be visible — not as a debug log, but as part of the conversation. The user needs to see what was searched, what file was read, what API was hit. They need to see the result the tool returned. They need to see how that result influenced the next step.

This is more than transparency for its own sake. It is the only way the user can debug a misunderstanding before it compounds. If the agent looked up the wrong record, the user can stop the wrong-record cascade only if they see the lookup happen.

The current canonical pattern is the inline tool block — a collapsed strip that expands to show the call payload, the result, and a duration. The strip lives in the message thread, not in a side panel. Side panels lose state on collapse; threaded inline blocks survive history scrubbing.

### Memory Surfacing

The agent will accumulate state across the conversation. Some of it is explicit (variables it bound, files it opened); most of it is implicit (interpretations of ambiguous instructions, defaults it chose, preferences it inferred).

When memory drives a decision, the user needs to see it. Otherwise the agent looks unpredictable — same prompt, different result, because the same prompt is no longer the same input.

The pattern that has won here is the *inline memory chip*: a small, visually distinct marker on any message that reads from accumulated context. The user can hover (or in mobile, tap) to see what was read. They can edit. They can revoke.

Memory without an inspector is opaque. Memory with an inspector is intelligence.

### Multi-Step Workflow Tracking

For workflows longer than two or three steps, a flat conversational view becomes unreadable. The user loses track of where they are in the larger task. The agent loses track too.

The pattern is to overlay a structural view on the conversational view. The structural view shows the workflow as a checklist or stepped progress. The conversational view shows the running narrative. The user can switch perspectives without losing place.

This is also the surface where pause, resume, and rollback should live. The structural view is the workflow's spine; controls attach to the spine, not to individual messages.

### Recovery Routing

When the agent fails, the next step matters more than the failure itself. Bad error UX assumes the user will read the error message and fix the cause. Good error UX assumes the user is in the middle of something else and needs a one-click path forward.

The recovery patterns that have emerged:

1. **Retry** — for transient failures (rate limits, network blips). The agent should retry automatically with backoff and surface "retrying" rather than "failed."
2. **Repair** — for fixable failures (wrong parameter, missing permission). The agent should propose the repair and ask for one-click consent.
3. **Reroute** — for impossible-as-planned failures. The agent should propose an alternative plan and route the user back to planning visibility for approval.
4. **Roll back** — for irreversible-looking situations that need to be undone. The agent should offer to undo as many prior steps as the undo will reach.

Agents that lack recovery routing leave the user staring at a stack trace. That is a design failure, not an engineering one.

## The Trust Equation

NN/g's *State of UX 2026* identifies trust as the dominant design challenge for AI experiences. The framing is sharp: trustworthiness is not a property of the model. It is an *output of the design process.* You build it the same way you build any quality — deliberately, through hundreds of small choices.

> "Users burned by premature AI features resist adopting new ones. The cost of breaking trust early is not just the failed feature — it is the harder uphill battle for every subsequent feature."

Trust in an agent is built and broken on roughly the same surface area:

| Builds trust | Breaks trust |
|---|---|
| Shows its plan before acting | Acts without showing intent |
| Surfaces tool calls in the thread | Hides tool calls behind "thinking..." |
| Asks before irreversible actions | Asks after irreversible actions |
| Names its memory sources | Recalls without attribution |
| Recovers cleanly from failure | Drops the user into stack traces |
| Improves at a visible pace | Improves at an invisible pace |

The right column is the cost of any one of these patterns failing. Teams who win in agent design treat the left column as a checklist of required capabilities, not a wishlist of nice-to-haves.

## Chat-First vs Canvas vs Generative UI

Three surface paradigms are currently competing for the role of dominant agent interface. Each has different strengths and different failure modes.

### Chat-First

Linear thread, send a message, get a response. Familiar from messaging apps. Easy to reason about; nearly impossible to make work for multi-step workflows. Loses state when the thread gets long. Has no native surface for parallel work, branching, or asynchronous results.

ChatGPT's main interface and Claude's main web UI both started here and have spent two years adding surfaces around the chat (canvas, artifacts, side panels) to compensate for what chat cannot carry.

### Canvas

OpenAI's term for a collaborative document workspace that lives alongside the conversation. The user works on the artifact directly; the agent comments, edits, suggests. The mental model is Google Docs with an AI co-editor.

Strong for writing and refining. Weak for non-document outputs and for workflows that span multiple artifacts. The canvas itself doesn't compose well across documents.

### Generative UI

Claude's pattern, where the agent generates an actual interactive interface in response to the user's intent — not a document, but a small application. The user interacts with the application; the application calls back to the agent when it needs reasoning.

The most flexible surface. Also the most architecturally demanding — every generated interface is a one-off, and consistency across sessions becomes a design problem in its own right. The pattern is still maturing.

A useful comparison:

| Surface | Strength | Weakness | Best for |
|---|---|---|---|
| Chat-first | Lowest cognitive load | Loses state, breaks at length | Q&A, quick lookups |
| Canvas | Direct artifact manipulation | One artifact at a time | Long-form writing, code |
| Generative UI | Per-task tailored | High variance per session | Goal-directed task work |

There is no winner. The right pattern depends on what the agent is for. The mistake is to pick one and assume it covers every workflow.

## Human-in-the-Loop Patterns

When the agent's autonomy is partial, the question becomes: where does the human enter the loop? The answer cannot be "after every step" (too slow) or "never" (too dangerous). It has to be designed.

The pattern community has converged on three sub-patterns.

### Interrupt and Resume

The workflow pauses at a decision point, persists its state, and waits for the human. The human can approve, reject, or modify the proposed next step. Execution resumes from the persisted state.

The hard parts:

- State persistence must be reliable across the wait. The agent cannot "forget" partial work because the human took ten minutes to respond.
- The interrupt must surface in whatever channel the human currently uses. If the human is in email and the interrupt only fires in the agent's web UI, the workflow stalls.
- The resume must validate that the world hasn't changed underneath the pause. A booking confirmation paused for an hour may need to re-check inventory before resuming.

```typescript
// Sketch of an interrupt-and-resume primitive
async function execute(plan: Plan) {
  for (const step of plan.steps) {
    if (step.requiresApproval) {
      const decision = await pause({
        state: serializeState(),
        question: step.description,
        channels: ["webui", "email", "slack"],
      });
      if (decision.action === "reject") return abort(step, decision.reason);
      if (decision.action === "modify") step.apply(decision.changes);
    }
    await step.run();
  }
}
```

The shape of this primitive is reusable across implementation frameworks — CrewAI, Microsoft Semantic Kernel, Temporal, and HumanLayer SDK all expose variants.

### Risk-Based Classification

Not every step needs an interrupt. Most don't. The design decision is: which steps do?

The standard classification uses two axes:

- **Severity** — how bad is the worst-case outcome of getting this wrong?
- **Reversibility** — can the action be undone?

Actions that are high-severity and irreversible always require human approval. Examples: sending customer-facing emails, committing financial transactions, deleting production records, deploying code, posting publicly. Actions that are low-severity or fully reversible can run autonomously and be reviewed after the fact.

The middle band — high-severity but reversible, or low-severity but irreversible — is where design judgment lives. There is no formula. The team has to decide.

What the team should *not* do is push the decision onto the user at runtime. *"Do you want to delete this record?"* asked once is a reasonable question; asked at every database write, it becomes noise that trains the user to click through. The classification has to happen at design time, not runtime.

### Progressive Autonomy

The third pattern is about how autonomy expands over time. The starting state is heavy interrupts — the agent asks before nearly anything. As the user approves more and more actions of a given class, the system can propose graduating that class to autonomous-with-review.

The mechanic is borrowed from progressive disclosure in onboarding: don't show the user everything at once; reveal capability as competence is demonstrated. In agent UX, the actor demonstrating competence is the agent itself, and the user is the one whose approval threshold gradually lowers.

The pattern has a real failure mode: graduating autonomy too quickly. If the user approves an action class three times in a quiet week and the system graduates it on Monday, the user may not be ready for the new behavior. Conservative thresholds beat fast ones; the design should err toward asking even when not strictly required.

## Implementation Frameworks

Several frameworks now offer primitives for the patterns above. They are not interchangeable; they make different bets about where state lives, how interrupts surface, and what the human's review surface looks like.

- **CrewAI** — agent-orchestration framework with built-in HITL hooks. Interrupts surface as Python callbacks. Best for workflows where the human is technical and lives in the same environment as the agent.
- **Microsoft Semantic Kernel** — opinionated about plugins and skills. HITL primitives are tied to its planner. Best for teams already inside the Microsoft ecosystem.
- **Temporal** — durable workflow execution. HITL is implemented via signal-and-wait. Best for production systems where the workflow needs to survive process restarts.
- **HumanLayer SDK** — focused specifically on the human-review surface. Provides Slack, email, and web channels out of the box. Best for teams who want the interrupt UI handled but the agent logic in-house.

The framework choice should follow the workflow's *durability requirements*. Workflows that complete in seconds or minutes don't need Temporal's durability guarantees and pay an unnecessary cost. Workflows that span hours or days do.

## What This Means for Designers

The discipline of agent UX is being established now, by the practitioners who happen to be shipping. That is both exciting and uncomfortable. The patterns above will be considered obvious in three years; today they require deliberate articulation.

A few takeaways for design teams entering this space:

1. *Treat agent design as its own discipline.* It overlaps with conversational design, with workflow design, and with traditional product design, but it is not any of those.
2. *Build trust as a first-class deliverable.* Trust appears in the design review the same way accessibility does — as a checklist of patterns the design must accommodate.
3. *Default to visibility.* Hiding the agent's plan, tool calls, or memory only feels cleaner. It is not. Visibility is the substrate trust grows in.
4. *Design the failure path before the success path.* Most of agent UX is the failure path. Recovery routing is where you spend the design budget.
5. *Reuse the five core patterns shamelessly.* Planning visibility, tool-use disclosure, memory surfacing, workflow tracking, recovery routing. Every agent surface should support all five.

---

## References

The work above synthesizes material from the following sources, listed in approximate order of influence on the framing.

- Nielsen Norman Group, *State of UX 2026: Design Deeper to Differentiate.* The trust framing and the "trustworthiness as an output of design process" argument come from here.
- Smashing Magazine, *Designing For Agentic AI: Practical UX Patterns For Control, Consent, And Accountability* (February 2026). Source of the patterns vocabulary used in section three.
- Hatchworks, *Agent UX Patterns: Chat-First UX Fails. Use These Patterns Instead.* The chat-first critique and the move toward agent-native surface paradigms.
- Mantlr, *Designing for AI Agents: 10 UX Patterns (2026).* The five core patterns list is a condensed version of their ten.
- Fuse Lab Creative, *Agent UX: UI Design for AI Agents in 2026.* Useful framing for tool-use disclosure and inline memory chips.
- OpenAI Agents SDK documentation, *Human-in-the-loop.* Source of the interrupt-and-resume sketch.
- Anthropic Claude documentation, *Plan Mode and Tool Use.* Source of canonical examples for planning visibility.

This document is a working synthesis, not a definitive reference. Patterns are still being named; framings are still being argued. If you find an authority who contradicts what is written here, trust them — and tell me, so I can update the next version.
