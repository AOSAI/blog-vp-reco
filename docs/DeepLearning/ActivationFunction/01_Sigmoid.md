---
title: Sigmoid 激活函数
date: 2026/05/06
categories:
  - 激活函数
tags:
  - 激活函数
---

## 1. 数学原理：优雅的 S 形曲线

Sigmoid 函数，也叫逻辑函数（Logistic Function）。它的图像像一个拉长的“S”，因此得名。数学公式写为：

$$
\sigma{(x)}=\frac{1}{1+e^{-x}}
$$

想象你在捏泥人，Sigmoid 函数就是一个模具。不管你的输入 x 是多大（正无穷）或多小（负无穷）的数字，经过这个模具一压，输出都会被强行压缩到 **(0, 1)** 之间。

![1. Sigmoid 激活函数图像 =560x](/DeepLearning/Activation/01_sigmoid.png)

- 当 ==$x\to +\infin$== 时，输出趋近于 1。
- 当 ==$x\to -\infin$== 时，输出趋近于 0。
- 当 ==$x = 0$== 时，输出正好是 0.5。

## 2. 万能接口：x（或z）

在数学的表示上，就是初中学的函数 $y=kx+b$ 的形式，但是这里的 ==x（或z）== 它只是一个代号，通常叫它 Logit 或 线性得分，在不同的任务里，它背后的公式确实不一样。比如：

- **场景 1：最简单的逻辑回归**

是我们熟悉的线性公式：$z=\vec{w_{1}}\cdot\vec{x_{1}}+\vec{b}$。这是最基础的 “加权求和”，也就是向量点积。

- **场景 2：卷积神经网络**

z 是卷积运算的结果：$z=\text{Conv}(x)+b$。这里的输入不是简单的乘法，而是用卷积核在图片上滑窗计算出来的特征图。

- **场景 3：Transformer**

这里的 z 是注意力机制算出来的结果：$z=\text{Attention}(Q,K,V)$，包含了上下文关联的信息。

不管 z 是怎么算出来的（简单的乘法也好，还是复杂的卷积、注意力），Sigmoid 函数都不关心。它只负责一件事：**把 z 强行压缩到 (0, 1) 之间**。所以公式里统一写成 σ(z)。

## 3. 梯度：反向传播的关键

**梯度**，在微积分中叫做 **“导数”**。在几何上它叫做 **“斜率”**。为什么神经网络中不叫另两个名字呢？因为它表示的是 ==方向==：

在神经网络里，我们的损失函数 $L$ 通常取决于成千上万个权重 $\vec{w_{1}},\vec{w_{2}},...,\vec{w_{n}}$。这时候导数就变成了 **“偏导数”** 的集合。通俗的理解：**梯度的模（长度）就是斜率的大小，梯度的方向就是最陡的方向**。

==反向传播利用了 **“链式求导法则”**==，比如有10层，先算出第10层的 导数（偏导数）$\delta_{10}$，然后传递给第9层，乘上自己的 导数（偏导数），得到 $\delta_{9}$，以此类推。

**Sigmoid 函数** 有一个非常漂亮的数学性质，它的导数可以用它自己来表示：

$$
\sigma{\rq}(x)=\sigma{(x)}\cdot (1-\sigma{(x)})
$$

这意味着在代码里，我们算梯度时非常省事，直接用输出值就能算出来。

## 4. 历史地位与局限

- **高光时刻**：在深度学习爆发前，它是神经网络隐藏层的默认选择。在逻辑回归中，它是二分类任务（是/否）的绝对核心。

- **致命弱点（梯度消失）**：S 形曲线的两头，非常的平缓，无限趋近于0 或1。这意味着 **导数（偏导数）** 几乎为 0。如果网络很深，信号传到后面，梯度会越乘越小，最后变成 0。这就导致前面的层根本学不到东西。

CNN 或深层网络，**隐藏层几乎不用 Sigmoid**（改用 ReLU），但**输出层做二分类时仍然会用**。

## 5. 输出层的使用（分类）

来举一个最简单的例子，我们定义一组数值，范围在 [1, 100] 之间，大于 50 的为真，否则为假。回顾 图表1，Sigmoid 函数的分界线在 $x=0$ 这里：

- x > 0 时，0.5 < y < 1
- x = 0 时，y = 0.5
- x < 0 时，0 < y < 0.5

而我们设定的范围在 [1, 100]，对称轴在 50 这里，需要处理一下 **偏置**（-50），让其分界线变为 0，这样才能与 Sigmoid 的内部逻辑一致。

```py
import torch

raw_scores = torch.tensor([10.0, 45.0, 50.0, 55.0, 99.0])
adjusted_scores = raw_scores - 50.0
final_probabilities = torch.sigmoid(adjusted_scores)
predictions = (final_probabilities > 0.5).float()

print("原始分数:", raw_scores.numpy())
print("调整后分数 (减去50):", adjusted_scores.numpy())
print("Sigmoid概率:", final_probabilities.numpy())
print("最终预测 (True/False):", predictions.numpy())
```

## 6. 隐藏层的使用（回归）

与分类的**定性**不同，回归不是来判断是与否，而是来**造型**，告诉线条该怎么弯，怎么扭。假设我们有100个数据x，定义一个抛物线：$y=x^{2}$，y_data 就是真实的离散的点。构建一个简单的神经网络，一个隐藏层，设置4个神经元，使用 Sigmoid 激活函数。

![2. Sigmoid 在隐藏层中的使用](/DeepLearning/Activation/02_sigmoid.png)

这个代码多跑几遍可以看到，几乎每次四个神经元的曲线形态都不一样，但是最终拟合抛物线的效果是差不多的。这是因为每次神经元都会**随机分工**，只要它们合力拼出来的结果是对的，神经网络就觉得 “我学会了”。

```py
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# --- 1. 准备数据 (y = x^2) ---
x_data = torch.linspace(-10, 10, 100).reshape(-1, 1)
y_data = x_data ** 2 + torch.randn(x_data.size()) * 2

# --- 2. 定义网络 (使用 Sigmoid) ---
class SigmoidNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(1, 4) # 隐藏层：1个输入 -> 4个神经元
        self.output = nn.Linear(4, 1) # 输出层：4个输入 -> 1个输出
        self.activation = nn.Sigmoid()

    def forward(self, x):
        h = self.hidden(x) # 第一步：线性变换
        h = self.activation(h) # 第二步：Sigmoid 激活 (把直线变成 S 形曲线)
        y = self.output(h) # 第三步：输出
        return y

# --- 3. 训练 ---
net = SigmoidNet()
optimizer = torch.optim.Adam(net.parameters(), lr=0.3)
loss_func = nn.MSELoss()

print("开始训练 (使用 Sigmoid 隐藏层)...")
for step in range(2001):
    prediction = net(x_data)
    loss = loss_func(prediction, y_data)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if step % 500 == 0:
        print(f"Step {step}, Loss: {loss.item():.4f}")

# --- 4. 画图【彩蛋】看看隐藏层到底学到了什么 ---
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

with torch.no_grad():
    # 1. 获取隐藏层的输出 (4个神经元的激活值)
    hidden_features = net.activation(net.hidden(x_data))

    # 2. 获取输出层的权重和偏置 (这是“合成”的关键配方)。weight: (1, 4), bias: (1,)
    out_weight = net.output.weight.numpy()[0]
    out_bias = net.output.bias.numpy()[0]

    # --- 第一部分：展示 4 个神经元 ---
    plt.figure(figsize=(20, 4))
    for i in range(4):
        plt.subplot(1, 5, i+1)
        neuron_output = hidden_features[:, i].numpy()
        plt.plot(x_data.numpy(), neuron_output, c='green')
        # 标题里加上权重，看看这个神经元说话有多大分量
        plt.title(f"神经元 {i+1}\n(权重: {out_weight[i]:.2f})")
        plt.grid(True)
        plt.ylim(-0.5, 1.5) # 统一Y轴范围，方便对比

    # --- 第二部分：加权求和（画最终的合成曲线） ---
    # 核心公式：最终输出 = (神经元1 * 权重1) + (神经元2 * 权重2) + ... + 偏置
    plt.subplot(1, 5, 5)
    final_sum = (hidden_features.numpy() * out_weight).sum(axis=1) + out_bias
    plt.plot(x_data.numpy(), final_sum, c='red', linewidth=2, label='合成结果')
    plt.plot(x_data.numpy(), y_data.numpy(), c='blue', linestyle='--', alpha=0.3, label='真实数据')

    plt.title("最终结果：加权求和")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.legend()
    plt.grid(True)

    plt.suptitle("Sigmoid 神经网络的“积木原理”：4个S形曲线拼出抛物线（拟合原始数据）", fontsize=16)
    plt.tight_layout()
    plt.show()
```
