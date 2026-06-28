---
title: 层归一化：Layer Norm
date: 2026/06/03
categories:
  - 归一化
tags:
  - 归一化
  - LayerNorm
---

## 1. 为什么需要层归一化？

### 1.1 BN 的成功与代价

2015年，Batch Normalization 横空出世（ICLR 2015），训练步数减少了 14 倍，ImageNet top-5 错误率降到 4.8%。BN 几乎成了深度网络的标配。

但 BN 有一个隐藏的代价：**它的归一化依赖于 mini-batch 中的所有样本**。训练时用 batch 的均值和方差，推理时用全局的 running statistics。这意味着：

- batch size 必须足够大，统计量才准确
- 训练和推理的行为不一样，容易出错

这些在 CNN 里不算大问题——图片分类的 batch size 通常设 32 或 64，足够用。但当研究者们想把 BN 用到序列模型（RNN、Transformer）上时，问题就来了。

### 1.2 变长序列的困境

RNN 处理的是变长序列。比如一句话可能有 5 个词，也可能有 50 个词。同一个 batch 里，不同序列的长度不同。这时候 BN 的 batch 统计量就乱套了：

- 第 1 个时间步的均值，是从 batch 里所有序列的第 1 个位置算出来的
- 但有些序列可能在第 3 个位置就结束了，后面全是 padding
- 推理时序列长度可能和训练时完全不同

更根本的是：**BN 在训练和推理时的行为不一样**。训练时用 batch 统计量，推理时用 running statistics。这个"双模式"在序列模型里特别容易出 bug。

### 1.3 层归一化的诞生

2016年，Jimmy Lei Ba、Jamie Kiros 和 Geoffrey Hinton 提出了 Layer Normalization（arXiv:1607.06450）。核心思想很简单：

> **不再跨样本计算统计量，而是 ==对单个样本的所有特征计算统计量==**。

这样无论 batch size 多大、序列多长，每个样本的归一化都是独立的。而且训练和推理时的行为完全一样，不需要维护 running statistics。

## 2. LayerNorm 的原理与推导

### 2.1 BN vs LN：一个对比看懂差异

假设当前输入的 mini-batch 是一个 3×4 的矩阵（3 个样本，每个样本 4 个特征）：

```
输入：
    样本1: [1,  2,  3,  4 ]
    样本2: [5,  6,  7,  8 ]
    样本3: [9,  10, 11, 12]
```

**BN：按列计算（跨样本）**

对第 1 个特征维度，拿 3 个样本的值 [1, 5, 9] 算均值和方差。每个特征的统计量来自所有样本。

```
μ = [5, 6, 7, 8]    ← 每列一个均值
σ² = [10.67, 10.67, 10.67, 10.67]
```

**LN：按行计算（跨特征）**

对第 1 个样本，拿它的 4 个特征 [1, 2, 3, 4] 算均值和方差。每个样本的统计量只来自自己。

```
μ₁ = 2.5,  μ₂ = 6.5,  μ₃ = 10.5   ← 每行一个均值
σ² = [1.25, 1.25, 1.25]
```

![1. BN 按列归一化（跨样本），LN 按行归一化（跨特征）](/DeepLearning/Normalization/04_bn_vs_ln.png)

- **BN 看的是："同一个特征在不同样本上的分布"**
- **LN 看的是："同一个样本在不同特征上的分布"**

### 2.2 数学公式

给定一个输入 $x \in \mathbb{R}^{d}$（单个样本的 d 个特征），LN 做三件事：

**第一步：算均值 μ——这个样本的"重心"在哪**

$$
\mu = \frac{1}{d}\sum_{i=1}^{d}x_i
$$

比如一个样本有 4 个特征 [1, 2, 3, 4]，均值 μ = 2.5。

**第二步：算方差 σ²——这个样本的特征有多"散"**

$$
\sigma^2 = \frac{1}{d}\sum_{i=1}^{d}(x_i - \mu)^2
$$

上面那组特征的方差是 1.25。

**第三步：归一化并缩放**

$$
y_i = \frac{x_i - \mu}{\sqrt{\sigma^2 + \epsilon}} \cdot \gamma_i + \beta_i
$$

其中 $\epsilon$ 是防止除零的小常数，$\gamma$ 和 $\beta$ 是可学习参数（和 BN 一样，让网络有"反悔"的能力）。

和 BN 的公式几乎一样，唯一的区别是：**BN 的 μ 和 σ² 是从 batch 里所有样本算出来的，LN 的 μ 和 σ² 是从当前样本自己的所有特征算出来的**。

### 2.3 为什么 LN 更适合 Transformer

Transformer 的核心是自注意力机制。自注意力会对序列中的所有位置进行加权求和，这意味着：

1. **每个位置的输出都依赖于整个序列**
2. **不同位置的特征分布可能差异很大**
3. **我们需要对每个位置独立地进行归一化**

LN 恰好满足这些需求：它对每个 token 的所有特征维度进行归一化，不依赖其他样本，也不依赖序列长度。

而且 LN 训练和推理的行为完全一样：不需要维护 running statistics，也不存在 "忘记切 eval" 的坑。

## 3. PyTorch 实现

### 3.1 基本用法

```python
import torch.nn as nn

# 归一化最后一维（最常用）
ln = nn.LayerNorm(normalized_shape=768)

# 也可以指定归一化最后两维
ln = nn.LayerNorm(normalized_shape=[768, 3072])

# 常用可选参数
ln = nn.LayerNorm(
    normalized_shape=768,
    eps=1e-5,        # 防止除零的小常数，默认 1e-5
    elementwise_affine=True  # 是否启用可学习参数 γ 和 β，默认 True
)
```

`normalized_shape` 指定对哪些维度做归一化，一般来说归一化的都是隐藏层的维度，放在图像中就是指通道数。比如输入形状是 `(batch, seq_len, d_model=768)`：

- `LayerNorm(768)` → 对最后一维（特征维度）做归一化，每个 token 独立
- `LayerNorm([768, 3072])` → 对最后两维做归一化

### 3.2 在 Transformer 中使用

下面用 Pre-Norm 风格写一个 Transformer Block：

```python
class TransformerBlock(nn.Module):
    def __init__(self, d_model=768, nhead=8):
        super().__init__()
        self.self_attn = nn.MultiheadAttention(d_model, nhead)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model)
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x):
        # Self-Attention
        residual = x
        x = self.norm1(x)          # 先 Norm
        x, _ = self.self_attn(x, x, x)
        x = x + residual           # 残差连接

        # FFN
        residual = x
        x = self.norm2(x)          # 先 Norm
        x = self.ffn(x)
        x = x + residual           # 残差连接

        return x
```

LN 放在子层之前（Pre-Norm 风格），先归一化再做 Attention 或 FFN，最后加残差。这就是现在几乎所有大语言模型（GPT、LLaMA、Qwen）用的方式。

### 3.3 Pre-Norm vs Post-Norm

Transformer 中 LN 的放置位置有两种方式：

**Post-Norm（原始 Transformer，2017）**：

```
x → Self-Attention → Add → [LN] → FFN → Add → [LN]
```

LN 放在残差连接之后。这是原始论文 "Attention Is All You Need" 的方式。

**Pre-Norm（现代 LLM 的选择）**：

```
x → [LN] → Self-Attention → Add → [LN] → FFN → Add
```

LN 放在子层之前。Pre-Norm 的梯度流动更稳定，训练更容易收敛，几乎所有现代大语言模型都用这种方式。

## 4. 总结与扩展

### 4.1 优点

1. **不依赖 batch size**：每个样本独立归一化，batch size = 1 也能用
2. **适用于变长序列**：RNN、Transformer 的天然选择
3. **训练和推理行为一致**：不需要维护 running statistics，不存在模式切换的坑

### 4.2 缺点与注意事项

1. **归一化维度固定**：`normalized_shape` 必须在初始化时指定，不能动态变化
2. **不如 BN 在 CNN 中效果好**：CNN 的统计量跨样本更有意义，LN 会损失这个信息
3. **可学习参数 γ 和 β**：和 BN 一样，让网络有"反悔"的能力
