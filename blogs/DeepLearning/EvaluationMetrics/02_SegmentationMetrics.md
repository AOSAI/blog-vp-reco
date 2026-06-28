---
title: 分割任务评价指标
date: 2026/06/28
categories:
  - 评价指标
tags:
  - 评价指标
  - 图像分割
  - mIoU
  - Dice
---

## 1. mIoU

### 1.1 数学公式与原理解释

IoU 全名是 **Intersection over Union**，中文常叫**交并比**。

它先针对某一个类别计算。比如现在只看“车”这个类别，那么：

$$
\text{IoU} = \frac{\text{预测区域} \cap \text{真实区域}}{\text{预测区域} \cup \text{真实区域}}
$$

拆成两句话：

- **交集**：预测区域和真实区域重叠的部分。
- **并集**：预测区域和真实区域合在一起的全部部分。

![Fig.1 mIoU：先算每个类别的 IoU，再求平均](/DeepLearning/EvaluationMetrics/02_miou.png)

举一个数字例子：

```text
真实区域有 100 个像素
预测区域有 90 个像素
两者重叠了 80 个像素
```

那么：

```text
交集 = 80
并集 = 100 + 90 - 80 = 110
IoU = 80 / 110 ≈ 0.727
```

mIoU 的 `m` 是 mean，意思是平均。分割任务通常有多个类别，所以要先算每个类别的 IoU，再求平均：

```text
天空 IoU = 0.91
道路 IoU = 0.86
车 IoU = 0.72
人 IoU = 0.65

mIoU = (0.91 + 0.86 + 0.72 + 0.65) / 4 = 0.785
```

一句话记住：

> **IoU 看一个类别的区域重叠，mIoU 看所有类别 IoU 的平均值。**

### 1.2 PyTorch / NumPy 中怎么使用

计算 mIoU 前，先把模型输出整理成类别图。

PyTorch 中：

```python
import torch

# logits: (N, C, H, W)
# C 是类别数
preds = logits.argmax(dim=1)  # (N, H, W)

# target: (N, H, W)，每个像素是真实类别
```

NumPy 中：

```python
import numpy as np

# logits: (N, C, H, W)
preds = np.argmax(logits, axis=1)  # (N, H, W)
```

得到 `preds` 和 `target` 后，再按类别统计交集和并集。

### 1.3 手写实现

::::: code-group
:::: code-group-item PyTorch

```python
import torch

def mean_iou(preds, target, num_classes, ignore_index=None, eps=1e-6):
    """
    preds:  (N, H, W)，预测类别
    target: (N, H, W)，真实类别
    """
    ious = []

    if ignore_index is not None:
        valid = target != ignore_index
        preds = preds[valid]
        target = target[valid]

    for cls in range(num_classes):
        pred_cls = preds == cls
        target_cls = target == cls

        intersection = (pred_cls & target_cls).sum().float()
        union = (pred_cls | target_cls).sum().float()

        if union == 0:
            continue

        iou = intersection / (union + eps)
        ious.append(iou)

    if len(ious) == 0:
        return torch.tensor(0.0)

    return torch.stack(ious).mean()
```

::::
:::: code-group-item NumPy

```python
import numpy as np

def mean_iou_np(preds, target, num_classes, ignore_index=None, eps=1e-6):
    ious = []

    if ignore_index is not None:
        valid = target != ignore_index
        preds = preds[valid]
        target = target[valid]

    for cls in range(num_classes):
        pred_cls = preds == cls
        target_cls = target == cls

        intersection = np.logical_and(pred_cls, target_cls).sum()
        union = np.logical_or(pred_cls, target_cls).sum()

        if union == 0:
            continue

        ious.append(intersection / (union + eps))

    return float(np.mean(ious)) if ious else 0.0
```

::::
:::::

## 2. Dice

### 2.1 数学公式与原理解释

Dice 的全称是 **Dice Similarity Coefficient**，常简称 **DSC**，也叫 Dice 系数。

它也是看预测 mask 和真实 mask 的重叠程度。

它的公式是：

$$
\text{Dice} = \frac{2 \times |\text{预测区域} \cap \text{真实区域}|}{|\text{预测区域}| + |\text{真实区域}|}
$$

![Fig.2 Dice：用两个区域面积之和作为分母](/DeepLearning/EvaluationMetrics/02_dice.png)

还是用同一个数字例子：

```text
真实区域有 100 个像素
预测区域有 90 个像素
两者重叠了 80 个像素
```

那么：

```text
Dice = 2 × 80 / (100 + 90)
     = 160 / 190
     ≈ 0.842
```

Dice 的取值范围是 0 到 1：

- Dice = 1：两个区域完全重合。
- Dice = 0：两个区域完全不重合。
- 越接近 1，分割越准。

一句话记住：

> **Dice 只看 mask 区域重叠，不比较图像纹理、亮度或清晰度。**

### 2.2 PyTorch / NumPy 中怎么使用

Dice 可以用于二分类 mask，也可以用于多类别分割。

二分类时，先得到 0/1 mask：

```python
import torch

# prob: (N, H, W)，前景概率
pred_mask = (prob > 0.5).long()
```

多分类时，先从 logits 得到类别图：

```python
# logits: (N, C, H, W)
preds = logits.argmax(dim=1)  # (N, H, W)
```

NumPy 中同理：

```python
import numpy as np

pred_mask = (prob > 0.5).astype(np.int64)
preds = np.argmax(logits, axis=1)
```

整理好输入后，再计算交集和区域面积。

### 2.3 手写实现

::::: code-group
:::: code-group-item PyTorch（二分类）

```python
import torch

def binary_dice(pred_mask, target_mask, eps=1e-6):
    """
    pred_mask:   (N, H, W)，0/1 预测 mask
    target_mask: (N, H, W)，0/1 真实 mask
    """
    pred_mask = pred_mask.bool()
    target_mask = target_mask.bool()

    intersection = (pred_mask & target_mask).sum().float()
    pred_area = pred_mask.sum().float()
    target_area = target_mask.sum().float()

    dice = 2 * intersection / (pred_area + target_area + eps)
    return dice
```

::::
:::: code-group-item PyTorch（多类别）

```python
def multiclass_dice(preds, target, num_classes, ignore_index=None, eps=1e-6):
    """
    preds:  (N, H, W)，预测类别
    target: (N, H, W)，真实类别
    """
    dices = []

    if ignore_index is not None:
        valid = target != ignore_index
        preds = preds[valid]
        target = target[valid]

    for cls in range(num_classes):
        pred_cls = preds == cls
        target_cls = target == cls

        intersection = (pred_cls & target_cls).sum().float()
        pred_area = pred_cls.sum().float()
        target_area = target_cls.sum().float()

        if pred_area + target_area == 0:
            continue

        dice = 2 * intersection / (pred_area + target_area + eps)
        dices.append(dice)

    if len(dices) == 0:
        return torch.tensor(0.0)

    return torch.stack(dices).mean()
```

::::
:::: code-group-item NumPy（二分类）

```python
import numpy as np

def binary_dice_np(pred_mask, target_mask, eps=1e-6):
    pred_mask = pred_mask.astype(bool)
    target_mask = target_mask.astype(bool)

    intersection = np.logical_and(pred_mask, target_mask).sum()
    pred_area = pred_mask.sum()
    target_area = target_mask.sum()

    return 2 * intersection / (pred_area + target_area + eps)
```

::::
:::::
