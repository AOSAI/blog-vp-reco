---
title: 博客更新日志（内容/插件/踩坑）
date: 2025/09/17
---

## 2025 年日志

### 2025 年 10 月

- 更新了《图像处理》中 “锐化与均衡化”、“形态学与运算”、“视频流处理” 章节。

### 2025 年 9 月下旬

- 更新了《每日一题》的线性代数内容。
- 更新了《生图模型》的综述章节。

1. **模块化了 recoTheme 主题中的内容**：创建了新的 theme 文件夹，将侧边栏、导航栏、内置页面（时间轴、友情链接）分割到了不同的 TS 文件中去。
2. **重构项目结构，适配 Categories 和 Tags**：Reco 主题截止 .26 版本只有 blogs 中的内容才能匹配分类和标签，所以只保留 blogs 和 docs 两个文件夹，series 中的内容全部转移至 blogs 中。
3. **引入了 @vuepress/plugin-medium-zoom**：使用了 ^2.0.0-rc.68 版本的图片缩放插件，配置借鉴了 “七月甘三” 博主。

### 2025 年 9 月中旬

- 更新完善了《图像处理》中的 “噪声与滤波” 章节。
- 创建并更新了《每日一题》，取自牛客网刷题的 AI 篇。
- 对迁移过来的旧博客重新进行了整理和分类。

1. **删除了 @vuepress/plugin-markdown-tab**：reco 有为数不多的自定义 Markdown 扩展，叫做 “自定义容器”，代码有选项卡格式，并且兼容自身主题颜色变换。
2. **自定义了 generateChildren() 插件**：在 .vuepress/plugins/seriesTool.ts 文件中，用于自动获取文件夹路径下的所有 md 文件，返回一个 List，属于侧边栏写法的优化。Reco 自带的 ==autoSetSeries: true== 并不是特别好用，并且只能作用于 series 路径下的文件夹和文件，而自定义的函数，任何路径都可以识别并匹配。
3. **开启了 lastUpdatedText 功能**：和我想的并不一样，它的最后更新时间是通过最后一次提交 git 所记录的，并非最后一次 markdown 文件的修改时间，导致很多文件的最后一次修改时间完全一致。==打一个 Tag，后期优化。==

### 2025 年 9 月上旬

- 更新完善了《图像处理》中的 “基础操作” 章节。
- 迁移了旧博客的所有内容。

1. **markdown-it-katex 替换为 @vuepress/plugin-markdown-math**
2. **markdown-it-imsize 替换为 @vuepress/plugin-markdown-image**：兼顾原有功能，并且还有 显示图像标题、懒加载、图像缩放 三个拓展功能。
3. **删除了 markdown-it-attrs**：在启用图像标题功能时，img 标签外构造了新的容器 <figure\> 导致 attrs 插件失效，因此删除了该插件，直接在全局 CSS 文件中，通过 "figure img" 标签选择器实现单图居中。
4. **引入了 @vuepress/plugin-markdown-tab**：可以在 md 内部构造标签页，包括代码块也可以覆盖。==但是标签页与代码块出现了空行分离的情况，并且并不能随主题进行颜色切换。==

目前 vuepress-reco 与 vuepress 的对应关系是："2.0.0-rc.26" 与 "2.0.0-rc.19"，而 vuepress2.x 版本（包括插件版本）已经到了 "2.0.0-rc.112"，因此在直接运行指令下载时通常会遇到报错，需要加上这两句指令：

1. --legacy-peer-deps：忽略 peer 依赖冲突
2. --force：强制安装

同时，为了兼容版本对应关系，我去查询了 github 的更新日志，70 到 78 的插件版本号都能用。但踩坑的点来了，我取了个 72 的版本号，好听，结果 npm 中唯独缺了 72 这个版本没有，最后下载了使用人数最多了 74 版本。

```cmd
npm install -D @vuepress/plugin-markdown-math@^2.0.0-rc.74 --legacy-peer-deps --force
```

最后，尝试使用了对应版本和最新版本的 shiki（代码块自定义）、medium-zoom（图像缩略图），都有一些异常，使用失败。

### 2025 年 8 月下旬

- 从旧博客迁移了《图像处理》的内容，并更新重写了 “综述” 章节。

由于 Reco 的官方文档写的不够清晰，在解决数学符号解析、图像缩放等问题中，手动引入了 markdown-it 的四个插件。现在基于 Vuepress-V2 的三个主题架构，基本都用的是 TS 的文件格式，但 markdown-it 官方没有 TS 的版本（只有 JS），因此自己写了 .d.ts 文件进行了声明：

1. **markdown-it-attrs**：css 布局选择器嵌入，用来对单个图像居中处理。
2. **markdown-it-mark**：代码黄色高亮
3. **markdown-it-katex**：数学公式与符号的解析
4. **markdown-it-imsize**：在 md 的图像输入方法中使用 “=360x”

多个图像的 flex 布局，在旧博客中使用了媒体查询进行了横屏竖屏分割处理，但是写在每一个 md 文件中的，过于冗余。已通过全局 CSS 文件（styles/index.css）进行了复用。
