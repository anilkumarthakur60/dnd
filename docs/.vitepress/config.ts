import { defineConfig } from 'vitepress'

const REPO = 'https://github.com/anilkumarthakur60/vue-dnd'
const DEMOS = 'https://anil-labs-dnd.vercel.app'

export default defineConfig({
  // '/' for local dev and custom domains; the Pages workflow sets DOCS_BASE
  // to '/vue-dnd/' for the GitHub Pages project site.
  base: process.env.DOCS_BASE ?? '/',
  title: '@anil-labs/dnd',
  description:
    'Zero-dependency drag & drop — sortable lists, cross-list groups, clone, multi-drag, swap, keyboard a11y and FLIP animation — for React, Vue, Svelte, Solid and Web Components.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#6ea8ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '@anil-labs/dnd' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Zero-dependency drag & drop with React, Vue, Svelte, Solid and Web Component bindings.',
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Frameworks', link: '/frameworks/react' },
      { text: 'Reference', link: '/reference/options' },
      { text: 'Demos', link: DEMOS },
      {
        text: '0.1.0',
        items: [
          { text: 'Changelog', link: `${REPO}/releases` },
          { text: 'npm', link: 'https://www.npmjs.com/package/@anil-labs/dnd-core' },
        ],
      },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is it?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Groups & Cloning', link: '/guide/groups' },
            { text: 'Handles, Filters & Touch', link: '/guide/handles-and-filters' },
            { text: 'Multi-Drag', link: '/guide/multi-drag' },
            { text: 'Keyboard & Accessibility', link: '/guide/keyboard' },
            { text: 'Animation', link: '/guide/animation' },
            { text: 'Swap, Grids & Tables', link: '/guide/swap-and-grids' },
            { text: 'Nested Lists', link: '/guide/nested' },
            { text: 'Styling & Custom Ghosts', link: '/guide/styling' },
          ],
        },
        {
          text: 'Frameworks',
          items: [
            { text: 'Vanilla / CDN', link: '/frameworks/vanilla' },
            { text: 'React', link: '/frameworks/react' },
            { text: 'Vue 3', link: '/frameworks/vue' },
            { text: 'Svelte', link: '/frameworks/svelte' },
            { text: 'Solid', link: '/frameworks/solid' },
            { text: 'Web Component', link: '/frameworks/web-component' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Options', link: '/reference/options' },
            { text: 'Events', link: '/reference/events' },
            { text: 'API', link: '/reference/api' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    editLink: {
      pattern: `${REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Er. Anil Kumar Thakur',
    },
  },
})
