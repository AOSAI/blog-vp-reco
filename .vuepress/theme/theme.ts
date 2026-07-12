import recoTheme from "vuepress-theme-reco";
import { series } from "./series";
import { navbar } from "./navbar";
import { timeline, friendshipLinks } from "./build_in_page";

export default recoTheme({
  logo: "/logo1.svg",
  author: "AoSaiX",
  authorAvatar: "/head.png",
  repo: "https://github.com/AOSAI/aosai-blog.git",
  docsDir: "example",
  lastUpdatedText: "Git仓库提交时间",

  series: series, // series 为原 sidebar
  navbar: navbar,
  pages: timeline,
  friendshipLinks: friendshipLinks,

  // bulletin: {
  //   body: [
  //     {
  //       type: "text",
  //       content: `🎉🎉🎉 reco 主题 2.x 已经接近 Beta 版本，在发布 Latest 版本之前不会再有大的更新，大家可以尽情尝鲜了，并且希望大家在 QQ 群和 GitHub 踊跃反馈使用体验，我会在第一时间响应。`,
  //       style: "font-size: 12px;",
  //     },
  //     {
  //       type: "hr",
  //     },
  //     {
  //       type: "title",
  //       content: "QQ 群",
  //     },
  //     {
  //       type: "text",
  //       content: `
  //       <ul>
  //         <li>QQ群1：1037296104</li>
  //         <li>QQ群2：1061561395</li>
  //         <li>QQ群3：962687802</li>
  //       </ul>`,
  //       style: "font-size: 12px;",
  //     },
  //     {
  //       type: "hr",
  //     },
  //     {
  //       type: "title",
  //       content: "GitHub",
  //     },
  //     {
  //       type: "text",
  //       content: `
  //       <ul>
  //         <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/issues">Issues<a/></li>
  //         <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/discussions/1">Discussions<a/></li>
  //       </ul>`,
  //       style: "font-size: 12px;",
  //     },
  //     {
  //       type: "hr",
  //     },
  //     {
  //       type: "buttongroup",
  //       children: [
  //         {
  //           text: "打赏",
  //           link: "/docs/others/donate.html",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // commentConfig: {
  //   type: 'valine',
  //   // options 与 1.x 的 valineConfig 配置一致
  //   options: {
  //     // appId: 'xxx',
  //     // appKey: 'xxx',
  //     // placeholder: '填写邮箱可以收到回复提醒哦！',
  //     // verify: true, // 验证码服务
  //     // notify: true,
  //     // recordIP: true,
  //     // hideComments: true // 隐藏评论
  //   },
  // },
});
