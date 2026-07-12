---
title: 通用评价指标
date: 2026/06/28
categories:
  - 评价指标
tags:
  - 评价指标
  - 混淆矩阵
  - Accuracy
  - Precision
  - Recall
  - F1
---

## 1. 分类任务的通用评价逻辑

很多评价指标看起来名字不同，底层却来自同一件事：**把模型预测和真实标签进行比较。**

```text
输入数据 → 模型产生预测 → 与真实标签比较 → 统计评价指标
```

这套逻辑适用于分类任务，以及能够把结果转换成“预测正确 / 预测错误”的检测、分割和推荐任务。回归任务比较的是连续数值，需要使用 MAE、MSE 等另一套指标。

本文使用同一个二分类例子贯穿所有指标。**假设我们要判断一件产品是否有缺陷：**

- ==**正类 1：有缺陷**==
- ==**负类 0：正常**==

共有 10 个样本，其中 4 个真实缺陷、6 个真实正常。**模型输出缺陷概率**，再用 0.5 作为阈值得到预测类别：

::: tabs
@tab PyTorch

```python
import torch

target = torch.tensor([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
scores = torch.tensor([0.95, 0.82, 0.65, 0.35, 0.75,
                       0.55, 0.45, 0.30, 0.20, 0.10])
preds = (scores >= 0.5).long()
```

@tab NumPy

```python
import numpy as np

target = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
scores = np.array([0.95, 0.82, 0.65, 0.35, 0.75,
                   0.55, 0.45, 0.30, 0.20, 0.10])
preds = (scores >= 0.5).astype(np.int64)
```

:::

后面的指标都使用这组数据，不再更换例子。

### 1.1 混淆矩阵

**数学公式与原理解释**

混淆矩阵（Confusion Matrix）把真实标签放在一边，把预测结果放在另一边，交叉统计四种结果：

- **真正例（True Positive，TP）**：实际是正类，预测也是正类。
- **真负例（True Negative，TN）**：实际是负类，预测也是负类。
- **假正例（False Positive，FP）**：实际是负类，却被预测成正类，也叫误报。
- **假负例（False Negative，FN）**：实际是正类，却被预测成负类，也叫漏报。

![Fig.1 二分类混淆矩阵 =560x](/DeepLearning/EvaluationMetrics/01_confusion_matrix.png)

这组数据得到：

```text
TP = 3，TN = 4，FP = 2，FN = 1
```

写成矩阵就是：

$$
\begin{bmatrix}
TN & FP \\
FN & TP
\end{bmatrix}
=
\begin{bmatrix}
4 & 2 \\
1 & 3
\end{bmatrix}
$$

后面的 Accuracy、Precision、Recall 和 F1，都是从这四个数字中选择不同部分进行计算。

**PyTorch / NumPy 实现**

[TorchMetrics](https://lightning.ai/docs/torchmetrics/stable/classification/confusion_matrix.html) 的二分类混淆矩阵也按照 `[[TN, FP], [FN, TP]]` 排列。

::: tabs
@tab PyTorch

```python
from torchmetrics.classification import BinaryConfusionMatrix

metric = BinaryConfusionMatrix(threshold=0.5)
matrix = metric(scores, target)

print(matrix)
# tensor([[4, 2],
#         [1, 3]])
```

@tab NumPy

```python
tp = np.sum((preds == 1) & (target == 1))
tn = np.sum((preds == 0) & (target == 0))
fp = np.sum((preds == 1) & (target == 0))
fn = np.sum((preds == 0) & (target == 1))

matrix = np.array([[tn, fp], [fn, tp]])
print(matrix)
# [[4 2]
#  [1 3]]
```

:::

### 1.2 Accuracy

**数学公式与原理解释**

准确率（Accuracy）回答的是：**所有样本中，有多少预测正确？**

$$
\text{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN}
$$

![Fig.2 Accuracy：全部样本中预测正确的比例](/DeepLearning/EvaluationMetrics/01_accuracy.png)

代入这组数据：

$$
\text{Accuracy}=\frac{3+4}{3+4+2+1}=0.70
$$

==Accuracy 很直观，但类别极不平衡时可能产生误导==。例如 100 个样本里只有 1 个正类，即使模型全部预测成负类，Accuracy 也有 0.99，但唯一的正类完全没有被找到。

**PyTorch / NumPy 实现**

::: tabs
@tab PyTorch

```python
from torchmetrics.classification import BinaryAccuracy

metric = BinaryAccuracy(threshold=0.5)
accuracy = metric(scores, target)
print(accuracy)  # tensor(0.7000)
```

@tab NumPy

```python
accuracy = np.mean(preds == target)
print(accuracy)  # 0.7
```

:::

### 1.3 Precision

**数学公式与原理解释**

精确率（Precision）也叫查准率，它只看模型预测为正类的结果：**这些预测中，有多少是真的？**

$$
\text{Precision}=\frac{TP}{TP+FP}
$$

![Fig.3 Precision：预测为正类的结果中有多少是真的](/DeepLearning/EvaluationMetrics/01_precision.png)

模型一共预测出 5 个缺陷，其中 3 个确实有缺陷，另外 2 个是误报：

$$
\text{Precision}=\frac{3}{3+2}=0.60
$$

Precision 越高，说明模型给出的正类结果越可信，误报越少。

**PyTorch / NumPy 实现**

::: tabs
@tab PyTorch

```python
from torchmetrics.classification import BinaryPrecision

metric = BinaryPrecision(threshold=0.5)
precision = metric(scores, target)
print(precision)  # tensor(0.6000)
```

@tab NumPy

```python
tp = np.sum((preds == 1) & (target == 1))
fp = np.sum((preds == 1) & (target == 0))
precision = tp / (tp + fp)

print(precision)  # 0.6
```

:::

### 1.4 Recall

**数学公式与原理解释**

召回率（Recall）也叫查全率，它只看真实的正类：**这些目标中，有多少被模型找了出来？**

$$
\text{Recall}=\frac{TP}{TP+FN}
$$

![Fig.4 Recall：所有真实正类中有多少被找了出来](/DeepLearning/EvaluationMetrics/01_recall.png)

标签里共有 4 个真实缺陷，模型找到了 3 个，漏掉了 1 个：

$$
\text{Recall}=\frac{3}{3+1}=0.75
$$

Recall 越高，说明模型漏掉的正类越少。

**PyTorch / NumPy 实现**

::: tabs
@tab PyTorch

```python
from torchmetrics.classification import BinaryRecall

metric = BinaryRecall(threshold=0.5)
recall = metric(scores, target)
print(recall)  # tensor(0.7500)
```

@tab NumPy

```python
tp = np.sum((preds == 1) & (target == 1))
fn = np.sum((preds == 0) & (target == 1))
recall = tp / (tp + fn)

print(recall)  # 0.75
```

:::

### 1.5 F1 Score

**数学公式与原理解释**

Precision 高，不代表 Recall 也高。模型可以只挑最有把握的少量样本，让误报很少，却漏掉大量正类；也可以尽量把所有正类都找出来，同时带来很多误报。

F1 Score 使用 Precision 和 Recall 的调和平均，把二者合成一个数：

$$
F1=2\times\frac{\text{Precision}\times\text{Recall}}
{\text{Precision}+\text{Recall}}
$$

![Fig.5 F1 Score：平衡 Precision 和 Recall](/DeepLearning/EvaluationMetrics/01_f1.png)

代入 Precision = 0.60、Recall = 0.75：

$$
F1=2\times\frac{0.60\times0.75}{0.60+0.75}\approx0.67
$$

F1 只有在 Precision 和 Recall 都比较高时才会高。如果其中一个很低，F1 也会被拉低。

**PyTorch / NumPy 实现**

::: tabs
@tab PyTorch

```python
from torchmetrics.classification import BinaryF1Score

metric = BinaryF1Score(threshold=0.5)
f1 = metric(scores, target)
print(f1)  # tensor(0.6667)
```

@tab NumPy

```python
tp = np.sum((preds == 1) & (target == 1))
fp = np.sum((preds == 1) & (target == 0))
fn = np.sum((preds == 0) & (target == 1))

precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)

print(f1)  # 0.6666666666666665
```

:::

Accuracy、Precision、Recall 和 F1 都来自混淆矩阵，但关注的问题不同：

- Accuracy 看全部样本是否预测正确。
- Precision 关注正类预测是否可信。
- Recall 关注真实正类是否被完整找回。
- F1 在 Precision 和 Recall 之间进行平衡。

具体任务仍要先规定“什么算预测正确”。图像分类可以直接比较类别；目标检测需要先根据类别和 IoU 匹配预测框；推荐系统则通常先确定 Top-K 推荐结果与用户真实行为的对应关系。
