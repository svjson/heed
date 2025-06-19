# Heed

[![npm version](https://img.shields.io/npm/v/heedjs.svg)](https://www.npmjs.com/package/heedjs)
[![npm downloads](https://img.shields.io/npm/dm/heedjs.svg)](https://www.npmjs.com/package/heedjs)
[![GitHub repo](https://img.shields.io/badge/github-svjson%2Fheed-blue?logo=github)](https://github.com/svjson/heed)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/heedjs)](https://www.npmjs.com/package/heedjs)

> Slides as code. Presentations in the browser. Bring your HTML, CSS or mild-to-severe chaos.

Heed is a presentation tool for writing slides as code - leveraging **HTML, CSS, and JavaScript** - that runs directly in the browser. 
It supports a simplistic plugin architecture for embedding rich content and JavaScript-driven components.

## What is this?

Heed is a slide deck engine that treats **presentations as structured data** and **programmable layouts**. Slides are defined in a 
custom **.heed file format** or **JSON format** and rendered using a small JavaScript runtime with layout primitives like `text`, 
`html`, `image` and `column-layout`, live demos, and external content embedding. It’s served via a lightweight Express-based backend 
and comes with a very rudimentary **WebSocket-based speaker notes system**. Batteries are most certainly **not** included.

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

## Slide Format

The original version exclusively used JSON files for slides, which quickly turned out be cumbersome and non-premium to work with.
Embedding HTML or code - or any kind of formatting - flattened into a JSON string is not ideal. Who knew?

For this reason, I invented a fairly simply format specifically for heed, which is the canon format, even though it
"transpiles" to the JSON format for use in the slide viewer.

Heed presentations operate directly in the browser, embracing HTML markup and stylesheets rather than abstracting them away. 
As a slide author, you benefit from and rely on your basic(or advanced) knowledge of these concepts.

### .heed files

Heed slide files, .heed, consists of a few types of structured blocks. A <b>frontmatter</b> header block, <b>content blocks</b> and 
<b>aside blocks</b>, which are all optional. Yes, an empty file is a valid .heed file.

An empty file does not accomplish much, though.

For syntax highlighting and some minor helpful features, see [heed-mode.el](https://github.com/svjson/heed-mode) for Emacs.

An example slide that has a title and three points that appear one at a time, could look like this:

<img src="./readme-assets/cat-slide.png" align="right" style="padding-top: 1em;"/>

```
---
title: The Benefits of Cats
---

:: html { id=point1 class=point }
@style=opacity: 0;
%phase{1}.style=opacity: 1 | 0;
<b>1.</b> They are fuzzy.
--

:: html { id=point2 class=point }
@style=opacity: 0;
%phase{2}.style=opacity: 1 | 0;
<b>2.</b> They are furry.
--

:: html { id=point3 class=point }
@style=opacity: 0;
%phase{3}.style=opacity: 1 | 0;
<b>3.</b> They are fluffy.
--
```

External to the slide, and defined globally for this presentation, is a minimal custom stylesheet 
that defines the `.point` class and that **absolutely atrocious** background image:


```css
body {
  background: url('cat-background.png');
}

.point {
  font-size: 70px;
  margin: 100px 0;
  transition: opacity 0.5s;
}
```

The transition property works together with the phase-attributes in the html content blocks,
to make each point fade in one at a time.

At this point there is no built-in feature to vertically place and center the points, which
is why we are using the hack of adding margin to the bullets. This would be an obvious feature 
that obviously will make it in at some point.


#### The Frontmatter header-block

The frontmatter block serves a header for the file. There are a small number of properties
that are recognized by Heed, the most obvious one being `title`.

```
---
title: The Benefits of Cats
---
```

`title` is a shortcut for adding a slide title, as seen in the screenshot above.
As of right now, Heed provides the style and "layout" for the title, but customizing this
can also be counted among the obvious features to add with time.

#### Content blocks

Content blocks follow this syntax, with an `::` opener followed by its type, and is closed
with `--`.

```
:: html { id=point2 class=point }
@style=opacity: 0;
%phase{2}.style=opacity: 1 | 0;
<b>2.</b> They are furry.
--
```

Attributes may be specified inline within the block using the format `@style=opacity: 0;`, 
or they can be defined as attributes on the opening line, such as `{ id=point2 }`. 
Both methods are functionally equivalent. However, for improved readability, common 
attributes like `id` and `class` may be more suitable on the opening line, while attributes 
specific to the block type may be better suited as `@`-attributes or `%`-macro attributes

Included block types are `text`, `html`, `image`, `video`, `table` and `column-layout`.


#### Macros

Macros and macro-attributes use a `%`-notation, and are pre-defined features that deal with
common concerns, such as manipulating content blocks and their attributes as the phases of
a slide is traversed.

These are generative in their nature, and simply jack into the translation process of 
.heed-files, turning the into the JSON format consumed by the slide viewer.

##### The %for block

The `%for`-macro is very similar to a a `for`-loop in any of Ye Olde Programming Languages,
and produces a block for `%each` of `%values` provided.

The following `%for`-macro block...

```
:: %for { %type=image class=decor }
%each=n
%values=1,2,3
@src=image{n}.png
@style=position: absolute;
@style[n=1]=top:20%; left:20%
@style[n=2]=top:80%; left:44%
@style[n=3]=top:15%; left:83%
--
```
...yields these three concrete `image`-content blocks:

```
:: image { class=decor }
@src=image1.png
@style=position: absolute,
@style=top:20%; left:20%
--

:: image { class=decor }
@src=image1.png
@style=position: absolute,
@style=top:80%; left:44%
--

:: image { class=decor }
@src=image1.png
@style=position: absolute,
@style=top:15%; left:83%
--
```

This is particularly helpful when adding repetetive content, in that it both allows for
common definition of the properties and reduces the amount of code required.

#### Aside blocks

Aside blocks are structurally similar to content blocks, but describe properties or behavior
of the slide without being actual content.

The inline `%phase`-macro attributes in the cat-slide example are functionally equivalent 
to the following `phases` aside block:

```
== phases
!! initial

!! phase1
#point1 --> opacity: 1;
#point1 <-- opacity: 0;

!! phase2
#point2 --> opacity: 1;
#point2 <-- opacity: 0;

!! phase3
#point3 --> opacity: 1;
#point3 <-- opacity: 0;
```

Heed utilizes "phases" to define transitions and animations as modifications and progress within
a slide.

To define a phase, use the `!!` syntax. Instructions for actions to be performed during that phase 
follow this identifier.

The concept is fairly straightforward. In this example, content sections are referred to by their 
IDs. 
Use `-->` to specify actions applied when entering a phase, and `<--` to detail actions executed 
when reverting to the previous step.

For simple phases, like making one block appear at a time, inlining phase directives as attributes
like in the example is favorable and much less verbose.

### .json files

As mentioned earlier, the .heed files are transpiled to the legacy JSON format for use by the slide viewer,
but they can also be expressed directly in this format if preferred.

The same slide expressed as JSON would look like this:

```
{
  "title": "The Benefits of Cats",
  "contents": [
    {
      "type": "html",
      "id": "point1",
      "class": "point",
      "styles": {
        "opacity": "0"
      },
      "contents": [],
      "html": "<b>1.</b> They are fuzzy."
    },
    {
      "type": "html",
      "id": "point2",
      "class": "point",
      "styles": {
        "opacity": "0"
      },
      "contents": [],
      "html": "<b>2.</b> They are furry."
    },
    {
      "type": "html",
      "id": "point3",
      "class": "point",
      "styles": {
        "opacity": "0"
      },
      "contents": [],
      "html": "<b>3.</b> They are fluffy."
    }
  ],
  "steps": [
    { "id": "initial" },
    { "id": "phase1",
      "transitions": {
        "point1": [{ "opacity": "1" }, { "opacity": "0" }]
      }
    },
    {
      "id": "phase2",
      "transitions": {
        "point2": [{ "opacity": "1" }, { "opacity": "0" }]
      }
    },
    { "id": "phase3",
      "transitions": {
        "point3": [{ "opacity": "1" }, { "opacity": "0" }]
      }
    }
  ]
}
```

Despite being cumbersome and less ergonomic to edit as well as being less expressive than the .heed format,
it still has one thing going for it: At least it's not XML. ¯\\\_(ツ)_/¯

## Command: heed

This command for serving up a presentation and the speaker notes.

### Usage:

#### Serving a presentation:

```bash
$ heed <path/to/presentation>
```

This will serve the Heed presentation at [http://localhost:4000](http://localhost:4000) and the speaker notes
at [http://localhost:4000/speaker](http://localhost:4000/speaker).

### Speaker Notes

The speaker notes are still in the extremely basic shape they were when initially hobbled together an hour 
before a presentation (which of course left me with no time to write the actual notes...).

The Speaker Notes UI and the presentation both connect to a WebSocket, allowing them to synchronize the current 
slide. This ensures that with the presentation displayed on a projector or large screen and the speaker notes on a 
laptop screen, the notes UI remains up to date with the slide being shown.

## Command: heed-cli

This command is for interacting with the presentation on your file-system, providing scaffolding commands
like `new`, `add slide` as well as providing features that support [heed-mode](https://github.com/svjson/heed-mode) for Emacs.

### Usage:

#### Creating a new presentation in the current directory:

```bash
$ heed-cli new "I spent a year pretending to be a cow"
```

#### ...or creating it in a target directory, and also creating that if required:

```bash
$ heed-cli new "I spent a year pretending to be a cow" ./my-year-as-a-cow
```
This also creates a first slide with the presentation name under `<presentation root>/slides/front.heed`.

#### Adding a slide

```bash
$ heed-cli add slide initial-reactions
```

This creates an empty slide and places it at the back of your slide index.

### Commands

| Command           | Arguments     | Optional               | Description                                                           |
|-------------------|---------------|------------------------|-----------------------------------------------------------------------|
| `add plugin`      | (plugin name) | <path/url>             | Add a plugin to the presentation                                      |
| `add slide`       | (slide id)    | (path/context)         | Add a slide to the presentation                                       |
| `install plugins` |               |                        | Install configured plugins that are not present in the plugins folder |
| `link plugin`     | (plugin name) | (path)                 | (For plugin development) Add a plugin by symlink                      |
| `new`             | (title/name)  | (path)                 | Create/Initialize a new presentation                                  |
| `pack`            | (path)        | --type [tar, tgz, zip] | Create a distributable archive from the presentation folder           |
| `remove plugin`   | (plugin name) |                        | Remove/uninstall a plugin from this presentation                      |
| `show index`      |               | (path)                 | Show the presentation slide index                                     |
| `show root`       |               | (path)                 | Locate the presentation root folder at <path>(implcitly ./)           |

For the benefit of tooling, all commands accept a `--json` flag that outputs the command result as JSON

## Installation

### npm

```bash
 npm install -g heedjs
```

### yarn (v1)

```
 yarn global add heedjs
```

## Design goals

- **No heavy frameworks in the browser.** No React, no Vue, no build tools. Just browser-native JavaScript, HTML, and CSS.
- **Slides as data.** Presentations are defined in a structured JSON or plain text format and rendered dynamically together with their 
assets.
- **Plugin support.** Extensions can define new layout types, behaviors, and embedded components.
- **Self-contained.** Everything is served locally with no external dependencies at runtime.
- **Live demos.** Designed for talks where code, emulation, or simulation needs to run live inside the slides. Or just when slides as 
code makes sense. Which it always does. ;)

## Changelog

### [v0.1.1]
- Separation of regular `@`-attributes and `%`-macro attributes
- Macro block types are now also clearly prefixed as macros (`:: for` --> `:: %for`)

### [v0.1.0] - 2025-06-16
- Initial version published to npm

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
