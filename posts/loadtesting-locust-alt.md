---
title: "Load testing your AKS service with Locust and Azure Load Testing"
date: 2025-04-02
draft: true
summary: "A case study on how we load test PlayFab leaderboards."
tags:
  - career
  - working in big tech
---

A case study in load testing to validate your new service. At PlayFab we recently launched our [new Leaderboards offering](https://developer.microsoft.com/en-us/games/articles/2025/03/leverage-new-features-with-playfab-leaderboards/). Before any games released utilizing the service, we load tested the product. In this article I'll walk through how we defined scale requirements and how to easily run load tests using Locust and Azure Load Testing. Here's how we approached it, and how you can leverage similar practices.

## Defining what we are testing for

The most challenging aspect of load testing isn't the execution—it's identifying clear scenarios and success criteria. Without clarity on what your scenarios are, you'd find that when you review your load test results with you team, they might have a lot more questions that you didn't think of!

### Client Requirements

Start by analyzing the anticipated client workloads:

- **Read Requests per Second (RPS):** Determine the expected peak read loads.
- **Write RPS:** Identify the peak write loads and patterns.

Collect realistic data based on historical usage, projected growth, or comparative benchmarks.

At Xbox, this isn't the first leaderboards solution that we've built, so luckily for us we had good quality service metrics on existing calling patterns for games calling our older offerings. I can't share those numbers publicly, but I can walk through how I would come up with load testing requirements based on known public data points and some basic deduction of how games should work.

### Service Requirements

Understand your service-level expectations:

- **Concurrent Users:** How many simultaneous players will interact with the service?
- **Latency Expectations:** Define acceptable response times (e.g., < 100ms).
- **Throughput Targets:** Quantify overall throughput goals.

## How to Write the Load Test

We utilized [Locust](https://locust.io/) for our load tests, as it's straightforward, scalable, and integrates fairly well with Azure services utilizing ManagedIdentity.

### [Locust Setup Guide](link-to-locust-setup)

[link to locust setup](https://docs.locust.io/en/stable/installation.html)

Setting up Locust involves:

- Defining user behaviors and scenarios
- Scaling test scenarios horizontally to simulate thousands of concurrent users
- Capturing detailed metrics for analysis

## Structuring Your Load Test Code

We created a reusable base class in Python, encapsulating essential operations:

```python
from locust import HttpUser, task, between

class LeaderboardUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def submit_score(self):
        self.client.post("/submit", json={"score": 1000})

    @task
    def fetch_leaderboard(self):
        self.client.get("/leaderboard/top")
```

This structure simplifies adding new scenarios and managing complexity.

### Managed Identity and Azure Load Testing (ALT)

A paragraph on creating the ALT resource. Call out enabling system assigned identity. Take the system assigned identity and add it to your allowed callers list.

### Azure Load Testing and Reviewing Azure Resources

A paragraph on how to deploy your run.

A paragraph on reviewing the results

Some screen captures of ALT results

### Determining success

Review for:

- 5xx errors/request failures
- Higher latency

When using CosmosDb, look at utilized RU graphs for your containers to validate that costs are as expected. If you have a hot container with not a large amount of data, you should investigate caching to lower cost.

## But what about 1 BILLION players on a leaderboard?

![Dr. Evil GIF](drevil1billionplayers.gif)

As a fun experiment, let's push the boundaries beyond the player count for any one game and see if we can have a billion entry leaderboard. pushed the boundaries with hypothetical scenarios, simulating massive player bases to observe system behavior and resilience. While extreme, these experiments provide valuable insights into scaling limits and potential optimizations.

Code block showing math.random(0,1000000) on the update API.

Load testing at scale isn't just essential—it's can be very validating of your hard work to see that service fly!
