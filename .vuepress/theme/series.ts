import { getMdChildren } from "../plugins/seriesTool";

// 定义侧边栏路径常量
const ROOT_CODE_AI = "blogs/CodeExam/AI";
const ROOT_HOBBIES = "blogs/Hobbies";
const ROOT_ML = "blogs/MachineLearning";
const ROOT_DL = "blogs/DeepLearning";
const ROOT_CV = "blogs/ComputerVision";
const ROOT_CV_1 = "blogs/ComputerVision/ImageProcessing";
const ROOT_DF = "blogs/dataFoundry";

export const series = {
  // 机器学习
  "/blogs/MachineLearning": [
    { text: "机器学习", children: getMdChildren(ROOT_ML, "MachineLearning") },
    {
      text: "推荐系统",
      children: getMdChildren(ROOT_ML, "recommendationSystem"),
    },
  ],

  // 深度学习
  "/blogs/DeepLearning": [
    { text: "深度学习", children: getMdChildren(ROOT_DL, "PyTorch") },
  ],
  "/blogs/DeepLearning/EpochalAlgorithms": getMdChildren(
    "blogs/DeepLearning/EpochalAlgorithms",
  ),
  "/blogs/DeepLearning/NetworkStructure": getMdChildren(
    "blogs/DeepLearning/NetworkStructure",
  ),
  "/blogs/DeepLearning/ActivationFunction": getMdChildren(
    "blogs/DeepLearning/ActivationFunction",
  ),
  "/blogs/DeepLearning/LossFunction": getMdChildren(
    "blogs/DeepLearning/LossFunction",
  ),
  "/blogs/DeepLearning/Optimizer": getMdChildren(
    "blogs/DeepLearning/Optimizer",
  ),
  "/blogs/DeepLearning/Normalization": getMdChildren(
    "blogs/DeepLearning/Normalization",
  ),
  "/blogs/DeepLearning/EvaluationMetrics": getMdChildren(
    "blogs/DeepLearning/EvaluationMetrics",
  ),

  // 数据锻造坊
  "/blogs/DataFoundry": [
    {
      text: "DataStructure",
      children: getMdChildren(ROOT_DF, "DataStructure"),
    },
    { text: "Numpy", children: getMdChildren(ROOT_DF, "Numpy") },
    { text: "Matplotlib", children: getMdChildren(ROOT_DF, "Matplotlib") },
  ],

  // 计算机视觉
  "/blogs/ComputerVision/ImageProcessing": [
    { text: "OpenCV 入门", children: getMdChildren(ROOT_CV_1, "OpenCV1") },
    { text: "OpenCV 进阶", children: getMdChildren(ROOT_CV_1, "OpenCV2") },
    { text: "OpenCV 实战", children: getMdChildren(ROOT_CV_1, "OpenCV3") },
  ],
  "/blogs/ComputerVision": [
    { text: "图像生成", children: getMdChildren(ROOT_CV, "ImageGeneration") },
    { text: "目标检测", children: getMdChildren(ROOT_CV, "TargetDetection") },
  ],
  "/blogs/CodeExam/AI": [
    {
      text: "线性代数",
      children: getMdChildren(ROOT_CODE_AI, "LinearAlgebra"),
    },
    {
      text: "机器学习",
      children: getMdChildren(ROOT_CODE_AI, "MachineLearning"),
    },
  ],
  "/blogs/Hobbies": [
    { text: "雀神之路", children: getMdChildren(ROOT_HOBBIES, "mahjong") },
    { text: "音乐之旅", children: getMdChildren(ROOT_HOBBIES, "musictheroy") },
  ],
  "/docs/desktop_app": getMdChildren("docs/desktop_app"),
};
