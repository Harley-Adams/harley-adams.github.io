---
title: "Rolling Out AI Tooling to a 300-Person Service Engineering Org"
date: 2026-10-28
draft: true
summary: "How AI code generation, plan validation and code review became the default way the Xbox Developer organization builds services, and why demos beat mandates."
tags:
  - ai-engineering
  - leadership
  - engineering
---

AI code generation, plan validation and code review are now the default way the
300-person Xbox Developer organization builds services. Every pull request gets an AI
review before a human sees it.

None of that came from a mandate. It came from showing people, over and over, what the
tools could do on *our* code, *our* services and *our* problems. This post is the
playbook I'd hand to someone trying to do the same in their org.

## Start from where engineers already are

Service engineers are rightly skeptical. Our job is keeping systems up, and "a tool that
writes plausible-looking code" is not obviously good news for reliability.

**[TODO: Where the org started. For example, what tools were in use, the common
objections you heard, and any early experiments that went badly.]**

## Demos beat decks

The single most effective thing I did was run technical demos and walkthroughs for the
whole org. Not slides about productivity, but live sessions on real repos with real
services, including the parts that went wrong.

What made a demo land:

- **Our code, not a toy app.** Generating a to-do app proves nothing. Planning a change
  to a production service people recognize is convincing.
- **Show the failure modes.** When the AI produced something wrong, I left it in and
  showed how review caught it. That built more trust than a perfect run.
- **End with something they can do tomorrow.** Every session ended with a concrete
  workflow people could try on their next task.

**[TODO: How many sessions, what formats (org-wide demos, team walkthroughs, office
hours), and the demo that changed the most minds.]**

## The three habits

We focused on three habits, in this order.

### 1. Plan validation

Before writing code, write the plan and have AI review it. This was the easiest sell.
It doesn't touch production code, it catches real gaps (missing failure modes,
rollback steps, unhandled edge cases), and a better plan makes everything after it
easier.

### 2. Code generation

With a reviewed plan, generating the implementation becomes a precise ask instead of a
vague one. Engineers still own the result: they review it, test it and take
responsibility for merging it. **[TODO: What helped adoption here. For example, repo
instructions, shared skills, or the Mythic project as proof it worked at scale.]**

### 3. AI review on every pull request

Every pull request now gets an AI review before a human reviewer sees it. The goal
isn't to replace human review. It's to make sure humans spend their attention on design
and intent, not on the null check that was missed.

**[TODO: How the AI review was rolled out: opt-in first or straight to default, how you
handled noisy or wrong comments, and how reviewers' behavior changed.]**

## Handling skeptics

**[TODO: Real examples. Suggested prompts: the most common pushback and your answer,
someone who changed their mind and why, and a concern that turned out to be right and
what you changed.]**

## Measuring it

**[TODO: What you measure, and what's OK to share publicly. For example, adoption, PR
review coverage (100% today), cycle time, defect rates, and how you separated real
impact from novelty.]**

## How the work changed

The biggest shift isn't speed. It's where engineers spend their judgment. More time
goes into specifying what should happen and reviewing whether it did, and less into the
mechanics in between.

**[TODO: How roles changed in practice: senior engineers, new hires, reviewers, and
anything that got harder.]**

## If you're doing this in your org

**[TODO: Your top 3–5 takeaways. Candidate: demo on real code, start with plan
validation, make AI review the default, and keep humans accountable for every merge.]**

## Feedback

Rolling AI tooling out in your own org? I'd like to hear what worked for you. Find me on
[GitHub](https://github.com/Harley-Adams) or [LinkedIn](https://www.linkedin.com/in/harleyadams/).
