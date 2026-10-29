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

I'm a cloud architect on Xbox, where I built and run the Achievements, Leaderboards, Stats and Time Played services, which handle 200,000 requests per second across the Xbox Network. Lately I've been leading the shift to AI-native engineering, from how we write and review code to agents that help run our services in production.

## Experience

### Microsoft · 2016 – Present

*Seattle, WA*

#### Architect, Xbox Developer Organization · 2025 – Present

- Lead engineer for [Mythic Achievements](https://news.xbox.com/en-us/2026/09/29/xbox-insiders-october-2026-console-features-4/), shipped to every Xbox player in October 2026. Rewrote the Achievements backend on a modern cloud-native architecture and backfilled Mythic status for more than 1 billion players across more than 16,000 titles, with zero downtime. Built AI-native: AI validated designs and plans before any code was written, and 100% of the committed code was generated with [GitHub Copilot](https://github.com/features/copilot).
- Led the 300-person Xbox Developer organization's adoption of AI tooling in service engineering: code generation, code review and plan validation. Ran technical demos for the whole organization and personally onboarded 6 teams. Every pull request now gets an AI review before a human looks at it.
- Set the skill and agent development practices those 6 teams follow, including autonomous on-call SRE agents with production read access on [Azure SRE Agent](https://learn.microsoft.com/azure/sre-agent/). An agent is now first responder on every incident, correlating logs, metrics, Kubernetes state and Azure resource health, and time-to-mitigate is down 80%.
- Leading the migration of legacy Xbox Live services onto a cloud-native [AKS](https://azure.microsoft.com/products/kubernetes-service) platform, covering Kubernetes, Bicep and Terraform infrastructure as code, and Prometheus and Grafana observability. I set the patterns and reference architecture other teams build against.

#### Tech Lead & Senior Software Engineer, Xbox / PlayFab · 2020 – 2025

- Tech lead for Xbox Time Played and [PlayFab](https://playfab.com/) Stats and Leaderboards v2, from design through to running in production. Both now power titles including Minecraft and Microsoft Flight Simulator 2024.
- Drastically reduced player data loss in the legacy Achievements service by introducing eventual consistency with at-least-once delivery, so unlocks survive failures.

#### Software Engineer II, Microsoft Sway · 2016 – 2020

- Built [Sway](https://sway.office.com/)'s Author Analytics platform end to end, from client-side tracking and ingestion through Azure Stream Analytics to SQL storage.

### Earlier · 2013 – 2016

*Auckland, New Zealand*

- **Fiserv:** C# / .NET backend services and deployment pipelines for mobile banking apps.
- **Ninja Kiwi:** Game developer on Bloons Monkey City and SAS: Zombie Assault 4.

## Projects

### PuzzleTime

- A web and iOS puzzle game with real-time online versus, cross-play and leaderboards built on PlayFab, with no game server of my own. React and TypeScript. [Play it](/games/wordle).

## Skills

- **Programming:** C# / .NET 8 · Python · JavaScript / TypeScript
- **Cloud & Infra:** Azure Kubernetes Service · Docker · Bicep · Terraform · Cosmos DB · Event Hubs · Redis · Grafana · Prometheus
- **AI Engineering:** AI-native development workflows · AI code review & plan validation · agent & skill authoring · Azure SRE Agent · GitHub Copilot · MCP · guardrails for production-access agents

## Education

### BSc, Computer Science · University of Auckland · 2012 – 2014
