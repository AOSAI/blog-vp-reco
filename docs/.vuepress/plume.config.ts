import { defineThemeConfig } from 'vuepress-theme-plume'
import collections from './collections'
import navbar from './navbar'

export default defineThemeConfig({
  logo: '/plume.svg',
  appearance: true,
  outline: [2, 3],
  social: [
    { icon: 'github', link: 'https://github.com/AOSAI/aosai-blog' },
  ],
  profile: {
    avatar: '/plume.svg',
    name: 'AoSaiX',
    description: '记录学习、生活与兴趣',
  },
  navbar,
  collections,
  footer: {
    message: 'Powered by VuePress and Plume',
    copyright: 'AoSaiX',
  },
})
