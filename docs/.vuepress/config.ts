import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
  base: '/aosai-blog/',
  lang: 'zh-CN',
  title: 'AoSaiX',
  description: '记录学习、生活与兴趣',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/aosai-blog/plume.svg' }],
  ],

  bundler: viteBundler(),
  shouldPrefetch: false,

  theme: plumeTheme({
    docsRepo: 'https://github.com/AOSAI/aosai-blog',
    docsDir: 'docs',
    docsBranch: 'main',
    lastUpdated: true,
    cache: 'filesystem',
    search: { provider: 'local' },
    markdown: {
      math: { type: 'katex' },
      image: {
        figure: true,
        lazyload: true,
        mark: false,
        size: true,
      },
      codeTabs: true,
      mark: 'eager',
    },
  }),
})
