// markdown-it 插件
import markdownItMark from "markdown-it-mark";
import type MarkdownIt from "markdown-it";

// @vuepress/plugin 插件
import { markdownImagePlugin } from "@vuepress/plugin-markdown-image";
import { markdownMathPlugin } from "@vuepress/plugin-markdown-math";
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'

// markdown-it 扩展配置
export const extendsMarkdown = (md: MarkdownIt) => {
  const markdownPlugins = [{ plugin: markdownItMark, options: {} }];

  markdownPlugins.forEach(({ plugin, options }) => md.use(plugin, options));
};

// // VuePress 插件配置
export const plugins = [
  markdownMathPlugin({ type: "katex" }),
  markdownImagePlugin({
    figure: true, // 图片标题
    lazyload: true, //图片懒加载
    mark: false, //图片标记
    size: true, //图片大小
  }),
  mediumZoomPlugin({
    selector: 'img',
    zoomOptions: {
      margin: 16,
    },
    delay: 300,
  }),
];
