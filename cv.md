---
name: Harley Adams
title: Architect · Xbox Developer Organization
tagline: Architecting Xbox Gameplay Services, and the AI engineering practices behind them.
github: https://github.com/Harley-Adams
website: https://harleyadams.dev
email: harley.g.adams@gmail.com
linkedin: https://www.linkedin.com/in/harleyadams
location: Seattle, WA
---

## Summary

I'm a cloud architect working on Xbox and PlayFab. I built and run the Achievements, Leaderboards, Stats and Time Played services, which serve 200,000 requests per second across the Xbox Network. Most recently I was lead engineer on [Mythic Achievements](https://news.xbox.com/en-us/2026/09/29/xbox-insiders-october-2026-console-features-4/), which we built AI-native from day one. I also lead AI adoption across the Xbox Developer organization, from the tools engineers use every day to agents that help run our services in production.

## Experience

### Microsoft · 2016 – Present

*Seattle, WA*

#### Architect, Xbox Developer Organization · 2025 – Present

- Lead engineer for [Mythic Achievements](https://news.xbox.com/en-us/2026/09/29/xbox-insiders-october-2026-console-features-4/), shipped to every Xbox player in October 2026. Rewrote the Achievements backend on a modern cloud-native architecture, and backfilled Mythic status for more than 1 billion players across more than 16,000 titles, going back to Xbox 360, all with zero downtime for the live service.
- Built Mythic AI-native: AI validated designs and plans before any code was written, generated code, and reviewed pull requests. N% of the code was AI-generated, and we went from design to launch in N months.
- Led the 300-person Xbox Developer organization's adoption of AI tooling in service engineering: code generation, code review and plan validation. Ran technical demos for the whole organization and personally onboarded 6 teams, with AI now reviewing N% of pull requests.
- Set the skill and agent development practices 6 teams now follow. Engineers use these agents day to day, and they run as autonomous on-call SRE agents with production read access on the [Azure SRE Agent](https://learn.microsoft.com/azure/sre-agent/) platform, triaging N% of incidents and cutting time-to-mitigate by N%.
- Leading the migration of legacy Xbox Live services onto a cloud-native [AKS](https://azure.microsoft.com/products/kubernetes-service) stack, and setting the direction other teams build against.

#### Tech Lead & Senior Software Engineer, Xbox / PlayFab · 2020 – 2025

- Tech lead for Xbox Time Played and [PlayFab](https://playfab.com/) Stats and Leaderboards v2.
- Owned the architecture decisions and led the implementation, from design through to running these services in production.
- Re-architected the Achievements backend to eliminate player data loss, moving it to at-least-once delivery so unlocks survive failures.

#### Software Engineer II, Microsoft Sway · 2016 – 2020

- Built [Sway](https://sway.office.com/)'s Author Analytics platform: client-side tracking, ingestion endpoints, Azure Stream Analytics, SQL storage. Authors could see how people read their Sways.
- Worked on accessibility across Sway, and triaged and fixed externally reported security vulnerabilities.

### Fiserv · 2015 – 2016

*Auckland, New Zealand*

#### Junior Software Engineer

- Wrote C# / .NET backend services for mobile banking apps, plus the pipelines that deployed them.

### Ninja Kiwi · 2013

*Auckland, New Zealand*

#### Game Developer

- Junior developer on Bloons Monkey City and SAS: Zombie Assault 4.

## Projects

### PuzzleTime (Web)

- A web version of my iOS puzzle app, starting with Wordle: daily and random modes, on-screen and physical keyboard input, hints, stats, streaks and shareable results. No backend and no account — it all lives in your browser. React and TypeScript. [Play it](/games/wordle).

### Run Box Run

- An Android game I wrote at university and put on the Play Store. No engine, no frameworks, just Java and the Android APIs.

## Skills

- **Programming:** C# / .NET 8 · Python · JavaScript / TypeScript · PowerShell · Bash
- **Architecture & Leadership:** Distributed systems design · live-service reliability · technical direction · mentorship
- **Cloud & Infra:** Azure Kubernetes Service · Docker · Bicep · Terraform · Cosmos DB · Event Hubs · Redis · Grafana · Prometheus · Locust · Azure Load Testing
- **AI Engineering:** Org-wide AI adoption · AI-native development workflows · AI code review & plan validation · agent & skill authoring · Azure SRE Agent · GitHub Copilot · MCP · guardrails for production-access agents

## Education

### BSc, Computer Science · University of Auckland · 2012 – 2014
