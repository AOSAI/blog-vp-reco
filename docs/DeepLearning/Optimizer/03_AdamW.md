---
title: AdamW：解耦权重衰减
date: 2026/05/16
categories:
  - 优化器
tags:
  - 优化器
---

## 1. 一个隐蔽的 Bug

Adam 很好用，自适应学习率、动量加速、偏差校正 ——该有的都有了。但它的 `weight_decay` 实现藏了一个不易察觉的问题。PyTorch 的 `optim.Adam` 内部是这么处理权重衰减的：

```
梯度 = 损失梯度 + weight_decay × 参数
```

然后这个"加料"后的梯度，再被 $m_t$ 和 $\sqrt{v_t}$ 处理。问题就在这：**自适应学习率把权重衰减也一起"自适应"了**。这个 Bug 在 2017 年被 Loshchilov 和 Hutter 发现并修复，修复后的版本叫做 **AdamW**。

## 2. 先回顾：SGD 里为什么没问题

SGD 那篇我们讲过，SGD 加上 weight_decay 的更新公式是：

$$
w = w - \eta(\nabla L + \lambda w)
$$

拆开看就是两步：

1. **先衰减**：$w$ 缩小一丁点
2. **再下降**：沿梯度反方向走一步

在 SGD 中，L2 正则（把 $\lambda\|w\|^2$ 加到 loss 里）和权重衰减（直接减去 $\eta\lambda w$）**数学上完全等价**。原因很简单——SGD 的更新规则就是"梯度 × 学习率"，没有中间环节。

## 3. Adam 里的问题：正则化被误伤了

Adam 的更新规则比 SGD 复杂得多。梯度要经过两道工序：

```
梯度 g  →  一阶动量 m（方向平均）  →  除以 √v（步长缩放）  →  更新参数
         →  二阶动量 v（大小平均）
```

现在假设我们把 $\lambda w$ 加到梯度里，问题就来了：

- $\lambda w$ 进入了 $m_t$，被平均进了方向记忆
- $\lambda w$ 进入了 $v_t$，**更致命的**——它又被 $\sqrt{v_t}$ 缩放了

| 场景                             | 你希望的结果         | Adam 实际的结果                    |
| -------------------------------- | -------------------- | ---------------------------------- |
| 一个**活跃**的参数（$v_t$ 大）   | 正常衰减 $\lambda w$ | $1/\sqrt{v_t}$ 太小 → **衰减不足** |
| 一个**不活跃**的参数（$v_t$ 小） | 正常衰减 $\lambda w$ | $1/\sqrt{v_t}$ 太大 → **过度衰减** |

> 想象你在给不同学生布置罚款。你觉得成绩好的学生交 10 块，成绩差的也交 10 块，一视同仁。但 Adam 的"自适应"系统自动给好学生打了 3 折（只交 3 块），给差学生翻了 3 倍（交 30 块）。这肯定不是想要的结果。

这就是 Adam 的隐蔽 Bug：**它的"自适应"能力太好用了，好用到连惩罚力度也不放过。**

## 4. 修复：只加了一行代码

Loshchilov 和 Hutter 的核心思想只有一句话：**把权重衰减从梯度计算中拿出来，放到参数更新之后单独执行**。下面是 Adam 和 AdamW 的伪代码对比，唯一的区别就在最后一行：

```python
# ——— Adam ———
grad = grad + weight_decay * param    # λw 混在梯度里
m = β₁·m + (1−β₁)·grad                # 被一阶动量处理
v = β₂·v + (1−β₂)·grad²               # 被二阶动量处理
param = param − lr·m / (√v + ε)       # 最后更新

# ——— AdamW ———
grad = grad                            # 梯度不用加 λw
m = β₁·m + (1−β₁)·grad                # 正常算动量
v = β₂·v + (1−β₂)·grad²               # 正常算活跃度
param = param − lr·m / (√v + ε)       # 正常更新
param = param − lr·weight_decay·param  # ★ 单独衰减，不受自适应影响
```

**AdamW 的改动就是多了一行代码**——在 Adam 更新完参数后，再单独乘一个 $(1 - lr \cdot \lambda)$。

这行代码的意义：$\lambda w$ 不再经过 $m_t$ 和 $\sqrt{v_t}$，**所有参数的衰减力度完全一致**。改 `lr` 不影响正则强度，改 `weight_decay` 不影响优化方向——两个超参数彻底解耦。

![图1：Adam vs AdamW — 权重衰减的路径对比 =560x](/DeepLearning/Optimizer/17_adamw.png)

> **一句话记住 AdamW**：把"罚款"和"赚钱"分成了两个独立的部门。

## 5. 为什么 LLM 全用 AdamW

看看今天的 LLM 训练，几乎清一色 AdamW：

- GPT 系列 → AdamW
- LLaMA 系列 → AdamW
- Qwen、Mistral、Gemma → AdamW

两个原因。

**原因一：调参更可控。**

大模型的超参数极其敏感。使用 Adam 时，如果你调大了 `lr`，$\sqrt{v_t}$ 整体变大，但 $\lambda w$ 也会被连带影响——你本来只想改学习率，却意外地削弱了正则化。AdamW 解耦后，改 `lr` 就只改学习率，改 `weight_decay` 就只改正则强度，互不干扰。

**原因二：泛化性更好。**

Loshchilov & Hutter 的论文在多个任务上做了对比实验：**相同 $\lambda$ 下，AdamW 的验证集损失显著低于 Adam + L2**。因为 AdamW 的参数衰减更均匀，模型不会对某些特征"过度惩罚"或"过度放纵"。

## 6. PyTorch 中的使用

从 Adam 换到 AdamW，只需要改一个名字：

```python
import torch
import torch.nn as nn

model = nn.Linear(10, 1)

# 旧写法（隐式耦合）
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-2)

# 新写法（解耦）
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
```

参数完全一致，API 兼容：

| 参数           | 含义                   | 推荐值       | 说明               |
| -------------- | ---------------------- | ------------ | ------------------ |
| `lr`           | 学习率                 | 1e-3 ~ 5e-4  | 改它不影响正则强度 |
| `weight_decay` | 权重衰减系数           | 1e-2 ~ 1e-5  | LLM 一般取 1e-5    |
| `betas`        | ($\beta_1$, $\beta_2$) | (0.9, 0.999) | 和 Adam 一样       |
| `eps`          | 防除零                 | 1e-8         | 和 Adam 一样       |

## 7. 优化器三部曲

回顾这三篇，优化器的演进其实只解决了两类问题：

```
SGD：   固定学习率 × 梯度
         ↓ 问题：所有参数共享一个学习率，平了走不动、陡了走过头
Adam：  自适应学习率 × 梯度方向
         ↓ 问题：自适应的"手伸太长"，连权重衰减也一起误伤了
AdamW： 自适应学习率 × 梯度方向 + 独立权重衰减
         ↓
        这就是今天几乎所有大模型的默认配置
```

如果说 Adam 是从"手动挡"到"自动挡"的飞跃，那 AdamW 就是把自动挡的安全带单独拎了出来——**你可以调松紧，但不会影响油门和刹车。**
