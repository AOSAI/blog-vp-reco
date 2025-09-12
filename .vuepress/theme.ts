import recoTheme from "vuepress-theme-reco";

export default recoTheme({
  logo: "/logo1.svg",
  author: "AoSaiX",
  authorAvatar: "/head.png",
  // docsRepo: "https://github.com/vuepress-reco/vuepress-theme-reco-next",
  docsBranch: "main",
  docsDir: "example",
  lastUpdatedText: "",

  // autoSetSeries: true, // 自动设置 series
  // series 为原 sidebar
  series: {
    "/series/ComputerVision": [
      {
        text: "图像处理",
        children: [
          "/ImageProcessing/01_综述",
          "/ImageProcessing/02_基础操作",
          "/ImageProcessing/03_噪声与滤波",
          "/ImageProcessing/04_信号与图像",
          "/ImageProcessing/05_形态学与特征",
          "/ImageProcessing/06_压缩与编码",
        ],
      },
      {
        text: "生图模型",
        children: [
          "/ImageGeneration/01_综述",
          "/ImageGeneration/02_xxx",
          "/ImageGeneration/02_xxx",
        ],
      },
      {
        text: "目标检测",
        children: [
          "/TargetDetection/01_综述",
          "/TargetDetection/02_xxx",
          "/TargetDetection/02_xxx",
        ],
      },
    ],
    "/blogs": [
      {
        text: "桌面软件开发",
        children: [
          "/desktop_app/README.md",
          "/desktop_app/01_compress_photo",
          "/desktop_app/02_file_packaging",
          "/desktop_app/03_pyqt5_recording",
          "/desktop_app/04_spider_for_ticket",
        ],
      },
      {
        text: "机器学习",
        children: [
          "/intelligence/MachineLearning/README.md",
          "/intelligence/MachineLearning/02_linear_regression",
          "/intelligence/MachineLearning/03_linear_regression",
          "/intelligence/MachineLearning/04_classification",
          "/intelligence/MachineLearning/05_deep_learning",
          "/intelligence/MachineLearning/06_tensorflow",
          "/intelligence/MachineLearning/07_model_evaluation",
          "/intelligence/MachineLearning/08_decision_tree",
          "/intelligence/MachineLearning/09_unsupervised_learning",
          "/intelligence/MachineLearning/10_recommendation_system",
          "/intelligence/MachineLearning/11_reinforcement_learning",
        ],
      },
      {
        text: "Matplotlib",
        children: [
          "/intelligence/Matplotlib/README.md",
          "/intelligence/Matplotlib/01.md",
        ],
      },
      {
        text: "Numpy",
        children: [
          "/intelligence/Numpy/README.md",
          "/intelligence/Numpy/01.md",
        ],
      },
      {
        text: "PyTorch",
        children: [
          "/intelligence/PyTorch/README.md",
          "/intelligence/PyTorch/01_base",
          "/intelligence/PyTorch/02_project1",
          "/intelligence/PyTorch/02_project2",
          "/intelligence/PyTorch/03_project1",
        ],
      },
      {
        text: "推荐系统",
        children: [
          "/intelligence/recommendationSystem/README.md",
          "/intelligence/recommendationSystem/01_recommend_model",
        ],
      },
      {
        text: "雀神之路",
        children: [
          "/dobetter/mahjong/README.md",
          "/dobetter/mahjong/01_fargoing",
          "/dobetter/mahjong/02_sichuan",
        ],
      },
      {
        text: "音乐之旅",
        children: [
          "/dobetter/musictheroy/README.md",
          "/dobetter/musictheroy/01.md",
        ],
      },
    ],
  },
  navbar: [
    {
      text: "旧博客迁移(未整理)",
      children: [
        {
          text: "桌面软件开发",
          link: "/blogs/desktop_app/README.md",
        },
        {
          text: "机器学习",
          link: "/blogs/intelligence/MachineLearning/readme",
        },
        {
          text: "Matplotlib",
          link: "/blogs/intelligence/Matplotlib/readme",
        },
        {
          text: "Numpy",
          link: "/blogs/intelligence/Numpy/readme",
        },
        {
          text: "PyTorch",
          link: "/blogs/intelligence/PyTorch/readme",
        },
        {
          text: "推荐系统",
          link: "/blogs/intelligence/recommendationSystem/readme",
        },
        {
          text: "雀神之路",
          link: "/blogs/dobetter/mahjong/README",
        },
        {
          text: "音乐之旅",
          link: "/blogs/dobetter/musictheroy/README",
        },
      ],
    },
    {
      text: "计算机视觉",
      children: [
        {
          text: "图像处理",
          link: "/series/ComputerVision/ImageProcessing/01_综述",
        },
        {
          text: "生图模型",
          link: "/series/ComputerVision/ImageGeneration/01_综述",
        },
        {
          text: "目标检测",
          link: "/series/ComputerVision/TargetDetection/01_综述",
        },
      ],
    },
    {
      text: "学思随录",
      children: [
        { text: "2025年", link: "/docs/2025/vuepress-reco教程" },
        // { text: "vuepress-theme-reco", link: "/blogs/other/guide" },
      ],
    },
    {
      text: "星河驿站",
      children: [
        { text: "烟火人间", link: "#" },
        { text: "逐趣成章", link: "#" },
      ],
    },
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
