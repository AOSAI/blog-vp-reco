---
title: 均方根归一化：RMS Norm
date: 2026/06/07
categories:
  - 归一化
tags:
  - 归一化
  - RMSNorm
---

## 1. 从 LayerNorm 到 RMSNorm

### 1.1 LayerNorm 的计算开销

2019年，LayerNorm 已经成为 Transformer 的标配。每个 Transformer 层有两个地方要用 LayerNorm：Attention 之前和 FFN 之前。也就是说，**一个 Transformer 层要算两次 LayerNorm**。

LayerNorm 的计算分两步：

1. **re-centering**：算均值 μ，然后每个元素减去 μ
2. **re-scaling**：算方差 σ²，然后每个元素除以 σ

这两步都要遍历整个特征向量，在 RNN/Transformer 中，每处理一个 token 都要算一次。当序列很长、模型很深时，LayerNorm 的计算开销，累积起来非常大。

![Fig.1 RNNSearch 机器翻译的对比论文原图](/DeepLearning/Normalization/06_rmsn_01.png)

论文中的实验（arXiv:1910.07467）：用 RNNSearch 做机器翻译，加入 LayerNorm 后收敛更快，但**每步训练时间增加了**：

- 按照训练轮次算：同样的轮次，层归一化的损失降到了 5.4
- 按照训练时间算：同样的时间，层归一化的损失才到 5.9

> 所以才说 “每步的训练时间增加了”。==LayerNorm 的优势被计算开销抵消了一部分。==

### 1.2 一个大胆的发现：均值中心化是多余的

LayerNorm 的核心是两步：**re-centering（减均值）+ re-scaling（除标准差）**。

2019年，Biao Zhang 和 Rico Sennrich 在做实验时发现了一个有趣的现象：**即使去掉 re-centering（减均值），效果几乎没变**。为什么能这样做？论文给出的解释是：

- **缩放不变性（re-scaling invariance）比中心化不变性（re-centering invariance）更重要**：归一化的核心价值是让输出对输入的缩放不敏感，而不是对输入的偏移不敏感
- 即使均值不为 0，网络可以通过学习权重来补偿

但最硬的证据是 **实验结果：在多种任务和模型上，去掉均值中心化后效果几乎没变**。这个发现催生了 RMSNorm（arXiv:1910.07467，NeurIPS 2019）：==**只用 RMS 做归一化，不减均值**==。

去掉均值计算后，只剩 **RMS（Root Mean Square，均方根）**，计算量大幅减少。效果和 LayerNorm 相当，但速度快 **7%~64%**。这个区间结果，是论文在四种不同的任务上做了实验得到的：

| 任务     | 模型             | RMSNorm 提升 |
| -------- | ---------------- | ------------ |
| 机器翻译 | RNNSearch (RNN)  | ≈64%         |
| 阅读理解 | Attention Reader | 中间值       |
| 图像检索 | Order Embedding  | 中间值       |
| 图像分类 | ConvPool-CNN-C   | ≈7%          |

规律：**RNN 模型提升大**（LayerNorm 在串行计算中开销占比高），**CNN 模型提升小**（并行度高，GPU 能掩盖开销）。

## 2. RMSNorm 的原理与推导

### 2.1 LayerNorm vs RMSNorm

用一个统一的视角对比：

```
LayerNorm 两步走：
1. re-centering：x̂ = x - μ     （减去均值，让分布居中）
2. re-scaling：  ŷ = x̂ / σ     （除以标准差，让分布归一）

RMSNorm 一步走：
1. re-scaling only：ŷ = x / RMS(x)  （只除以均方根，不减均值）
```

两种方法都让数据"归一化"了，但 RMSNorm 少了一步减均值的操作。打个比方：假设你有一组考试成绩 [60, 70, 80, 90]。

- **LayerNorm**：先减去均值 75（变成 [-15, -5, 5, 15]），再除以标准差
- **RMSNorm**：直接算 RMS（≈74.16），然后每个数除以 RMS

> 注意：标准差先减均值再算，均方根直接算。当均值为 0 时，两者相等。

### 2.2 数学公式

给定输入 $x \in \mathbb{R}^{n}$，RMSNorm 的计算：

**第一步：计算 RMS**

$$
\text{RMS}(x) = \sqrt{\frac{1}{n}\sum_{i=1}^{n}x_i^2}
$$

RMS 就是"均方根"，先算每个元素的平方，求平均，再开根号。它衡量的是数据的"整体大小"。

**第二步：归一化并缩放**

$$
y_i = \frac{x_i}{\text{RMS}(x) + \epsilon} \cdot \gamma_i
$$

其中 $\epsilon$ 是防止除零的小常数，$\gamma$ 是可学习参数（每个元素一个）。

> 注意：**只有 $\gamma$（缩放），没有 $\beta$（偏移）**。因为没有减均值，所以也不需要加偏移回来。这是 RMSNorm 和 LayerNorm 的一个重要区别。

## 3. PyTorch 实现

### 3.1 基本用法

PyTorch 2.4+ 内置了 RMSNorm：

```python
import torch.nn as nn

# PyTorch 内置 RMSNorm
rms = nn.RMSNorm(
    normalized_shape=64,       # 需要归一化的维度
    eps=1e-5,                  # 防止除零，默认 1e-5
    elementwise_affine=True    # 是否启用可学习参数 γ，默认 True
)
```

### 3.2 手动实现（帮助理解）

如果你想理解 RMSNorm 的本质，可以看这个简化版实现：

```python
import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))  # γ 参数

    def forward(self, x):
        # x: (batch, seq_len, dim)
        # 计算 RMS：对最后一个维度求均方根
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        # 归一化并缩放
        return x / rms * self.weight
```

对比 LayerNorm 的实现，你会发现：**RMSNorm 少了计算均值和减均值的步骤**。这就是它更快的原因。

### 3.3 在大模型中使用

RMSNorm 在大语言模型中已经成为标配：

|        | GPT-2     | LLaMA       | Mistral     | Qwen        | DeepSeek    |
| ------ | --------- | ----------- | ----------- | ----------- | ----------- |
| 年份   | 2019      | 2023        | 2023        | 2023        | 2024        |
| 归一化 | LayerNorm | **RMSNorm** | **RMSNorm** | **RMSNorm** | **RMSNorm** |

LLaMA 论文（arXiv:2302.13971）明确提到：用 RMSNorm 替代 LayerNorm，**训练速度提升了，效果没有下降**。在 Transformer 中，RMSNorm 的位置和 LayerNorm 一样：

```
输入 → RMSNorm → Attention → 残差连接
                → RMSNorm → FFN → 残差连接
```

每个 Transformer 层有两个 RMSNorm，分别在 Attention 和 FFN 之前。

## 4. 总结

### 4.1 优点

1. **计算更快**：去掉均值计算，速度快 7%~64%
2. **效果相当**：和 LayerNorm 性能基本持平
3. **大模型标配**：LLaMA、Mistral、Qwen 等都采用 RMSNorm

### 4.2 缺点与注意事项

1. **没有 β 参数**：只有 γ，表达能力略弱于 LayerNorm（但实际上影响很小）
2. **诞生较晚**：2019 年才提出，在大模型时代才真正流行
3. **不是万能的**：在某些需要 re-centering 的任务中，LayerNorm 可能更好

### 4.3 使用场景

| 任务                | 推荐              | 原因                             |
| ------------------- | ----------------- | -------------------------------- |
| 大语言模型          | **RMSNorm**       | 计算效率高，LLaMA 等模型验证有效 |
| Transformer（通用） | **LN 或 RMSNorm** | LN 更经典，RMSNorm 更快          |

> 一句话记住：**RMSNorm 是 LayerNorm 的"减法版"，去掉均值计算，只保留 RMS，速度更快，效果相当。大模型时代的归一化首选。**
