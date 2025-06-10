# Heed

Heed is a presentation tool for writing slides as code - **pure HTML, CSS, and JavaScript** - that runs directly in the browser. 
It supports a simplistic plugin architecture for embedding rich content and JavaScript-driven components.

## What is this?

Heed is a slide deck engine that treats **presentations as structured data** and **programmable layouts**. Slides are defined in a 
**JSON format** and rendered using a small JavaScript runtime with layout primitives like `text`, `html`, `image` and `column-layout`, 
live demos, and external content embedding. It’s served via a lightweight Express-based backend and comes with a very rudimentary
**WebSocket-based speaker notes system**. Batteries are most certainly **not** included.

## Why does this exist?

This project began as a personal tool sometime between 2015–2018, originally designed to support **interactive presentations** about 
C64 assembly programming. At the time, I was writing a Commodore 64 emulator and debugger in JavaScript, and I needed a way to 
embed live C64 code, emulator state, and custom UI elements directly into my slides.

Most slide frameworks either didn't support this level of interactivity, or forced me into an opinionated structure that I just
didn't have the time or mental bandwidth to grok. I needed to produce interactive slides and I needed them now and had not patience
to battle other people's code to get it to load and manage the lifecycle of my emulator

I've since returned to it now and then when I've needed to produce slides and both liked the simplicity but looked... shall we say...
less favorable on the rather cumbersome layout-via-JSON and **fragile** presentation definition reading and parsing. 

And so I just had a presentation to make, and while digging up Heed I noticed that it's actually public on Github, so I figure I 
might as well take an evening or two and polish it and *make my little boo-boo shine* and make producing slides more ergonomic, get 
error handling sorted out and just generally modernize things and touch up some rather hastily thrown together features.

## Design goals

- **No frameworks.** No React, no Vue, no build tools. Just browser-native JavaScript, HTML, and CSS.
- **Slides as data.** Presentations are defined in a structured JSON or plain text format and rendered dynamically together with their 
assets.
- **Plugin support.** Extensions can define new layout types, behaviors, and embedded components.
- **Self-contained.** Everything is served locally with no external dependencies at runtime.
- **Live demos.** Designed for talks where code, emulation, or simulation needs to run live inside the slides. Or just when slides as 
code makes sense. Which it always does. ;)

## State of the code

This codebase contains:
- A lot of obsolete JavaScript idioms
- More than a few quick hacks
- Some creative solutions that may or may not haved aged well

That’s partly by design - Heed was hacked together rather quickly and was always meant to be lightweight and flexible. It worked for 
my use cases and has served me well in multiple live presentations.

## What’s next?

Maybe nothing - or maybe a full modern rewrite, if the mood strikes. For now, it remains as a snapshot of a very particular approach 
to building presentation software: one where you can embed an emulator next to your bullet points and tweak the runtime in real time 
during a talk.

## License

© 2025 Sven Johansson. [MIT Licensed](./LICENSE).  
