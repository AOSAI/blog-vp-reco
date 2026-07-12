---
title: SiLU 激活函数
date: 2026/05/30
categories:
  - 激活函数
tags:
  - 激活函数
  - SiLU
  - Swish
---

## 1. 数学原理：x 乘以 Sigmoid

2017 年，Google Brain 的 researchers 在寻找比 ReLU 更好的激活函数时，发现了一个简单的公式：**x 乘以 Sigmoid(x)**。他们给它取名 **Swish**，来自 "self-gated activation"（自门控激活）。

后来 PyTorch 把它收录进自己的库，改名叫 **SiLU**（Sigmoid Linear Unit）。名字不同，但本质一样：

$$
\text{SiLU}(x) = x \cdot \sigma(x) = \frac{x}{1+e^{-x}}
$$

![1. SiLU 激活函数图像 =560x](/DeepLearning/Activation/04_silu.png)

**和 ReLU 的区别：**

| 特性   | ReLU                 | SiLU                   |
| ------ | -------------------- | ---------------------- |
| 公式   | $\max(0, x)$         | $x \cdot \sigma(x)$    |
| 负半轴 | 直接为 0             | 有微小负值（约 -0.28） |
| 平滑性 | 不平滑（x=0 处折角） | 平滑（处处可导）       |

SiLU 在负半轴不是直接为 0，而是有一个微小的负值。这使得 SiLU 比 ReLU 更平滑，理论上表达能力更强。

> **一句话记住**：SiLU = Swish = $x \cdot \sigma(x)$，PyTorch 用 `nn.SiLU()`。

## 2. 梯度

SiLU 的导数可以用自身表示：

$$
\text{SiLU}'(x) = \sigma(x) \cdot (1 + x \cdot (1 - \sigma(x)))
$$

这个导数在 x=0 附近有负值，这意味着 SiLU 有"自正则化"效果——部分神经元的梯度为负，会轻微抑制激活值。

## 3. PyTorch 中的使用

```python
# SiLU 激活函数
import torch.nn as nn
silu = nn.SiLU()

# 或者用函数式接口
import torch.functional as F
output = F.silu(input)
```

## 4. 应用场景：什么时候用 SiLU？

激活函数是工具，不同的场景用不同的工具。

**服务器端追求精度时用 SiLU：**

| 场景        | 为什么用 SiLU             | 例子                     |
| ----------- | ------------------------- | ------------------------ |
| Kaggle 比赛 | SiLU 比 ReLU 精度高 1-2%  | 争取 Top 排名            |
| 论文复现    | 很多论文用 SiLU           | 保证实验可复现           |
| 深层网络    | SiLU 更平滑，梯度流动更好 | ResNet-101、EfficientNet |

**实际案例：**

- EfficientNet-B7：用 SiLU，ImageNet Top-1 准确率 84.3%
- ConvNeXt：用 SiLU，精度比 ReLU 高约 1.5%

> **一句话记住**：服务器端追求精度用 SiLU。
