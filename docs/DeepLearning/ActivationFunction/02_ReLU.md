---
title: ReLU 激活函数
date: 2026/05/07
categories:
  - 激活函数
tags:
  - 激活函数
---

## 1. ReLU 的核心逻辑

如果说 Sigmoid 是一位“优雅的画家”，那 ReLU 就是一位“冷酷的裁判”。它的数学公式简单到令人发指：

$$
f(x)=\max{(0,x)}
$$

翻译成人话就是：如果是正数，原封不动地保留；如果是负数，直接变成 0。逻辑虽然简单粗暴，但效率极高。请看几何表示（函数图像）：

![1. ReLU 激活函数图像 =560x](/DeepLearning/Activation/03_relu.png)

## 2. 对比 Sigmoid 的提升

虽然 Sigmoid 理论很完美，但在实际深层网络中，ReLU 几乎完全取代了它，原因就两点：

- **计算极快**：
  - Sigmoid 需要算指数 $e^{-x}$，很费时间。
  - ReLU 只需要判断 if x > 0，计算机做这个判断简直快如闪电。
- **解决“梯度消失”**：
  - Sigmoid 在两端梯度几乎为 0，深层网络里信号传着传着就“死”了。
  - ReLU 在正数区间梯度永远是 1，信号可以畅通无阻地传得很深。

## 3. ReLU 的缺陷

ReLU 它有一个 “硬伤”，正是因为这个缺点，才催生了后面的一系列改进版本（比如 Leaky ReLU, PReLU 等）。这个硬伤的名字叫做：**“神经元死亡”问题**。

**什么是“神经元死亡”**？在训练过程中，某个神经元可能因为某些原因，对所有输入数据都输出 0。比如，学习率设置的太高，亦或者偏置项（bias）变得太小，导致神经元的权重更新幅度太大，变成了 0 或负数。一旦它输出了 0，它的梯度也就变成了 0。

- 梯度是 0 → 权重无法更新。
- 权重无法更新 → 它永远输出 0。

结果就是：这个神经元彻底“死”了，在整个网络中变成了一个废节点，不再参与任何学习。**除了“死亡”问题，ReLU 还有两个小毛病：**

1. **输出不是以 0 为中心的**

ReLU 的输出要么是 0，要么是正数。均值肯定大于 0。这会导致下一层神经元的输入分布发生偏移。虽然不像“死亡”问题那么严重，但这会让后续的优化过程稍微变慢一点（梯度更新时容易出现“锯齿状”路径）。

2. **在原点不可导**

在 $x=0$ 那个折角处，数学上其实是没法求导的（左导数是 0，右导数是 1）。这确实是个小问题，工程上我们通常强制规定 $x=0$ 时导数为 0 或者 1，计算机照样跑得欢。

## 4. 使用上的权衡

### 4.1 默认首选 ReLU 的场景

90% 的卷积神经网络（CNN）和多层感知机（MLP）的隐藏层都适用。原因一个是说过的 “计算快”，另一个是 “够用”，虽然有死亡神经元的风险，但是大多数任务的表现已经足够好。

同时，权重初始化最好配合 He Initialization（He 初始化），这能防止信号在深层网络中爆炸或消失。

### 4.2 什么时候不用 ReLU？

1. **Transformer / NLP / 大模型领域 → 改用 GELU 或 Swish**

在自然语言处理（NLP）和 Vision Transformer (ViT) 中，模型非常深且复杂。ReLU 的“硬折角”（不可导点）有时候会造成训练的不稳定。

2. **循环神经网络 → 改用 Tanh 或 Sigmoid**

RNN/LSTM 需要控制信息的“流动”和“遗忘”。**Tanh** 的输出是 (−1,1) ，以 0 为中心，适合做数据的传递。**Sigmoid** 的输出是 (0,1) ，适合做“门控”（比如：0代表完全关闭，1代表完全打开）。

3. **担心“神经元死亡” → 改用 Leaky ReLU**

如果发现训练过程中 Loss 降不下去，或者怀疑很多神经元“死”了（输出恒为0）。可以替换为 Leaky ReLU，因为它给负数区域留一条“后路”（比如 y=0.01x）。这通常是“救火”用的，或者在非常深的网络中作为 ReLU 的替代品。

## 5. 隐藏层的使用（拼积木）

与 Sigmoid 一样，我们还是用 1 个隐藏层，4 个神经元，来看看 ReLU是怎么工作的。目标曲线我们定义一个 V 字型图案。可以看到，同样是去做拟合，Sigmoid 是用曲线做加权求和，而 ReLU 是通过折线做加权求和 ==（切割、拼接、拟合）==：

![2. ReLU 激活函数在隐藏层中的使用](/DeepLearning/Activation/04_relu.png)

前4张图的蓝色折线，这就是 **ReLU 的“切割”作用**。每个神经元都只负责输入空间的一小部分。它们就像一个“局部特征检测器”，只在自己的“地盘”里被激活。

第5张图中的红色折线，这就是 **ReLU 的“拼接”作用**。输出层拿到了这 4 条蓝色的“折线”，并根据它们的重要性（权重 `out_weight`）进行加权求和。

最终，这 4 条简单的折线被**组合**成了一条复杂的红色折线，成功地逼近了蓝色的 V 形目标数据。

ReLU 的本质：**通过“分段线性”的方式，用无数个简单的“折线”去逼近任意复杂的函数**。它不是平滑地弯曲空间，而是干脆利落地切割和拼接。

```py
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# 我们用一个简单的 V 形函数作为目标，它在线性模型看来是不可学的
x = torch.linspace(-5, 5, 100).reshape(-1, 1)
y = torch.abs(x) + torch.randn(x.size()) * 0.1  # |x| + 一点噪声

# 定义一个超简单的网络：1个隐藏层，4个神经元
class SimpleReLUNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(1, 4) # 隐藏层：1个输入 -> 4个神经元
        self.output = nn.Linear(4, 1) # 输出层：4个输入 -> 1个输出
        self.relu = nn.ReLU()

    def forward(self, x):
        h = self.hidden(x)
        h = self.relu(h) # ReLU 在这里进行“切割”
        y = self.output(h)
        return y


# --- 3. 训练网络 ---
net = SimpleReLUNet()
optimizer = torch.optim.SGD(net.parameters(), lr=0.1)
loss_func = nn.MSELoss()

print("训练开始...")
for step in range(1001):
    prediction = net(x)
    loss = loss_func(prediction, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if step % 200 == 0:
        print(f"Step {step}, Loss: {loss.item():.4f}")

# --- 4. 可视化：ReLU 的“切割”与“拼接” ---
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

with torch.no_grad():
    hidden_features = net.relu(net.hidden(x)) # 获取隐藏层的输出（ReLU 激活之后）
    out_weight = net.output.weight.numpy()[0] # 输出层的权重
    out_bias = net.output.bias.numpy()[0] # 输出层的偏置

    plt.figure(figsize=(20, 4))

    # --- 第一部分：展示 4 个 ReLU 神经元 ---
    for i in range(4):
        plt.subplot(1, 5, i+1)
        # 画出第 i 个神经元的输出
        neuron_output = hidden_features[:, i].numpy()
        plt.plot(x.numpy(), neuron_output, c='blue', linewidth=2)
        plt.title(f"神经元 {i+1}\n(输出权重: {out_weight[i]:.2f})")
        plt.xlabel("x")
        plt.ylabel("输出")
        plt.grid(True)
        # ReLU 输出最小为 0
        plt.ylim(bottom=-0.5)

    # --- 第二部分：加权求和 ---
    plt.subplot(1, 5, 5)
    # 核心公式：加权求和
    final_sum = (hidden_features.numpy() * out_weight).sum(axis=1) + out_bias

    # 画最终的合成曲线
    plt.plot(x.numpy(), final_sum, c='red', linewidth=2, label='合成结果')
    plt.plot(x.numpy(), y.numpy(), c='blue', linestyle='--', alpha=0.5, label='真实数据')

    plt.title("最终结果：4条折线拼出V形")
    plt.xlabel("x"); plt.ylabel("y"); plt.legend(); plt.grid(True)
    plt.suptitle("ReLU 的“乐高原理”：4个简单折线如何拼出复杂形状", fontsize=16)
    plt.tight_layout()
    plt.show()
```
