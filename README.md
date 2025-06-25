# Heed

[![npm version](https://img.shields.io/npm/v/heedjs.svg)](https://www.npmjs.com/package/heedjs)
[![npm downloads](https://img.shields.io/npm/dm/heedjs.svg)](https://www.npmjs.com/package/heedjs)
[![GitHub repo](https://img.shields.io/badge/github-svjson%2Fheed-blue?logo=github)](https://github.com/svjson/heed)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/node/v/heedjs)](https://www.npmjs.com/package/heedjs)

> Slides as code. Presentations in the browser. Bring your HTML, CSS or mild-to-severe chaos.

Heed is a presentation tool for writing slides as code - leveraging **HTML, CSS, and JavaScript** - that runs directly in the browser. 
It supports a simplistic plugin architecture for embedding rich content and JavaScript-driven components.

## Table of contents

<!-- toc -->

- [What is this?](#what-is-this)
- [Installation](#installation)
- [Command: heed](#command-heed)
  * [Usage:](#usage)
    + [Serving presentations](#serving-presentations)
  * [Speaker Notes](#speaker-notes)
- [Command: heed-cli](#command-heed-cli)
  * [Usage:](#usage-1)
    + [Creating a new presentation](#creating-a-new-presentation)
    + [Adding a slide](#adding-a-slide)
  * [Commands](#commands)
- [Slide Format](#slide-format)
- [.heed files](#heed-files)
  * [The Frontmatter header-block](#the-frontmatter-header-block)
  * [Content blocks](#content-blocks)
  * [Aside blocks](#aside-blocks)
    + [`== phases` block](#-phases-block)
    + [`== content` block](#-content-block)
    + [`== notes` block](#-notes-block)
  * [Macros](#macros)
    + [`:: %for`-macro block](#-%25for-macro-block)
    + [`%reveal` frontmatter-macro](#%25reveal-frontmatter-macro)
    + [`%phase`-macro attribute](#%25phase-macro-attribute)
    + [`%accumulate`-macro attribute](#%25accumulate-macro-attribute)
    + [`%content`-macro attribute](#%25content-macro-attribute)
- [.json files](#json-files)
- [Design goals](#design-goals)
- [Why does this exist?](#why-does-this-exist)
- [Changelog](#changelog)
  * [[v0.2.3] - 2025-06-25](#v023---2025-06-25)
  * [[v0.2.2] - 2025-06-24](#v022---2025-06-24)
  * [[v0.2.1] - 2025-06-23](#v021---2025-06-23)
  * [[v0.2.0] - 2025-06-22](#v020---2025-06-22)
  * [[v0.1.0] - 2025-06-16](#v010---2025-06-16)
- [State of the code](#state-of-the-code)
- [What’s next?](#whats-next)
- [License](#license)

<!-- tocstop -->

## What is this?

Heed is a slide deck engine that treats **presentations as structured data** and **programmable layouts**. Slides are defined in a 
custom **.heed file format** or **JSON format** and rendered using a small JavaScript runtime with layout primitives like `text`, 
`html`, `image` and `column-layout`, live demos, and external content embedding. It’s served via a lightweight Express-based backend 
and comes with a very rudimentary **WebSocket-based speaker notes system**. Batteries are most certainly **not** included.

## Installation

**npm**

```bash
 npm install -g heedjs
```

**yarn (v1)**

```
 yarn global add heedjs
```

## Command: heed

This command is used for serving up a presentation and the speaker notes over HTTP.

### Usage:

#### Serving presentations

**Serving a presentation from folder/presentation.json**

```bash
$ heed <path/to/presentation>
```

This will serve the Heed presentation at [http://localhost:4000](http://localhost:4000) and the speaker notes
at [http://localhost:4000/speaker](http://localhost:4000/speaker).

**Serving a presentation from archive (zip or tarball)**

You can deliver presentations directly from archives without extracting the contents.

```bash
$ heed ~/Downloads/exotic-cheeses.tgz
```

| Option                 | Arguments       | Description                                |
|------------------------|-----------------|--------------------------------------------|
| `-p`, `--port`         | `<port number>` | Specify port number to run server on       |
| `-w`, `--show-watches` |                 | Display components under watch on startup  |
| `-n`, `--no-watches`   |                 | Disable watch and reload on content change |


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

#### Creating a new presentation

**in the current directory:***

```bash
$ heed-cli new "I spent a year pretending to be a cow"
```

**...or creating it in a target directory, and also creating that if required:**

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


## Slide Format

The original version exclusively used JSON files for slides, which quickly turned out be cumbersome and non-premium to work with.
Embedding HTML or code - or any kind of formatting - flattened into a JSON string is not ideal. Who knew?

For this reason, I invented a fairly simple format specifically for heed, which is now the canon format format for writing slides.
It still "transpiles" to the same old JSON format for use in the slide viewer, which it is still well-suited for.

Heed presentations operate directly in the browser, embracing HTML markup and stylesheets rather than abstracting them away. 
As a slide author, you benefit from and rely on your basic(or advanced) knowledge of these concepts.


## .heed files

Heed slide files, .heed, consists of a few types of structured blocks. A <b>frontmatter</b> header block, <b>content blocks</b> and 
<b>aside blocks</b>, which are all optional. Yes, an empty file is a valid .heed file.

An empty file does not accomplish much, though.

For syntax highlighting and some minor helpful features, see [heed-mode.el](https://github.com/svjson/heed-mode) for Emacs.

An example slide that has a title and three points that appear one at a time, could look like this:

<img src="https://raw.githubusercontent.com/svjson/heed/master/readme-assets/cat-slide.png" align="right" style="padding-top: 1em;"/>

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


### The Frontmatter header-block

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


### Content blocks

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


### Aside blocks

Aside blocks are structurally similar to content blocks, but describe properties or behavior
of the slide without being actual content.


#### `== phases` block

The inline `%phase`-macro attributes in the cat-slide example are functionally equivalent 
to declaring the following `phases` aside block:

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

For simple phase setups, like making one block appear at a time, inlining `%phase`-macros in the blocks 
or describing the sequence with a `%reveal`-macro in the frontmatter section is the preferred and less
verbose way.


#### `== content` block

Content blocks can be used to describe block content away from the actual blocks. This comes
in handy in a number of situations, for example when the content is large and noisy or using
different content for each block emitted by a `%for`-block macro.

```
:: %for { %type=html }
@style=font-size: 30px
@style=background-color: black;
@style=color: white;
%each=n
%values=1..3
%phase{n}.style=opacity: 1 | 0;
%content=content:text{n}
--

== content { id=text1 }
A parakeet once composed a symphony entirely out of chirps and squawks, 
confusing but delighting music critics worldwide.
--

== content { id=text2 }
A renowned parakeet bread-slicing contest sparked debates about the world's tiniest 
butter churner's endurance levels.
--

== content { id=text3 }
In an unprecedented event, a parakeet was nominated for mayor, with a promise to make 
every day a seed buffet holiday.
--
```

#### `== notes` block

Notes blocks can be used to write speaker notes directly in `.heed` slide files (as opposed
to linking from separate files in the frontmatter section).

```
== notes
You've got this. Breathe. In and out.
You know the subject.
And remember - violence is never the answer.
--
```

Notes written in these blocks are not visible in the main presentation, but appear in the 
the separate [Speaker Notes view](#speaker-notes).

### Macros

Macros and macro-attributes use a `%`-notation, and are pre-defined features that deal with
common concerns, such as manipulating content blocks and their attributes as the phases of
a slide is traversed.

These are generative in their nature, and simply jack into the translation process of 
.heed-files, turning the into the JSON format consumed by the slide viewer.

#### `:: %for`-macro block

The `%for`-macro is very similar to a a `for`-loop in any of Ye Olde Programming Languages,
and produces a block for `%each` of `%values` provided.

The following `%for`-macro block...

```
:: %for { %type=image class=decor id=img{n} }
%each=n
%values=1,2,3
@src=image{n}.png
@style=position: absolute;
@style[n=1]=top:20%; left:20%;
@style[n=2]=top:80%; left:44%;
@style[n=3]=top:15%; left:83%;
--
```
...yields these three concrete `image`-content blocks:

```
:: image { class=decor id=img1 }
@src=image1.png
@style=position: absolute;
@style=top:20%; left:20%;
--

:: image { class=decor id=img2 }
@src=image1.png
@style=position: absolute;
@style=top:80%; left:44%;
--

:: image { class=decor id=img3 }
@src=image1.png
@style=position: absolute;
@style=top:15%; left:83%;
--
```

This approach is beneficial when dealing with repetitive content, as it facilitates a 
standardized definition of properties and reduces code redundancy.

The `%values` parameter, a comma-separated list, allows the input to be non-numeric and 
non-sequential. However, if the input values _are_ numeric, using ranges as an alternative 
is often more efficient. 

Values using a range format can be expressed like so: `%values=1..25`.


#### `%reveal` frontmatter-macro

For most slides where content is revealed step-by-step, or in Heed lingo - phase-by-phase,
this happens in a predictable pattern and can be expressed in the frontmatter section.

For example, the following:
```
--------
%reveal: text1, text2, text3
%reveal.style: opacity: 1 | 0; transform: scale(1) | scale(0)
--------
```

Will generate phases equivalent to:

```
== phases
!! initial

!! phase1
#text1 --> opacity: 1; transform: scale(1); 
#text1 <-- opacity: 0; transform: scale(0);

!! phase2
#text2 --> opacity: 1; transform: scale(1);
#text2 <-- opacity: 0; transform: scale(0);

!! phase3
#text3 --> opacity: 1; transform: scale(1);
#text3 <-- opacity: 0; transform: scale(0);
```

The `%reveal`-property, whose value specifies the id's of the content blocks to generate 
phase-transitions for, can be expressed in several ways:

| Syntax                | Description                                                        |
|-----------------------|--------------------------------------------------------------------|
| `all`                 | Select all blocks                                                  |
| `text1, text2, text3` | Select only these specific blocks                                  |
| `...text2`            | Select all blocks from the first block up to and including `text2` |
| `text2...`            | Reveal `text2` and all following blocks                            |
| `text2..text4`        | Select `text2`, `text4` and all blocks in between                  |

Several %reveal-groups may be specified, by naming them:

```
--------
%reveal[orig]: text1, text3
%reveal[orig].style: opacity: 1 | 0; transform: translateX(0) | translateX(-100)
%reveal[translated]: text2, text4
%reveal[translated].style: opacity: 1 | 0; transform: translateX(0) | translateX(100)
--------
```


#### `%phase`-macro attribute

The `%phase`-macro is a shorthand for defining phase transitions directly on a content block,
as opposed to in the `== phases`-aside block.

A common use-case is making blocks appear when a slide enters a certain phase (and disappearing
if the slide reverts to an earlier phase):

```
%phase{2}.style=opacity: 1 | 0;
```

There is no requirement to define the phase referred to by the macro, as they will be 
created as needed.


#### `%accumulate`-macro attribute

The `%accumulate`-macro is used to include properties from previous blocks in an accumulation
group.

This is particularly useful for certain block types, such as `prism:code-block` or `mermaid:diagram`, 
to create the effect of gradually making content appear within them.

While there is currently no support for actually modifying their contents, the same effect
can be achieved by using multiple blocks where only one is shown during each phase:

```
:: mermaid:diagram { id=stage1 class=invisble }
%accumulate.content=my-graph
%phase{1}.style=opacity: 1 | 0;
%phase{2}.style=opacity: 0;
gitGraph:
  checkout main
  commit id: "Added sprinkles"
  commit id: "And a cherry on top!"
--

:: mermaid:diagram
%accumulate.content=my-graph
%phase{1}.style=opacity: 1 | 0;
%phase{2}.style=opacity: 0;
  branch feature/eat-that-cake
  checkout feature/eat-that-cake
  commit id: "Took a giant bite"

```

...and so on.


#### `%content`-macro attribute

This macro is used to simply lift in the content from a `== content` aside block as the
content of content block in the actual slide layout.

An example where this is used together with a `:: %for`-macro can be found in the description
of the [`== content` aside block](#-content-block).



## .json files

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


## Design goals

- **No heavy frameworks in the browser.** No React, no Vue, no build tools. Just browser-native JavaScript, HTML, and CSS.
- **Slides as data.** Presentations are defined as structured plain text files - either in .heed format or JSON—making them easy to version, diff, and edit in any text editor.
- **Plugin support.** Extensions can define new layout types, behaviors, and embedded components.
- **Self-contained.** Everything is served locally with no external dependencies at runtime.
- **Live demos.** Designed for talks where code, emulation, or simulation needs to run live inside the slides. Or just when slides as 
code makes sense. Which it always does. ;)


## Why does this exist?

This project began as a personal tool sometime between 2015–2018, originally designed to support **interactive presentations** about 
C64 assembly programming. At the time, I was writing a Commodore 64 emulator and debugger in JavaScript, and I needed a way to 
embed live C64 code, emulator state, and custom UI elements directly into my slides.

Most slide frameworks either didn't support this level of interactivity, or forced me into an opinionated structure that I just
didn't have the time or mental bandwidth to grok. I needed to produce interactive slides and I needed them now and had not patience
to battle other people's code to get it to load and manage the lifecycle of my emulator

I've since returned to it now and then when I've needed to produce slides and both liked the simplicity but looked... shall we say...
less favorable on the rather cumbersome layout-via-JSON and **fragile** presentation definition reading and parsing. 

And so I just had a presentation to make, and while digging up Heed I noticed that it's actually public on Github, so I figured I
might as well set some time aside and polish it and *make my little boo-boo shine* and make producing slides more ergonomic, get 
error handling sorted out and just generally modernize things and touch up some rather hastily thrown together features.


## Changelog

### [v0.2.3] - 2025-06-25
- Resolved issue where init hooks were not correctly awaited, causing plugins to attempt to render before initialization.
- More robust package manager resolution
- Honor blank lines in the content of aside blocks
- Fork server process rather than spawn, to allow sending of messages and ensuring stdout/stderr order
- Show generated error slide if a slide fails to load
- Added `--silent-ws` flag to `heed`.
- Auto-reconnect dropped Web Socket connections in Slide Viewer and Speaker Notes
- WebSocket communication is now done in terms of "commands" sent _from_ clients and "events" sent _to_ clients.

### [v0.2.2] - 2025-06-24
- Watch presentation for changes on disk and auto-reload content on change
- Watch heed sources for changes and rebuild webapps/restart server on change
- Fixed bogus shebangs in "bin" entrypoints.
- Face-lift & Dark Mode-toggle for Speaker Notes
- Moved collection of speaker notes from browser to server
- Support `== notes` aside blocks to provide speaker notes directly in `.heed` slide files

### [v0.2.1] - 2025-06-23
- Serve presentations directly from archives(zip and tarballs)
- Bundling of all JavaScript sources for the slide viewer and speaker notes web applications.
- Proper handling of CLI arguments for `heed`.
- Friendlier error messages and graceful startup failures for `heed`.
- Read version from `package.json` to avoid announcing the wrong version.

### [v0.2.0] - 2025-06-22
- Support for `column-layout` blocks in the heed file format
- (Breaking) Separation of regular `@`-attributes and `%`-macro attributes
- (Breaking) Macro block types are now also clearly prefixed as macros (`:: for` --> `:: %for`)
- `%accumulate` macro attribute for accumulating values across multiple blocks
- `%reveal` frontmatter macro to simplify revealing content phase-by-phase
- `%content` macro attribute for using content from `== content` aside blocks as actual content. Content wants to be content, apparently.
- Improved error-handling of `.heed`-file parsing, including an "Error-slide" for unparseable slides.

### [v0.1.0] - 2025-06-16
- Initial public release to npm
- Supports content block types: `text`, `html`, `image`, `video`, `table`, `column-layout`
- Plugin-system for adding custom content block types (`mermaid` and `prism` available).
- Custom `.heed` slide format introduced.


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
