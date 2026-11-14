---
title: How to add a book
author: Template
---

Files whose names start with an underscore are hidden. Copy this header into a new file in src/content/books/:

  title     the book's title (required)
  author    the author or authors (required)
  kind      textbook, or book (optional; book by default) - picks the shelf
  blurb     one line on why you recommend it; shown on the card for books without notes
  link      where to find the book, e.g. the publisher's page (optional)
  notes     a notes topic folder, e.g. control; adds a "My notes on ..." link (optional)
  finished  the date you finished it, e.g. 2026-10-31 (optional)
  pages     page count; sets how thick the spine is (optional)
  order     position on the shelf; lower comes first (optional)
  draft     true hides the book (optional)

Everything below the header is your notes, in Markdown, with math if you need it. A line of three dashes on its own starts a new page; without any, each ## heading starts a new page. Leave a blank line above the dashes.

A book with nothing below the header is a recommendation: it gets a ribbon on its spine and opens as a small card with the blurb instead of a book.
