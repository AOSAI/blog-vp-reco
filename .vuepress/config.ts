import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { webpackBundler } from "@vuepress/bundler-webpack";
import theme from "./theme.ts";
import { extendsMarkdown, plugins } from "./plugins/plugins.ts";

export default defineUserConfig({
  title: "AoSaiX",
  description: "Blog for study, life and hobby.",
  bundler: viteBundler(),
  // bundler: webpackBundler(),

  theme: theme,
  extendsMarkdown,
  plugins: plugins,

  // debug: true,
});
