# Security Policy

## Supported versions

This project is pre-1.0. Security fixes are released against the **latest**
published version of each `@anil-labs/dnd-*` package. Please make sure you are
on the newest release before reporting.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately instead:

- Preferred: [open a private security advisory](https://github.com/anilkumarthakur60/vue-dnd/security/advisories/new)
  on GitHub, or
- Email **anilkumarthakur60@gmail.com** with the details.

Please include:

- the affected package and version,
- a description of the issue and its impact,
- and steps (or a proof of concept) to reproduce it.

You can expect an acknowledgement within a few days. Once a fix is ready, a
patched release will be published and the advisory disclosed, crediting you
unless you prefer to remain anonymous.

## Scope

This is a client-side UI library with **zero runtime dependencies**. It never
parses or renders strings as HTML — items are rendered by *your* framework
code, and the default drag ghost clones existing DOM. Anything a
`ghostFactory` or `clone` callback builds is application code and an
application-level concern rather than a library vulnerability.
