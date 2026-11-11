---
title: 'Personal Impressions about GPT-5'
slug: 'personal-impressions-about-gpt-5'
date: 2025-08-12T19:42:37-06:00
lastmod: 2025-11-26
image: 'images/cover.png'
tags: [ai-tools, gpt-5, productivity]
draft: false
description: 'Sharing my GPT-5 experiences: better prompting techniques and an experiment switching from subscriptions to API usage with cost comparisons'
---

When GPT-5 came out, prompts that worked fine with GPT-4 started giving worse answers, and I had to rethink how I wrote mine. The model overthought simple requests, made tool calls nobody asked for, and the 80-messages-per-3-hours limit hit right when you needed it most. At home it was a different problem: my wife and I were both running into limits, and the obvious fix was a pile of $20 subscriptions.

So I changed two things. I started structuring my prompts the way OpenAI says GPT-5 expects them, and we stopped paying for subscriptions and moved to the APIs. This post covers both. The meme pretty much sums up how the launch felt:

{{< gallery caption="You vote for GPT-5 or GPT-4o via Reddit" >}}
{{< gallery-image src="images/ac3wmuabekif1.webp" alt="Comparing two different GPT models and their responses in a funny meme way" >}}
{{< /gallery >}}

{{< extlink href="https://www.reddit.com/r/GPT3/comments/1mo4wt0/you_vote_for_gpt5_or_gpt4o/" >}}Reddit Post{{< /extlink >}}

## From subscriptions to APIs

The plan was two ChatGPT Plus subscriptions ($40/month) plus a Claude subscription I wanted to try (another $20). That's $60/month, and still with usage limits. Instead I wanted to see what would happen if we used the APIs directly. This is what our real usage looked like over several months:

{{< chart "monthly-costs" >}}

Our heaviest month was May, at about $28 between the two of us. Most months we save 60-70% compared to the subscriptions.

For daily use we use {{< extlink href="https://www.typingmind.com/" >}}TypingMind{{< /extlink >}}, a ChatGPT-like interface that connects to our OpenAI and Anthropic keys, so we switch between GPT-5 and Claude without thinking about it. The full license runs about $99. I bought it for less than half that, but even at full price it pays for itself in about six months compared to one ChatGPT subscription.

{{< gallery caption="TypingMind" >}}
{{< gallery-image src="images/typingmind.webp" alt="Welcome screen and landing page of TypingMind." >}}
{{< gallery-image src="images/typingmind-pricing.webp" alt="TypingMind pricing page, showing the three tiers to get a lifetime license." >}}
{{< gallery-image src="images/typingmind-main.webp" alt="TypingMind main page showing a navbar, a list of chats and the main chat user interface." >}}
{{< /gallery >}}

I also run {{< extlink href="https://openwebui.com/" >}}Open-WebUI{{< /extlink >}} on our home server for when I want to try other models or Ollama. If you'd rather experiment without spending anything, start there.

{{< gallery caption="Open WebUI" >}}
{{< gallery-image src="images/openwebui.webp" alt="Welcome screen and landing page of Open WebUI." >}}
{{< gallery-image src="images/openwebui-main.webp" alt="Open WebUI main page showing a list of chats and the main chat user interface." >}}
{{< /gallery >}}

After several months, the biggest change is that we ask more questions, because there's no limit to worry about. We pick the model by task (GPT-5 for code, Claude for writing), we have one history across every model, and we still keep an eye on usage, but even heavy months cost less than the subscriptions did.

It's not free of effort. You manage your own API keys and billing, setup takes 15-30 minutes, and you lose the community custom GPTs. If you send ten messages a week, the free tier or Plus is fine. Since I wrote this, Sam Altman also confirmed higher limits for Plus, so if you're happy there, that may be enough. If you hit limits every week, the API pays for itself.

## Prompts that work better with GPT-5

GPT-5 does what you ask, very literally, so it rewards prompts that read more like a spec than a casual request. OpenAI's Prompt Optimizer makes that obvious: it takes `Write an article explaining the importance of embracing change.` and expands it into seven sections, from Role and Objective to Stop Conditions. No wonder people were struggling.

{{< gallery caption="Prompt Optimizer in action" >}}
{{< gallery-video src="images/prompt-optimizer-3-22s.webm" alt="OpenAI's Prompt Optimizer Demo." >}}
{{< /gallery >}}

{{< gallery caption="Before, after, and explanation of changes" >}}
{{< gallery-image src="images/optimize-for-gpt-5.webp" alt="Optimize for GPT-5 web user interface." >}}
{{< gallery-image src="images/optimized-for-gpt-5.webp" alt="Optimize for GPT-5 web showing the prompt optimized." >}}
{{< gallery-image src="images/optimized-for-gpt-5-show-changes.webp" alt="Optimize for GPT-5 web showing the prompt optimized with a description of the changes made and the reason." >}}
{{< /gallery >}}

You don't need all seven for every prompt. These are the changes that made the biggest difference for me.

**Give it a basic structure.** Objective, context, requirements:

```text
<objective>
Create a Python function that validates email addresses and returns detailed error messages for invalid formats.
</objective>

<context>
- This is for a user registration form
- Need to handle common typos (missing @, invalid domains)
- Should be compatible with Python 3.10+
</context>

<requirements>
- Return True/False for validity
- Include specific error message for each failure type
- Add docstring with examples
- Keep it simple - no external dependencies
</requirements>
```

It feels like more work, but 30 seconds of structure saves five rounds of back-and-forth. For a two-line question it's overkill.

**Tell it how hard to think.** GPT-5 decides how much reasoning to apply, and it often picks too much for simple things:

```text
// Instead of letting GPT-5 overthink this:
"Fix this simple syntax error"

// Be more specific:
"This is a simple syntax fix - focus on speed over analysis"
```

For architecture decisions or tricky bugs, do the opposite and ask it to take its time with the trade-offs.

**Ask for analysis before answers.** When you want a recommendation, make it reason first:

```text
Before providing recommendations:
1. Analyze the current situation and key challenges
2. Evaluate available options against the constraints
3. Consider trade-offs and potential issues
4. Validate the analysis before presenting solutions
```

**Tone down the capital letters.** Emphatic language helped with older models. With GPT-5 it backfires, and you get extra tool calls and over-analysis. Instead of:

```text
Be THOROUGH when gathering information.
Make sure you have the FULL picture before replying.
You MUST follow these guidelines EXACTLY.
```

try:

```text
Review the codebase structure before making changes.
Consider the existing patterns and maintain consistency.
Follow the established coding conventions.
```

**Don't contradict yourself.** Because it follows instructions so closely, a contradiction in `.cursor/rules`, `AGENTS.md`, or your project docs ends up in every answer. The Prompt Optimizer is good at finding those.

**For coding rules, use XML-like sections.** OpenAI found this working with Cursor, and it makes the hierarchy explicit:

```text
<code_editing_rules>
  <guiding_principles>
    - Every component should be modular and reusable
    - Prefer composition over inheritance
    - Write self-documenting code with clear variable names
  </guiding_principles>

  <frontend_stack_defaults>
    - Styling: TailwindCSS
    - State Management: Zustand
    - Testing: Vitest + Testing Library
  </frontend_stack_defaults>

  <code_style>
    - Use TypeScript for all new files
    - Prefer arrow functions for components
    - Always include error handling
  </code_style>
</code_editing_rules>
```

**Put limits on your coding agent.** By default it tries to be comprehensive and reads half your repo. Tell it when to stop asking and how much to read:

```text
<persistence>
- Do not ask the human to confirm or clarify assumptions,
  as you can always adjust later. Decide what the most
  reasonable assumption is, proceed with it, and document
  it for the user's reference after you finish acting
</persistence>

<tool_budget>
- Use a maximum of 5 file reads before starting to code
- Focus on the most relevant files first
- If you need more context, ask specifically what to examine
</tool_budget>
```

If you only try one thing, run your three most-used prompts through the optimizer and save the results as templates.

## Resources

- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide" >}}GPT-5 Prompting Guide{{< /extlink >}}**: OpenAI's guidance for agentic tasks, coding, and controlling the model's behavior.
- **{{< extlink href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true" >}}Prompt Optimizer{{< /extlink >}}**: finds contradictions and missing format specs in your prompts, inside the Playground.
- **{{< extlink href="https://cookbook.openai.com/examples/gpt-5/prompt-optimization-cookbook" >}}Optimization Cookbook{{< /extlink >}}**: before-and-after examples.
- **{{< extlink href="https://x.com/OpenAIDevs/status/1956438999364768225" >}}GPT-5 for Developers{{< /extlink >}}**: six coding tips from OpenAI Developers on X.

---

Photo by {{< extlink href="https://unsplash.com/@seanwsinclair?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" >}}Sean Sinclair{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/a-blurry-image-of-a-rainbow-colored-background-C_NJKfnTR5A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" >}}Unsplash{{< /extlink >}}
