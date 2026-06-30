---
title: "Building a chrome extension to redact sensitive text"
date: 2025-04-23
draft: false
summary: "For getting good screen captures for blog posts, without sharing any sensitive text."
tags:
  - web
  - code
---

As I started planning out topics for this blog, I realized that a lot of the
interesting problems and solutions I want to talk about are best explained with
a visual aid of screen shots from different tools or web pages. But some of
these include Xbox internal details that I can't share! It would be so
useful to have a tool, like a chrome extension to quickly redact strings and GUIDs!

Why GUIDs? Azure Entra Auth is made up of 80% GUIDs, so even though you can't
really do anything with just the GUIDs, I don't really feel like sharing
clientId, appId or tenantId with the world wide web in a screen shot of the
azure portal.

## Defining requirements

As with any good project, we should start by clarifying, even if just for oneself.

- Swap out GUIDs, but consistently such that the same GUIDs are mapped to the
  same new GUIDs.
- The user can define a list of strings to replace with "REDACTED". Again so
  that the reader can still infer relationship between the redacted text, we
  want the redaction to be consistent.
- Run in the browser, easy to activate but I still want to manually trigger it
  each time. _Can you imagine how frustrating it would be to debug some Azure
  Entra auth just to realize you have been copy pasting the wrong guid?
  Certainly not me..._ 🤦🏻‍♂️

## Scanning the DOM

The first problem that comes to mind, traversing through all the
visible text on screen that is in the DOM. There is a very handy
`createTreeWalker` function we can use to iterate over all nodes in the DOM, and
filter out certain tags we don't want to swap.

```javascript
function walkTheDOM(rootNode) {
    const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                const parent = node.parentElement;
                // Skip certain elements, we don't want to mess with page functionality, css or user input.
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.isContentEditable)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (node.nodeValue.trim() === '') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    let node;
    while(node = walker.nextNode()) {
        redactTextNode(node);
    }
}
```

The filtering built in does a lot of the heavy lifting for us, on line 4 we tell
the walker to only give us text nodes, and on line 9-11 we can filter out text
tags that we don't actually want to process. I don't want to mess with the
behavior of the page so script tags are out, I don't want to change the
styling/css so STYLE tags are out, and auto changing user input sounds like it
could easily lead to unintended behavior for the user, so lets skip that too.

## Consistent GUIDs

We'll use a simple Map object where the Key is the original string and the value
is the redacted version. We can do a simple Map.has() lookup to know if we've
seen it before, Map.Get to retrieve the matching redacted value and a Map.set()
call when we create a new redacted value.

```javascript
// Lets be honest, we all know I had to ask AI for this regex.
const guidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
const redactionCache = new Map();
let currentSettings = { enableGuid: false, stringsToRedact: [] };
let guidCounter = 0; // Counter to increment the last digit of the GUID

function generateNewGuid(originalGuid) {
    if (redactionCache.has(originalGuid)) {
        return redactionCache.get(originalGuid);
    }
    // Increment the counter for each new unique GUID
    guidCounter++;
    // Create a GUID with all zeros and increment the last 12 digits safely
    const suffix = guidCounter.toString().padStart(12, '0');
    const newGuid = `00000000-0000-0000-0000-${suffix}`;
    redactionCache.set(originalGuid, newGuid);
    return newGuid;
}
```

Not really required, but in order to make it obvious it's been redacted, I've
opted for an all zero guid where we increment the last segment only. We're
restricted to 1,000,000,000,000 GUIDs before this breaks, which I have a feeling
will be ok. As you gain more experience with coding you just develop a gut feel
for these kinds of things 😉.

## Redacting!

Now that we can walk the text nodes in the DOM, and consistently replace
strings, we can implement the last piece which is actually swapping out the
sensitive text.

```javascript
function redactTextNode(node) {
    let value = node.nodeValue;
    let changed = false;

    // Replace user-defined strings
    if (currentSettings.stringsToRedact && currentSettings.stringsToRedact.length > 0) {
        currentSettings.stringsToRedact.forEach(strToRedact => {
            if (value.includes(strToRedact)) {
                // Check if the string is already in the cache
                if (!redactionCache.has(strToRedact)) {
                    redactionCache.set(strToRedact, `[REDACTED:${strToRedact.length}]`);
                }
                const replacement = redactionCache.get(strToRedact);
                value = value.replaceAll(strToRedact, replacement);
                changed = true;
            }
        });
    }

    // Replace GUIDs if enabled
    if (currentSettings.enableGuid) {
        const guids = value.match(guidRegex);
        if (guids) {
            guids.forEach(guid => {
                const newGuid = generateNewGuid(guid);
                value = value.replaceAll(guid, newGuid);
                changed = true;
            });
        }
    }

    // Performance optimization: Only update the node if it has changed.
    if (changed) {
        node.nodeValue = value;
    }
}
```

For the strings the user has specified we can do a basic `string.includes` check
to find instances of the redact list. For GUIDs we can use a basic regex.

## Let's see it in action

Here's some *TopSecret* GUIDs:

03031f36-758c-471b-b7c9-3f8d2b28edd6

03031f36-758c-471b-b7c9-000000000000

03031f36-758c-471b-b7c9-3f8d2b28edd6

End *TopSecret* GUIDs.

![Redactor extension demo](redactor.gif)

## Check out the source code

For brevity I've skipped a couple of steps in this article, but the full source
code can be found on [my
GitHub](https://github.com/Harley-Adams/redactor-extension), which includes some
basic HTML for the popup, using `chrome.storage.sync` to remember the popups
settings between sessions and the manifest.json which is needed to load in as a
chrome extension. Instructions to run this yourself are in the README.

## Feedback

This is my first blog post, if you have any feedback, thoughts or questions on
this topic please reach out on GitHub or LinkedIn, linked below!
