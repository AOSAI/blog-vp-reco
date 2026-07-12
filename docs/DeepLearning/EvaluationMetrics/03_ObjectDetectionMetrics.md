---
title: 目标检测评价指标
date: 2026/07/11
categories:
  - 评价指标
tags:
  - 评价指标
  - 目标检测
  - IoU
  - AP
  - mAP
---

## 1. IoU

### 1.1 数学公式与原理解释

IoU 全名是 **Intersection over Union**，中文常叫**交并比**。

在目标检测中，它用来衡量预测框和真实框重叠得怎么样：

$$
\text{IoU}=\frac{\text{预测框与真实框的交集面积}}
{\text{预测框与真实框的并集面积}}
$$

![Fig.1 目标检测中的 IoU：计算预测框与真实框的交并比](/DeepLearning/EvaluationMetrics/03_detection_iou.png)

图中绿色框是真实框，红色框是预测框。两者重叠的紫色区域是交集，两个框覆盖的全部区域是并集。

假设：

```text
真实框面积 = 12
预测框面积 = 12
交集面积   = 6
```

那么：

```text
并集面积 = 12 + 12 - 6 = 18
IoU = 6 / 18 = 0.333
```

IoU 的取值范围是 0 到 1：

- IoU = 1：预测框和真实框完全重合。
- IoU = 0：两个框完全没有重叠。
- IoU 越大：预测框的位置越准确。

评价目标检测时，通常会设置一个 IoU 阈值。以 `IoU ≥ 0.5` 为例：类别正确、IoU 达到阈值，并且真实目标还没有被其他高分框匹配，这个预测才算真正例（TP）。

### 1.2 PyTorch / NumPy 中怎么使用

[Torchvision](https://docs.pytorch.org/vision/stable/generated/torchvision.ops.box_iou.html) 提供了 `box_iou`，输入的边界框格式是 `(x1, y1, x2, y2)`：

```python
import torch
from torchvision.ops import box_iou

pred_boxes = torch.tensor([[3.0, 1.0, 7.0, 4.0]])
target_boxes = torch.tensor([[1.0, 1.0, 5.0, 4.0]])

iou = box_iou(pred_boxes, target_boxes)
print(iou)  # tensor([[0.3333]])
```

`box_iou` 会两两计算所有预测框与真实框的 IoU。假设有 $N$ 个预测框和 $M$ 个真实框，输出形状就是 `(N, M)`。

NumPy 没有专门的目标检测 IoU 接口，一般直接按照公式计算。

### 1.3 手写实现

::: tabs
@tab PyTorch

```python
import torch

def box_iou(pred_boxes, target_boxes, eps=1e-7):
    """
    pred_boxes:   (N, 4)，格式为 x1, y1, x2, y2
    target_boxes: (M, 4)，格式为 x1, y1, x2, y2
    返回:         (N, M)
    """
    left_top = torch.maximum(
        pred_boxes[:, None, :2], target_boxes[None, :, :2]
    )
    right_bottom = torch.minimum(
        pred_boxes[:, None, 2:], target_boxes[None, :, 2:]
    )

    intersection_wh = (right_bottom - left_top).clamp(min=0)
    intersection = intersection_wh[..., 0] * intersection_wh[..., 1]

    pred_wh = (pred_boxes[:, 2:] - pred_boxes[:, :2]).clamp(min=0)
    target_wh = (target_boxes[:, 2:] - target_boxes[:, :2]).clamp(min=0)
    pred_area = pred_wh[:, 0] * pred_wh[:, 1]
    target_area = target_wh[:, 0] * target_wh[:, 1]

    union = pred_area[:, None] + target_area[None, :] - intersection
    return intersection / (union + eps)
```

@tab NumPy

```python
import numpy as np

def box_iou_np(pred_boxes, target_boxes, eps=1e-7):
    left_top = np.maximum(
        pred_boxes[:, None, :2], target_boxes[None, :, :2]
    )
    right_bottom = np.minimum(
        pred_boxes[:, None, 2:], target_boxes[None, :, 2:]
    )

    intersection_wh = np.clip(right_bottom - left_top, 0, None)
    intersection = intersection_wh[..., 0] * intersection_wh[..., 1]

    pred_wh = np.clip(pred_boxes[:, 2:] - pred_boxes[:, :2], 0, None)
    target_wh = np.clip(target_boxes[:, 2:] - target_boxes[:, :2], 0, None)
    pred_area = pred_wh[:, 0] * pred_wh[:, 1]
    target_area = target_wh[:, 0] * target_wh[:, 1]

    union = pred_area[:, None] + target_area[None, :] - intersection
    return intersection / (union + eps)
```

:::

## 2. 目标检测中的 AP 与 mAP

IoU 只能判断一个预测框和真实框重叠得好不好。要评价整个检测器，还要同时考虑定位、误检、漏检和置信度排序。

### 2.1 怎样确定 TP、FP 和 FN？

评价程序一开始就有两组数据：

```text
人工标注：真实框和真实类别
模型输出：预测框、预测类别和置信度
```

真实框来自数据集标签，不是从预测框中判断出来的。模型输出的框在匹配前都只是候选预测，评价程序要把它们和真实框比较，才能知道预测是否正确。

假设现在只评价“车”，并规定 `IoU ≥ 0.5` 才算匹配成功。匹配过程是：

1. 取出所有“车”的预测框，按照置信度从高到低排列。
2. 计算当前预测框与同一张图中所有“车”真实框的 IoU。
3. 在尚未匹配的真实框中，找到与当前预测框 IoU 最高的一个。
4. 如果最高 IoU 达到阈值，当前预测就是 TP，并把这个真实框标记为“已找到”。
5. 如果 IoU 不够，或者它只能匹配已经被占用的真实框，当前预测就是 FP。
6. 处理到当前置信度时，仍然没有被找到的真实框就是 FN。

这些名称的通用定义放在[混淆矩阵](./01_CommonMetrics.md#_1-1-混淆矩阵)中。放到目标检测里：

- **TP**：成功匹配一个真实框的预测框。
- **FP**：没有成功匹配真实框的预测框。
- **FN**：标签中存在，但还没有被预测找到的真实目标。

只有预测框会被判为 TP 或 FP。FN 不是一种预测框，而是从尚未匹配的标签真值中统计出来的：

$$
FN=\text{真实目标总数}-\text{已匹配的真实目标数}
$$

![Fig.2 AP 计算前：按照置信度匹配预测框与真实框](/DeepLearning/EvaluationMetrics/03_detection_ap_matching.png)

图中有 3 个真实目标和 4 个预测框。按照置信度从高到低处理：

```text
0.95：匹配第一个真实框 → TP
0.88：匹配第二个真实框 → TP
0.74：没有匹配到真实框 → FP
0.60：匹配第三个真实框 → TP
```

多个预测框竞争同一个真实框时，优先级由置信度决定。先处理的高置信度框只要达到当前 IoU 阈值，就会占用真实框；后面的重复框算 FP。对于当前预测框，如果有多个尚未匹配的真实框，则选择 IoU 最高的那个。

### 2.2 从匹配结果到 AP

完成预测框匹配后，每降低一次置信度阈值，就会加入更多预测框，并重新计算 [Precision](./01_CommonMetrics.md#_1-3-precision) 和 [Recall](./01_CommonMetrics.md#_1-4-recall)。

图中一共有 3 个真实目标。在还没有加入任何预测框时：

```text
TP = 0，FP = 0，FN = 3
```

随着置信度阈值降低，预测框按照分数从高到低逐个加入：

| 加入预测 | 累计 TP | 累计 FP | 累计 FN | Precision | Recall |
| -------- | ------- | ------- | ------- | --------- | ------ |
| 尚未加入 | 0       | 0       | 3       | -         | 0.00   |
| 0.95     | 1       | 0       | 2       | 1.00      | 0.33   |
| 0.88     | 2       | 0       | 1       | 1.00      | 0.67   |
| 0.74     | 2       | 1       | 1       | 0.67      | 0.67   |
| 0.60     | 3       | 1       | 0       | 0.75      | 1.00   |

把每一行的 Recall 作为横坐标、Precision 作为纵坐标，就得到目标检测的 PR 曲线：

![Fig.3 AP：每加入一个预测框，得到 PR 曲线上的一个点](/DeepLearning/EvaluationMetrics/03_detection_ap_curve.png)

前两个预测都是 TP，所以点向右移动，Precision 保持为 1。第三个预测是 FP，没有找回新目标，所以点不会向右移动，只会向下掉。第四个预测找回了最后一个目标，Recall 到达 1；但之前的 FP 仍在累计结果中，所以 Precision 是 0.75。

AP 全名是 **Average Precision**，中文常叫**平均精确率**。它使用一个面积汇总整条 PR 曲线：

$$
\text{AP}=\int_{0}^{1}P(R)\,dR
$$

这里的面积不是预测框在图片中的面积，而是 PR 坐标系中的面积：

```text
一段面积 = Recall 增加的范围 × 这段范围内保持的 Precision
```

图中的蓝色区域可以拆成两段：

```text
Recall 0 → 0.67：Precision 保持 1.00
面积约为 0.67 × 1.00 = 0.67

Recall 0.67 → 1.00：插值后的 Precision 保持 0.75
面积约为 (1.00 - 0.67) × 0.75 = 0.25

AP ≈ 0.67 + 0.25 = 0.92
```

AP 越高，说明检测器在找回更多目标的同时，仍然能保持较少的误检。

### 2.3 从 AP 到 mAP

在目标检测中，一个 AP 通常对应：

```text
一个类别 + 一个 IoU 阈值
```

例如 `汽车 AP50` 表示：只评价“汽车”，并使用 `IoU ≥ 0.5` 判断预测框是否匹配成功。

如果数据集有多个类别，就分别计算每个类别的 AP，再求平均：

$$
mAP=\frac{1}{C}\sum_{c=1}^{C}AP_c
$$

例如：

```text
汽车 AP = 0.82
行人 AP = 0.71
自行车 AP = 0.65

mAP = (0.82 + 0.71 + 0.65) / 3 = 0.727
```

实际训练日志中还会看到不同写法：

- **AP50 / mAP50**：使用 `IoU ≥ 0.50` 判断匹配，要求相对宽松。
- **AP75 / mAP75**：使用 `IoU ≥ 0.75` 判断匹配，更重视边界框位置。
- **mAP50-95**：分别使用 0.50、0.55、……、0.95 计算，再对 IoU 阈值和类别求平均。

因此，`AP50` 无法充分区分 IoU 为 0.51 和 0.95 的两个 TP；`AP75` 和 `mAP50-95` 会对边界框精度提出更高要求。

命名在不同论文和框架中并不完全统一。COCO 官方通常直接把多类别、多 IoU 阈值的平均结果写成 `AP`，YOLO 训练日志则常写成 `mAP50-95`。比较结果前，需要先确认使用了哪些类别和 IoU 阈值。

### 2.4 PyTorch 中怎么使用

实际项目通常使用 TorchMetrics、COCO API 或检测框架自带的评测工具，因为它们会处理多张图像、多个类别、重复框和不同 IoU 阈值。

[TorchMetrics](https://lightning.ai/docs/torchmetrics/stable/detection/mean_average_precision.html) 的 `MeanAveragePrecision` 使用 COCO 风格计算检测指标：

```bash
pip install "torchmetrics[detection]"
```

```python
import torch
from torchmetrics.detection import MeanAveragePrecision

metric = MeanAveragePrecision(box_format="xyxy", iou_type="bbox")

preds = [{
    "boxes": torch.tensor([[10, 10, 50, 50]], dtype=torch.float32),
    "scores": torch.tensor([0.95]),
    "labels": torch.tensor([1]),
}]

target = [{
    "boxes": torch.tensor([[12, 12, 48, 48]], dtype=torch.float32),
    "labels": torch.tensor([1]),
}]

metric.update(preds, target)
result = metric.compute()

print(result["map"])     # mAP50-95
print(result["map_50"])  # mAP50
print(result["map_75"])  # mAP75
```

NumPy 没有统一的目标检测 mAP 接口。正式评价时应使用与 VOC、COCO 或具体项目协议一致的工具，避免因为匹配顺序、IoU 阈值和插值方法不同而得到不可比较的结果。
