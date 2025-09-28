import fs from "fs";
import path from "path";

/**
 * 生成 children 数组
 * @param rootDir 项目根目录下的模块根路径，用于生成最终前缀，例如 "series/ComputerVision"
 * @param subDir rootDir 下的子目录（可选），例如 "ImageProcessing"
 */
export function getMdChildren(rootDir: string, subDir?: string) {
  // 计算目录的绝对路径
  const dirPath = subDir
    ? path.resolve(process.cwd(), rootDir, subDir)
    : path.resolve(process.cwd(), rootDir);

  const files = fs
    .readdirSync(dirPath)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      // 拼接最终路径：/subDir/文件名 or /rootDir/文件名
      const relativePath = subDir
        ? path.join("/", subDir, f).replace(/\\/g, "/")
        : path.join("/", f).replace(/\\/g, "/");

      return relativePath.replace(/\.md$/, "");
    })
    .sort((a, b) => {
      // 把 a 和 b 拆成字母和数字
      const re = /(\D+)(\d+)/;
      const [, aStr, aNum] = a.match(re) || ["", a, "0"];
      const [, bStr, bNum] = b.match(re) || ["", b, "0"];
      
      // 先比较字母部分，再比较数字部分
      if (aStr !== bStr) return aStr.localeCompare(bStr, "zh");
      return Number(aNum) - Number(bNum);
    });

  return files;
}
