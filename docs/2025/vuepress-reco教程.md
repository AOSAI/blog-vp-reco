---
title: Vuepress-reco教程
date: 2025/08/15
---

## 1. Node.js 环境配置

我之前使用过 vuepress-theme-hope，不管是 hope 还是现在的 reco，都是基于 vuepress 二次开发的个人博客框架。因此，首先要在电脑中配置 Node.js 环境。

如果不确定自己电脑中是否已经配置过该环境，windows 中打开 cmd 命令行工具，macOS 打开 Terminal 终端，输入以下指令，如果存在，就会显示 npm / node 的版本号。

```
npm -v
node -v
```

这里是 Node.js 官网的[下载地址](https://nodejs.org/en/download)。reco 的 2.x 版本 node 的版本需要大于等于 18。截止 2025 年 8 月，长期稳定版本为 22.18.0，完全符合标准，建议使用 .pkg 的方式进行下载和安装。

### 1.1 Windows 系统

win 安装教程的帖子非常多，搜索一下，找个最新的看一看就行。这里给一个目前比较新的安装教程：[CSDN - Windows11 安装 Node.js 及环境配置](https://blog.csdn.net/haipheng/article/details/147334004)，安装的几个小建议和过程稍微提一下：

1. 建议不要安装在 C 盘，选择其他的固态盘安装。
2. 需要在安装根目录中，新建 node_global 和 node_cache 两个文件夹（可能会遇到没有写入权限的问题），npm 配置 prefix 和 cache 路径参数。
3. 配置系统环境变量，在高级系统设置中。如果电脑多人使用，就配置到 “用户变量” 里，如果就自己，或者大家都能用，可以直接配置到 “系统变量” 中。

### 1.2 macOS 系统

mac 的步骤和 win 类似，但又有所不同。最基础的是 “修改 npm 的全局安装目录到用户目录”，这样可以避免每次 npm 下载库的时候，都需要 sudo 强行提升权限。

```
# 创建一个全局 npm 目录
mkdir "${HOME}/.npm-global"

# 让 npm 使用这个目录
npm config set prefix "${HOME}/.npm-global"

# 把这个路径加入环境变量（如果你用的是 zsh）
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

网上有一些教程帖子，会用 bashrc 而不是 zshrc。但从 macOS Catalina (10.15) 开始，Apple 默认的 shell 就从 Bash 改成了 Zsh。如果不确定的话，可以通过这个命令检查：

```
echo $SHELL
```

更高级一点的可以使用 nvm 进行 node.js 的下载和管理。优点是：nvm 会把 Node 和 npm 安装到用户目录，不会有权限问题；此外可以安装多个 Node 版本，切换方便。

## 2. reco 安装和使用

reco 的安装方式有三种，npm、npx、yarn，在官方首页写的很清楚。以 npm 为例，安装过程中会显示：

```
? Whether to create a new directory? Yes # 是否创建目录 输入 Y
? What's the name of new directory? blog-vuepress-reco-demo # 项目目录名称
? What's the title of your project? blog-demo # 标题（如果准备创建2.x版本，此项无效，可不填写）
? What's the description of your project? blog-demo by vuepress-reco 2.x # 描述（如果准备创建2.x版本，此项无效，可不填写）
? What's the author's name? demo # 作者（如果准备创建2.x版本，此项无效，可不填写）
? What style do you want your home page to be?(The 2.x version is the beta version) # 选择2.x
  blog style for 1.x
  doc style for 1.x
> 2.x
```

选择之后稍作等待项目就创建成功了，使用 vscode 打开该项目，执行 npm install 安装依赖，安装完成之后运行 npm run dev，打开控制台输出的访问链接即可看到页面效果。

### 2.1 项目结构

```
blog-vuepress-reco-demo
├─ docs #该目录下存放编写的文档
│  └─ theme-reco
│     ├─ api.md
│     ├─ plugin.md
│     ├─ theme.md
│     └─ README.md
├─ blogs #该目录下存放编写的博客文章
│     ├─ category1
│     │  ├─ 2018
│     │  │  └─ 121501.md
│     │  └─ 2019
│     │     └─ 092101.md
│     ├─ category2
│     │  ├─ 2016
│     │  │  └─ 121501.md
│     │  └─ 2017
│     │     └─ 092101.md
│     └─ other
│        └─ guide.md
├─ series # vuepress-reco 2.x新增，使用脚手架创建无此目录，可手动创建，与docs目录作用类似
├─ .vuepress        #存放项目配置文件与静态资源
│   ├─ config.ts    #配置文件
│   └─ public       #该目录下存放网页中所需的静态资源
│     ├─ bg.svg   	#首页背景大图
│     ├─ head.png   #头像
│     └─ logo.png   #网站logo
├─ package.json     #依赖管理文件
└─ README.md        #博客首页的内容
```

上述内容借鉴了别人的博客：[vuepress-reco 搭建与部署指南](https://www.cnblogs.com/jinsulive/p/18771812)，前人栽树，后人乘凉，感谢。
