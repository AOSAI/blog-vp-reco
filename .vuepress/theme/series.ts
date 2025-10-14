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
  "/blogs/MachineLearning": [
    { text: "机器学习", children: getMdChildren(ROOT_ML, "MachineLearning") },
    { text: "推荐系统", children: getMdChildren(ROOT_ML, "recommendationSystem") },
  ],
  "/blogs/DeepLearning": [
    { text: "机器学习", children: getMdChildren(ROOT_DL, "PyTorch") },
  ],
  "/blogs/DataFoundry": [
    { text: "Numpy", children: getMdChildren(ROOT_DF, "Numpy") },
    { text: "Matplotlib", children: getMdChildren(ROOT_DF, "Matplotlib") },
  ],
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
    { text: "线性代数", children: getMdChildren(ROOT_CODE_AI, "LinearAlgebra") },
    { text: "机器学习", children: getMdChildren(ROOT_CODE_AI, "MachineLearning") },
  ],
  "/blogs/Hobbies": [
    { text: "雀神之路", children: getMdChildren(ROOT_HOBBIES, "mahjong") },
    { text: "音乐之旅", children: getMdChildren(ROOT_HOBBIES, "musictheroy") },
  ],
  "/docs/desktop_app": getMdChildren("docs/desktop_app")
}
