# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Nested `<Draggable>` no longer renders flat in consumer-side scoped styles.
  The component root is now `<div class="vue-dnd-wrap">` so Vue's scoped-style
  `data-v-*` id propagates onto the root element, letting consumer-provided
  scoped class rules (e.g. nested tree styling) match.

## [0.1.0]

Initial release.
