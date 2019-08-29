---
title: Markdown and Elm
date: 1564885813834
description: Making a static site generator with Elm.
image: https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1440
tags: [ web, elm, markdown ]
---

So last night I wanted to work on a procedural RPG game that I've been hacking around with for the past few weeks.

But then I remembered that I bought my new domain (rhg.dev), and wanted to throw up a quick and simple blogging site. That way I could write about the neat stuff I learned along the way.

So naturally I decided to roll my own static site generator. 🤦‍♂️

## welcome to this website.

Instead of using something like [Hugo](https://gohugo.io), I decided that my use case was pretty simple, and I could just build my own static site generator from scratch with Elm!

Very quickly I realized that I was _actually_ building an Elm file generator in NodeJS and had little to no idea why I was going down this rabbit hole.

### how does it work?

Basically, I want to write my content in a markdown file like this:

```md
---
title: Markdown and Elm
date: 1564885813834
description: Making a static site generator with Elm.
image: https://images.unsplash.com/...
tags: [ web, elm, markdown ]
---

So last night I wanted to work on a procedural RPG game that
I've been hacking around with for the past few weeks.

...
```

I use this dope npm package called [frontmatter](https://www.npmjs.com/package/front-matter) that extracts all the metadata at the top of the file, and gives me something like this:

```json
{
  "attributes": {
    "title": "Markdown and Elm",
    "date": 1564885813834,
    "description": "Making a static site generator with Elm.",
    "image": "https://images.unsplash.com/...",
    "tags": [ "web", "elm", "markdown" ]
  },
  "body": "So last night I wanted [...]"
}
```

Once the markdown is represented as JSON, I just use a function and string interpolation to generate Elm source code as text. I save that text to the file system, and then compile it with `elm make`:

```elm
module Content.Posts.MarkdownAndElm exposing (content)

import Content exposing (Content)
import Meta exposing (Meta)
import Time


content : Content
content =
    Content meta markdown


meta : Meta
meta =
    { title = "Markdown and Elm"
    , slug = "markdown-and-elm"
    , date = Time.millisToPosix 1564885813834
    , description = "Making a static site generator with Elm."
    , image = "https://images.unsplash.com/..."
    , tags = [ "web", "elm", "markdown" ]
    }


markdown : String
markdown =
    "So last night I wanted to work [...]"

```

To get the module names and routes, I scan all the `.md` files in th `posts/` folder.

So for `posts/markdown-and-elm.md` I create a module called `Content.Pages.MarkdownAndElm` and generate a route at `/posts/markdown-and-elm`.

There's also some additional stuff in there for generating out the `.html` files so they are available on request.

### want to check it out?

It's all available on my Github here: https://github.com/ryannhg/rhg-dev

(What a wild way to spend a Saturday night)
