---
title: Focal Loss：难样本聚焦损失
date: 2026/07/05
categories:
  - 损失函数
tags:
  - 损失函数
  - Focal Loss
  - 类别不平衡
---

## 1. 什么是 Focal Loss？

Focal Loss 是在[交叉熵损失](./02_CELoss.md)上增加一个权重，让模型少关注已经分对的简单样本，把更多精力留给难样本。

它最早由 2017 年的 [Focal Loss for Dense Object Detection](https://arxiv.org/abs/1708.02002) 提出。当时的一阶段目标检测器会在一张图上产生大量候选位置，其中绝大多数都是很容易判断的背景。虽然每个背景位置的损失都不大，但数量太多，加起来仍然会淹没少量真正有用的难样本。

Focal Loss 要解决的就是：

> **大量简单样本已经学会了，就不要再让它们主导训练。**

### 1.1 从交叉熵到 Focal Loss

先用 $p_t$ 表示模型给真实类别的概率：

$$
p_t=
\begin{cases}
p, & y=1 \\
1-p, & y=0
\end{cases}
$$

- $y=1$：真实标签是正类，$p_t=p$。
- $y=0$：真实标签是负类，$p_t=1-p$。

这样，无论真实标签是正类还是负类，都只需要看一个问题：**模型给真实类别的概率有多大？**

交叉熵可以写成：

$$
\text{CE}(p_t)=-\log(p_t)
$$

Focal Loss 在前面乘上一个调制因子：

$$
\text{Focal Loss}(p_t)
=
-\alpha_t(1-p_t)^\gamma\log(p_t)
$$

其中，真正负责区分难样本和简单样本的是：

$$
(1-p_t)^\gamma
$$

- $p_t$ 接近 1：模型已经预测正确，调制因子接近 0，损失被大幅减小。
- $p_t$ 很小：模型对真实类别没有信心，调制因子仍然较大，损失被保留下来。

![Fig.1 Focal Loss：降低简单样本的损失权重](/DeepLearning/Loss/04_focal_loss.png)

### 1.2 一个具体的计算例子

先忽略 $\alpha_t$，取 $\gamma=2$，只看 Focal Loss 怎样区分样本难度。

**简单样本：$p_t=0.9$**

```text
交叉熵 = -log(0.9) ≈ 0.105
调制因子 = (1 - 0.9)² = 0.01
Focal Loss = 0.01 × 0.105 ≈ 0.001
```

**困难样本：$p_t=0.2$**

```text
交叉熵 = -log(0.2) ≈ 1.609
调制因子 = (1 - 0.2)² = 0.64
Focal Loss = 0.64 × 1.609 ≈ 1.030
```

交叉熵本来就会让困难样本产生更大的损失。Focal Loss 又把简单样本的损失进一步压低，使困难样本在总损失中的占比变得更高。

## 2. $\alpha$ 和 $\gamma$ 分别控制什么？

Focal Loss 有两个重要参数，但它们解决的不是同一个问题。

### 2.1 $\gamma$：区分简单样本和困难样本

$\gamma$ 控制 Focal Loss 要多大程度地忽略简单样本：

- $\gamma=0$：调制因子恒等于 1，Focal Loss 退化成交叉熵。
- $\gamma$ 越大：简单样本的损失下降得越快，训练越集中在困难样本上。
- $\gamma=2$：原论文和 Torchvision 封装中的常用默认值，但不是所有任务的固定答案。

所以，$\gamma$ 回答的是：

> **这个样本已经分得这么准了，还需要关注多少？**

### 2.2 $\alpha$：平衡正样本和负样本

$\alpha$ 用来调节正样本和负样本的权重：

$$
\alpha_t=
\begin{cases}
\alpha, & y=1 \\
1-\alpha, & y=0
\end{cases}
$$

- $\alpha$ 控制正类的权重。
- $1-\alpha$ 控制负类的权重。
- Torchvision 默认使用 $\alpha=0.25$，沿用 RetinaNet 的常用配置。

$\alpha$ 并不是自动根据样本数量计算出来的，也不是越大越好。它需要结合正负样本比例和 $\gamma$ 一起调整。

两个参数的分工可以概括成：

- $\alpha$：平衡正类和负类。
- $\gamma$：平衡简单样本和困难样本。

### 2.3 正负样本需要保持 1:1 吗？

正负样本没有必须遵守的固定比例，更不一定要保持 1:1。是否调整样本比例，要根据任务决定：

- 普通二分类可以通过重采样让两类数量更接近，但这不是必要条件。
- 目标检测中的背景位置远多于目标位置。一阶段检测器通常保留这种不平衡，再用 Focal Loss 降低简单背景样本的影响。
- 语义分割中的正负像素数量由目标面积决定，很难强行调整成 1:1，通常会使用损失加权或针对前景进行采样。

如果为了凑成 1:1 而删除大量负样本，模型可能看不到足够多的背景情况。因此，样本比例只是训练策略的一部分，$\alpha$ 也不能机械地按照正负样本数量计算。

这三种方法控制的是不同问题：

- **采样策略**：决定模型能够看到哪些样本。
- **$\alpha$**：决定正样本和负样本在损失中各占多大权重。
- **$\gamma$**：根据预测难度，进一步降低简单样本的权重。

RetinaNet 常用的 $\alpha=0.25$、$\gamma=2$ 是两个参数共同调试得到的经验配置，并不是根据正负样本比例直接换算出来的通用答案。

## 3. PyTorch 中的使用

PyTorch 核心库没有 `nn.FocalLoss`，但 Torchvision 已经提供了官方函数 [`torchvision.ops.sigmoid_focal_loss`](https://docs.pytorch.org/vision/stable/generated/torchvision.ops.sigmoid_focal_loss.html)。

它接收 logits，不需要提前调用 Sigmoid；`targets` 必须和 logits 形状相同，并使用 0、1 表示每个位置是不是对应类别。

::: tabs
@tab Torchvision 封装

```python
import torch
from torchvision.ops import sigmoid_focal_loss


# 每一行表示一个样本，每一列表示一个类别
logits = torch.tensor([
    [2.0, -1.0, 0.3],
    [-0.5, 1.5, -1.2],
])

# Sigmoid Focal Loss 把每个类别分别看成二分类
targets = torch.tensor([
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
])

loss = sigmoid_focal_loss(
    inputs=logits,
    targets=targets,
    alpha=0.25,
    gamma=2.0,
    reduction="mean",
)
```

@tab 手写实现

```python
import torch
import torch.nn.functional as F


def focal_loss(
    logits,
    targets,
    alpha=0.25,
    gamma=2.0,
    reduction="mean",
):
    targets = targets.float()

    # 先逐元素计算二元交叉熵
    ce_loss = F.binary_cross_entropy_with_logits(
        logits, targets, reduction="none"
    )

    # p_t 是模型给真实类别的概率
    probs = torch.sigmoid(logits)
    p_t = probs * targets + (1 - probs) * (1 - targets)

    # gamma 降低简单样本的权重
    focal_weight = (1 - p_t) ** gamma

    # alpha 平衡正样本和负样本
    alpha_t = alpha * targets + (1 - alpha) * (1 - targets)
    loss = alpha_t * focal_weight * ce_loss

    if reduction == "mean":
        return loss.mean()
    if reduction == "sum":
        return loss.sum()
    return loss
```

:::

Torchvision 提供的是 **Sigmoid Focal Loss**：每个类别分别进行二分类。因此，它既可以处理二分类，也可以处理多标签分类和目标检测中的多类别预测。

## 4. 总结和扩展

### 4.1 优点与局限

**优点：**

- 大幅降低大量简单样本对总损失的影响。
- 不需要直接删除样本，所有样本仍然可以参与训练。
- 适合正负样本数量悬殊、简单负样本特别多的任务。

**局限：**

- $\alpha$ 和 $\gamma$ 需要根据任务调整。
- $\gamma$ 过大时，很多样本的梯度都会变小，训练可能变慢。
- 标注错误的样本长期表现为困难样本，Focal Loss 可能持续放大它们的影响。
- 如果数据本身比较均衡，交叉熵可能已经足够，Focal Loss 不一定更好。

### 4.2 Focal Loss 用在哪些任务中？

Focal Loss 不是目标检测专属，但它最典型的应用仍然是大量候选位置带来的类别不平衡。

- **RetinaNet 目标检测**：原论文专门为一阶段检测器设计 Focal Loss。一张图里有大量背景锚框，真正包含物体的锚框很少。Focal Loss 降低简单背景锚框的权重，让分类头集中学习难判断的位置。当前 [Torchvision 的 RetinaNet](https://github.com/pytorch/vision/blob/main/torchvision/models/detection/retinanet.py) 仍然直接使用 `sigmoid_focal_loss`。
- **FCOS 无锚框目标检测**：FCOS 不再生成传统锚框，但仍然要在密集特征图上判断每个位置是否属于目标。当前 [Torchvision 的 FCOS](https://github.com/pytorch/vision/blob/main/torchvision/models/detection/fcos.py) 也使用 Focal Loss 计算分类损失。
- **医学图像分割**：[AnatomyNet](https://arxiv.org/abs/1808.05238) 用于头颈部 CT 多器官分割，其中视交叉、视神经等结构很小。它把 Dice 和 Focal Loss 组合起来，同时处理区域重叠和小结构难以学习的问题。

这些任务形式不同，但都有一个共同点：**少量重要样本周围，存在大量容易判断的背景或多数类样本。**

### 4.3 Focal Loss 的后续变体

Focal Loss 提出之后，目标检测和医学分割又出现了很多针对具体问题的变体：

- [Generalized Focal Loss](https://arxiv.org/abs/2006.04388)：把分类置信度和定位质量放到同一个连续标签中学习。
- [Varifocal Loss](https://arxiv.org/abs/2008.13367)：让检测分数同时反映目标存在概率和边框定位质量。
- [Focal Tversky Loss](https://arxiv.org/abs/1810.07842)：把难样本聚焦思想用于区域重叠，常见于小病灶分割。

这些方法都保留了 Focal Loss 的核心思想：**减少简单样本的影响，把训练重点留给更难、更重要的样本。**
