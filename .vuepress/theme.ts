import recoTheme from "vuepress-theme-reco";
import { getMdChildren } from "./plugins/seriesTool";

// 定义侧边栏路径常量
const ROOT_CODE_AI = "blogs/CodeExam/AI";
const ROOT_HOBBIES = "blogs/Hobbies";
const ROOT_ML = "series/MachineLearning";
const ROOT_DL = "series/DeepLearning";
const ROOT_CV = "series/ComputerVision";
const ROOT_DF = "series/dataFoundry";

export default recoTheme({
  logo: "/logo1.svg",
  author: "AoSaiX",
  authorAvatar: "/head.png",
  // docsRepo: "https://github.com/vuepress-reco/vuepress-theme-reco-next",
  docsBranch: "main",
  docsDir: "example",
  lastUpdatedText: "Git仓库提交时间",

  // autoSetSeries: true, // 自动设置 series
  // series 为原 sidebar
  series: {
    "/series/MachineLearning": [
      { text: "机器学习", children: getMdChildren(ROOT_ML, "MachineLearning") },
      { text: "推荐系统", children: getMdChildren(ROOT_ML, "recommendationSystem") },
    ],
    "/series/DeepLearning": [
      { text: "机器学习", children: getMdChildren(ROOT_DL, "PyTorch") },
    ],
    "/series/DataFoundry": [
      { text: "Numpy", children: getMdChildren(ROOT_DF, "Numpy") },
      { text: "Matplotlib", children: getMdChildren(ROOT_DF, "Matplotlib") },
    ],
    "/series/ComputerVision": [
      { text: "图像处理", children: getMdChildren(ROOT_CV, "ImageProcessing") },
      { text: "生图模型", children: getMdChildren(ROOT_CV, "ImageGeneration") },
      { text: "目标检测", children: getMdChildren(ROOT_CV, "TargetDetection") },
    ],
    "/blogs/CodeExam/AI": [
      { text: "线性代数", children: getMdChildren(ROOT_CODE_AI, "LinearAlgebra") },
      { text: "机器学习", children: getMdChildren(ROOT_CODE_AI, "MachineLearning") },
    ],
    "/blogs/Hobbies": [
      { text: "雀神之路", children: getMdChildren(ROOT_HOBBIES, "mahjong") },
      { text: "音乐之旅", children: getMdChildren(ROOT_HOBBIES, "musictheroy") },
    ],
    "/docs/desktop_app": getMdChildren("docs/desktop_app")
  },
  navbar: [
    {
      text: "机器学习",
      children: [
        { text: "机器学习(未整理)", link: "/series/MachineLearning/MachineLearning/01_introduction" },
        { text: "推荐系统(未整理)", link: "/series/MachineLearning/recommendationSystem/00_introduction" },
      ],
    },
    {
      text: "数据锻造坊",
      children: [
        { text: "Numpy", link: "/series/DataFoundry/Numpy/01_拜入宗门" },
        { text: "Matplotlib", link: "/series/DataFoundry/Matplotlib/01_xxx" },
      ],
    },
    {
      text: "深度学习",
      children: [
        { text: "PyTorch(未整理)", link: "/series/DeepLearning/PyTorch/README.md" },
      ],
    },
    {
      text: "计算机视觉",
      children: [
        { text: "图像处理", link: "/series/ComputerVision/ImageProcessing/01_综述" },
        { text: "生图模型", link: "/series/ComputerVision/ImageGeneration/01_综述" },
        { text: "目标检测", link: "/series/ComputerVision/TargetDetection/01_综述"},
      ],
    },
    {
      text: "每日一题",
      children: [
        { text: "AI算法篇", link: "/blogs/CodeExam/AI/Introduction" },
        // { text: "AI-机器学习", link: "/docs/2025/vuepress-reco教程" },
        // { text: "AI-深度学习", link: "/docs/2025/vuepress-reco教程" },
        // { text: "AI-CV与NLP", link: "/docs/2025/vuepress-reco教程" },
        // { text: "AI-笔试真题", link: "/docs/2025/vuepress-reco教程" },
      ],
    },
    {
      text: "学思随录",
      children: [
        { text: "博客更新日志", link: "/docs/update_record" },
        { text: "2025年", link: "/docs/2025/vuepress-reco教程" },
        { text: "桌面软件开发(未整理)", link: "/docs/desktop_app/README.md" },  
      ],
    },
    {
      text: "逐趣成章",
      children: [
        { text: "雀神之路(未整理)", link: "/blogs/Hobbies/mahjong/01_fargoing" },
        { text: "音乐科学(未整理)", link: "/blogs/Hobbies/musictheroy/00" },
      ],
    },
    // {
    //   text: "烟火人间",
    //   children: [
    //     { text: "烟火人间", link: "#" },
    //   ],
    // },
  ],
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
