---
name: Harley Adams
title: Architect · Xbox Developer Organization
tagline: Architecting Xbox Gameplay Services and the AI engineering practices behind them.
github: https://github.com/Harley-Adams
website: https://harleyadams.dev
email: harley.g.adams@gmail.com
linkedin: https://www.linkedin.com/in/harleyadams
location: Seattle, WA
---

## Summary

I architect the Xbox services behind Achievements, Leaderboards, Stats and Time Played, which together handle 200,000 requests per second on the Xbox Network. I also lead AI-native engineering adoption across the 300-person Xbox Developer organization, and built the autonomous agents that first respond to incidents on my services.

## Experience

### Microsoft · 2016 – Present

*Seattle, WA*

#### Architect, Xbox Developer Organization · 2025 – Present

- Shipped [Mythic Achievements](https://news.xbox.com/en-us/2026/09/29/xbox-insiders-october-2026-console-features-4/) to every Xbox player in the [October 2026 update](https://www.purexbox.com/news/2026/10/xbox-adds-10-new-features-in-october-28th-update-now-available-to-download), as lead engineer of a 12-person working group across product, client engineering and services. Led a full rewrite of the Achievements backend and a zero-downtime backfill of Mythic status for more than 1 billion players across more than 16,000 titles. AI reviewed designs and plans before coding started, and [GitHub Copilot](https://github.com/features/copilot) generated 100% of the committed code.
- Made AI code generation, plan validation and code review the default way the 300-person Xbox Developer organization builds services, driving adoption through org-wide technical demos and walkthroughs. Every pull request now gets an AI review before a human sees it.
- Cut incident time-to-mitigate on my services by 80% by making autonomous SRE agents the first responder on every incident. Built on [Azure SRE Agent](https://learn.microsoft.com/azure/sre-agent/) with production read access, they correlate logs, metrics, Kubernetes state and Azure resource health. 6 teams now use the skill and agent practices I established.
- A dozen Xbox services now run on the [AKS](https://azure.microsoft.com/products/kubernetes-service) platform I built and maintain for the migration of legacy Xbox Live services, with Istio ingress and service mesh and Prometheus and Grafana observability tuned as production load grew.

#### Tech Lead & Senior Software Engineer, Xbox / PlayFab · 2020 – 2025

- Designed and shipped Xbox Time Played, which tracks play time for every title on Xbox, and [PlayFab](https://playfab.com/) Stats and Leaderboards v2, which now power titles including Minecraft and Microsoft Flight Simulator 2024.
- Drastically reduced player data loss in the legacy Achievements service by introducing eventual consistency with at-least-once delivery.

#### Software Engineer II, Microsoft Sway · 2016 – 2020

- Built [Sway](https://sway.office.com/)'s Author Analytics end to end so authors could see how people read their Sways, from client-side tracking through Azure Stream Analytics to SQL storage.

### Earlier · 2013 – 2016

*Auckland, New Zealand*

- **Fiserv:** C# / .NET backend services and deployment pipelines for mobile banking apps.
- **Ninja Kiwi:** Game developer on Bloons Monkey City and SAS: Zombie Assault 4.

## Projects

### PuzzleTime

- Real-time online versus and cross-play between web and iOS, built entirely on PlayFab with no custom game server. React and TypeScript. [Play it](/games/wordle).

## Skills

- **Programming:** C# / .NET · Python · JavaScript / TypeScript
- **Cloud & Infra:** Azure Kubernetes Service · Istio · Docker · Bicep · Terraform · Cosmos DB · Event Hubs · Redis · Grafana · Prometheus
- **AI Engineering:** AI-native development workflows · AI code review & plan validation · agent & skill authoring · Azure SRE Agent · GitHub Copilot · MCP · guardrails for production-access agents

## Education

### BSc, Computer Science · University of Auckland · 2012 – 2014
