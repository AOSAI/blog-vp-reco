import{_ as d,c as r,a as l,b as e,d as n,e as i,r as p,o as t}from"./app-DCqdGVAs.js";const c={},o={href:"https://nodejs.org/en/download",target:"_blank",rel:"noopener noreferrer"},m={href:"https://blog.csdn.net/haipheng/article/details/147334004",target:"_blank",rel:"noopener noreferrer"},v={href:"https://www.cnblogs.com/jinsulive/p/18771812",target:"_blank",rel:"noopener noreferrer"};function u(b,s){const a=p("ExternalLinkIcon");return t(),r("div",null,[s[9]||(s[9]=l(`<h2 id="_1-node-js-环境配置" tabindex="-1"><a class="header-anchor" href="#_1-node-js-环境配置"><span>1. Node.js 环境配置</span></a></h2><p>我之前使用过 vuepress-theme-hope，不管是 hope 还是现在的 reco，都是基于 vuepress 二次开发的个人博客框架。因此，首先要在电脑中配置 Node.js 环境。</p><p>如果不确定自己电脑中是否已经配置过该环境，windows 中打开 cmd 命令行工具，macOS 打开 Terminal 终端，输入以下指令，如果存在，就会显示 npm / node 的版本号。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">npm -v</span>
<span class="line">node -v</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div>`,4)),e("p",null,[s[1]||(s[1]=n("这里是 Node.js 官网的",-1)),e("a",o,[s[0]||(s[0]=n("下载地址",-1)),i(a)]),s[2]||(s[2]=n("。reco 的 2.x 版本 node 的版本需要大于等于 18。截止 2025 年 8 月，长期稳定版本为 22.18.0，完全符合标准，建议使用 .pkg 的方式进行下载和安装。",-1))]),s[10]||(s[10]=e("h3",{id:"_1-1-windows-系统",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#_1-1-windows-系统"},[e("span",null,"1.1 Windows 系统")])],-1)),e("p",null,[s[4]||(s[4]=n("win 安装教程的帖子非常多，搜索一下，找个最新的看一看就行。这里给一个目前比较新的安装教程：",-1)),e("a",m,[s[3]||(s[3]=n("CSDN - Windows11 安装 Node.js 及环境配置",-1)),i(a)]),s[5]||(s[5]=n("，安装的几个小建议和过程稍微提一下：",-1))]),s[11]||(s[11]=l(`<ol><li>建议不要安装在 C 盘，选择其他的固态盘安装。</li><li>需要在安装根目录中，新建 node_global 和 node_cache 两个文件夹（可能会遇到没有写入权限的问题），npm 配置 prefix 和 cache 路径参数。</li><li>配置系统环境变量，在高级系统设置中。如果电脑多人使用，就配置到 “用户变量” 里，如果就自己，或者大家都能用，可以直接配置到 “系统变量” 中。</li></ol><h3 id="_1-2-macos-系统" tabindex="-1"><a class="header-anchor" href="#_1-2-macos-系统"><span>1.2 macOS 系统</span></a></h3><p>mac 的步骤和 win 类似，但又有所不同。最基础的是 “修改 npm 的全局安装目录到用户目录”，这样可以避免每次 npm 下载库的时候，都需要 sudo 强行提升权限。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line"># 创建一个全局 npm 目录</span>
<span class="line">mkdir &quot;\${HOME}/.npm-global&quot;</span>
<span class="line"></span>
<span class="line"># 让 npm 使用这个目录</span>
<span class="line">npm config set prefix &quot;\${HOME}/.npm-global&quot;</span>
<span class="line"></span>
<span class="line"># 把这个路径加入环境变量（如果你用的是 zsh）</span>
<span class="line">echo &#39;export PATH=$HOME/.npm-global/bin:$PATH&#39; &gt;&gt; ~/.zshrc</span>
<span class="line">source ~/.zshrc</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>网上有一些教程帖子，会用 bashrc 而不是 zshrc。但从 macOS Catalina (10.15) 开始，Apple 默认的 shell 就从 Bash 改成了 Zsh。如果不确定的话，可以通过这个命令检查：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">echo $SHELL</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>更高级一点的可以使用 nvm 进行 node.js 的下载和管理。优点是：nvm 会把 Node 和 npm 安装到用户目录，不会有权限问题；此外可以安装多个 Node 版本，切换方便。</p><h2 id="_2-reco-安装和使用" tabindex="-1"><a class="header-anchor" href="#_2-reco-安装和使用"><span>2. reco 安装和使用</span></a></h2><p>reco 的安装方式有三种，npm、npx、yarn，在官方首页写的很清楚。以 npm 为例，安装过程中会显示：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">? Whether to create a new directory? Yes # 是否创建目录 输入 Y</span>
<span class="line">? What&#39;s the name of new directory? blog-vuepress-reco-demo # 项目目录名称</span>
<span class="line">? What&#39;s the title of your project? blog-demo # 标题（如果准备创建2.x版本，此项无效，可不填写）</span>
<span class="line">? What&#39;s the description of your project? blog-demo by vuepress-reco 2.x # 描述（如果准备创建2.x版本，此项无效，可不填写）</span>
<span class="line">? What&#39;s the author&#39;s name? demo # 作者（如果准备创建2.x版本，此项无效，可不填写）</span>
<span class="line">? What style do you want your home page to be?(The 2.x version is the beta version) # 选择2.x</span>
<span class="line">  blog style for 1.x</span>
<span class="line">  doc style for 1.x</span>
<span class="line">&gt; 2.x</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>选择之后稍作等待项目就创建成功了，使用 vscode 打开该项目，执行 npm install 安装依赖，安装完成之后运行 npm run dev，打开控制台输出的访问链接即可看到页面效果。</p><h3 id="_2-1-项目结构" tabindex="-1"><a class="header-anchor" href="#_2-1-项目结构"><span>2.1 项目结构</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">blog-vuepress-reco-demo</span>
<span class="line">├─ docs #该目录下存放编写的文档</span>
<span class="line">│  └─ theme-reco</span>
<span class="line">│     ├─ api.md</span>
<span class="line">│     ├─ plugin.md</span>
<span class="line">│     ├─ theme.md</span>
<span class="line">│     └─ README.md</span>
<span class="line">├─ blogs #该目录下存放编写的博客文章</span>
<span class="line">│     ├─ category1</span>
<span class="line">│     │  ├─ 2018</span>
<span class="line">│     │  │  └─ 121501.md</span>
<span class="line">│     │  └─ 2019</span>
<span class="line">│     │     └─ 092101.md</span>
<span class="line">│     ├─ category2</span>
<span class="line">│     │  ├─ 2016</span>
<span class="line">│     │  │  └─ 121501.md</span>
<span class="line">│     │  └─ 2017</span>
<span class="line">│     │     └─ 092101.md</span>
<span class="line">│     └─ other</span>
<span class="line">│        └─ guide.md</span>
<span class="line">├─ series # vuepress-reco 2.x新增，使用脚手架创建无此目录，可手动创建，与docs目录作用类似</span>
<span class="line">├─ .vuepress        #存放项目配置文件与静态资源</span>
<span class="line">│   ├─ config.ts    #配置文件</span>
<span class="line">│   └─ public       #该目录下存放网页中所需的静态资源</span>
<span class="line">│     ├─ bg.svg   	#首页背景大图</span>
<span class="line">│     ├─ head.png   #头像</span>
<span class="line">│     └─ logo.png   #网站logo</span>
<span class="line">├─ package.json     #依赖管理文件</span>
<span class="line">└─ README.md        #博客首页的内容</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,13)),e("p",null,[s[7]||(s[7]=n("上述内容借鉴了别人的博客：",-1)),e("a",v,[s[6]||(s[6]=n("vuepress-reco 搭建与部署指南",-1)),i(a)]),s[8]||(s[8]=n("，前人栽树，后人乘凉，感谢。",-1))])])}const g=d(c,[["render",u]]),x=JSON.parse('{"path":"/docs/2025/vuepress-recojiaocheng.html","title":"Vuepress-reco教程","lang":"en-US","frontmatter":{"title":"Vuepress-reco教程","date":"2025/08/15"},"headers":[{"level":2,"title":"1. Node.js 环境配置","slug":"_1-node-js-环境配置","link":"#_1-node-js-环境配置","children":[{"level":3,"title":"1.1 Windows 系统","slug":"_1-1-windows-系统","link":"#_1-1-windows-系统","children":[]},{"level":3,"title":"1.2 macOS 系统","slug":"_1-2-macos-系统","link":"#_1-2-macos-系统","children":[]}]},{"level":2,"title":"2. reco 安装和使用","slug":"_2-reco-安装和使用","link":"#_2-reco-安装和使用","children":[{"level":3,"title":"2.1 项目结构","slug":"_2-1-项目结构","link":"#_2-1-项目结构","children":[]}]}],"git":{"createdTime":1757688790000,"updatedTime":1758298327000,"contributors":[{"name":"jinkai","email":"1213860588@qq.com","commits":1},{"name":"zjk","email":"1213860588@qq.com","commits":1}]},"filePathRelative":"docs/2025/vuepress-reco教程.md"}');export{g as comp,x as data};
