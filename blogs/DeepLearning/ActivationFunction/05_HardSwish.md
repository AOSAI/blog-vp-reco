---
title: HardSwish 激活函数
date: 2026/05/30
categories:
  - 激活函数
tags:
  - 激活函数
  - HardSwish
  - h-swish
  - ReLU6
---

## 1. 前置知识：ReLU6

2017 年，Google 在设计 MobileNetV2 时遇到一个问题：ReLU 没有上界，输入很大时输出也很大，在手机的低精度计算（INT8）中容易溢出。

解决办法很简单：给 ReLU 加一个上界 6，变成 **ReLU6**。

$$
\text{ReLU6}(x) = \min(\max(0, x), 6)
$$

![1. ReLU6 激活函数图像](/DeepLearning/Activation/04_relu6.png =560x)

**ReLU 家族：**

| 名称          | 公式                  | 上界      | 说明         |
| ------------- | --------------------- | --------- | ------------ |
| ReLU          | $\max(0, x)$          | 无        | 原版         |
| ReLU6         | $\min(\max(0, x), 6)$ | 6         | MobileNet 用 |
| ReLU1/2/3/4/5 | ...                   | 1/2/3/4/5 | 几乎没人用   |

ReLU1 到 ReLU5 都有人试过，但只有 ReLU6 被广泛采用。6 是一个经验选择的值：足够大（不会截断太多特征），又足够小（适合低精度计算）。

**PyTorch 中的使用：**

```python
# ReLU6 激活函数
import torch.nn as nn
relu6 = nn.ReLU6()

# 或者用函数式接口
import torch.functional as F
output = F.relu6(input)
```

## 2. 数学原理：用 ReLU6 近似 Sigmoid

2019 年，Google 在设计 MobileNetV3 时，想在移动端用 Swish（$x \cdot \sigma(x)$），但 Sigmoid 计算量太大。

他们的办法是：**用 ReLU6 代替 Sigmoid**。

$$
\text{h-swish}(x) = x \cdot \frac{\text{ReLU6}(x+3)}{6}
$$

![2. h-swish 激活函数图像](/DeepLearning/Activation/05_hswish.png =560x)

**为什么能代替？**，看图其实就已经知道了，ReLU6(x+3)/6 的曲线和 Sigmoid(x) 的曲线形状很像：

| x   | Sigmoid(x) | ReLU6(x+3)/6 |
| --- | ---------- | ------------ |
| -5  | 0.007      | 0            |
| 0   | 0.5        | 0.5          |
| 5   | 0.993      | 1            |

在 x 很大或很小时，两者几乎一致；中间区域是分段线性近似。

## 3. Swish vs h-swish

| 特性   | Swish               | h-swish                         |
| ------ | ------------------- | ------------------------------- |
| 公式   | $x \cdot \sigma(x)$ | $x \cdot \text{ReLU6}(x+3) / 6$ |
| 计算量 | 大（需要 Sigmoid）  | 小（只有 ReLU6）                |
| 精度   | 高                  | 接近 Swish                      |
| 移动端 | 不友好              | 友好                            |

## 4. PyTorch 中的使用

```python
# h-swish 激活函数
import torch.nn as nn
h_swish = nn.Hardswish()

# 或者手动实现
import torch.nn.functional as F
def h_swish(x):
    return x * F.relu6(x + 3) / 6
```

## 5. 应用场景：什么时候用 h-swish？

**手机端追求精度时用 h-swish：**

| 场景           | 为什么用 h-swish         | 例子         |
| -------------- | ------------------------ | ------------ |
| MobileNetV3    | 深层用 h-swish，精度更高 | 手机图像分类 |
| 移动端目标检测 | 平衡精度和速度           | 手机端 SSD   |
| 边缘设备       | 计算量小，适合 NPU       | 智能摄像头   |

**h-swish 的分层策略（精度与速度的平衡）：**

MobileNetV3 的做法是：浅层用 ReLU，深层用 h-swish。

| 层   | 特征图大小    | 激活函数 | 原因                 |
| ---- | ------------- | -------- | -------------------- |
| 浅层 | 大（112×112） | ReLU     | 计算量小             |
| 深层 | 小（7×7）     | h-swish  | 精度高，计算量可接受 |

这是因为浅层的特征图大，计算量主要在空间维度；深层的特征图小，计算量主要在通道维度，h-swish 的额外开销可以接受。

> h-swish 是移动端的 Swish 替代品，用 `nn.Hardswish()`。
