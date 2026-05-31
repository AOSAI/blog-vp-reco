---
title: MSE：均方误差
date: 2026/05/09
categories:
  - 损失函数
tags:
  - 损失函数
---

## 1. 什么是 MSE？

MSE（Mean Squared Error）叫做 **均方误差**。如果要用一句话概括它的核心思想，那就是：`预测值与真实值差得越远，惩罚就越狠（而且是平方级的狠）`。

$$
\text{MSE}=\frac{1}{n}\sum^{n}_{i=1}(y_{i}-\hat{y}_{i})^{2}
$$

它的公式十分简单，我们把它拆成三步来看：

1. **求误差**：$y_{i}-\hat{y}_{i}$。就是 ==真实值== 减去 ==预测值==。比如真实房价 100 万，你预测 90 万，误差就是 10 万。

2. **平方**：$(...)^{2}$。把刚才的误差进行平方。误差从10万变成了100万。

3. **求平均**：$\frac{1}{n}\sum$。把所有样本的平方误差加起来，除以样本总数 n。这样我们就得到了一个代表整体水平的数值。

## 2. 设计哲学：平方

你可能会问：“为什么不直接算误差的绝对值？或者直接把误差加起来？”。这就涉及到了 MSE 最精妙的两个设计哲学：

### 2.1 **消除方向，只看大小**

- 预测多了（预测 110，真实 100），误差是 +10。
- 预测少了（预测 90，真实 100），误差是 -10。

这里的误差是有方向的，如果我们直接把误差加起来：(+10)+(−10)=0 。模型会误以为自己预测得完美无缺，但这显然是错的。

**平方的第一个作用**：无论是 +10 还是 -10，平方后都是 100。它强行把所有误差都变成了正数，让我们只关注“偏离了多少”，而不关心“偏左还是偏右”。

### 2.2 **放大“大错误”（重要！）**

这是 MSE 的灵魂所在。平方操作会对大误差进行“惩罚性放大”。请看这个对比：

| 误差大小        | 绝对值 (MAE) | 平方 (MSE) | 后果                     |
| :-------------- | :----------- | :--------- | :----------------------- |
| **小错误 (2)**  | 2            | 4          | 惩罚很轻，模型不太在意。 |
| **中错误 (10)** | 10           | 100        | 惩罚变重。               |
| **大错误 (20)** | 20           | 400        | **惩罚爆炸！**           |

这意味着 MSE 告诉模型：**“你可以犯小错，我睁一只眼闭一只眼；但如果你犯了大错（比如把 100 万的房子预测成 500 万），我会让你痛不欲生”**。逼着模型赶紧修正这个巨大的偏差。

所以，使用 MSE 的模型，通常会 **极力避免 outliers（异常值）**，它会拼命去拟合那些偏差最大的点。

## 3. 几何图像的解读

如果我们把MSE画在空间直角坐标系里，就是类似初中学过的抛物线 $y=x^{2}$ 的样子：

![1. MSE 的几何空间表示](/DeepLearning/Loss/01_MSE.png =560x)

**这个形状对计算机来说太完美了**：

1. **处处可导**：它是一个光滑的曲线，没有折角。这意味着我们可以轻松算出梯度（斜率），告诉模型“往哪边走能下坡”。
2. **唯一最低点**：对于简单的线性回归，这个碗只有一个底。只要顺着坡度往下走（梯度下降），就一定能找到全局最优解，不会迷路。

## 4. MSE 的优缺点总结

- **优点**：
  - **数学性质极好**：光滑、可导，非常适合梯度下降算法。
  - **关注大错**：能够迅速修正模型中明显的错误预测。

- **缺点**：对异常值太敏感

如果你的数据里混进了一个脏数据（比如真实的房价是 100 万，但有个数据录入错误变成了 10000 万），MSE 会因为这个巨大的平方误差，把整个模型的参数带偏，导致模型为了迁就这个异常点，而牺牲了对其他正常点的预测。

## 5. 过程的可视化理解

一个简单的多层感知机，1个隐藏层，4个神经元，用来拟合 sin 曲线。通过这5次的结果图，可以看出 MSE 损失在不断的减小，而数据也在不断的趋近于 sin 函数曲线。只不过因为神经元、网络层数太少，所以拟合效果不怎么样。可以自行调整尝试。

![2. MSE 的几何空间表示](/DeepLearning/Loss/02_MSE.png)

:::: code-group
::: code-group-item 多层感知机主体

```py
import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import numpy as np

# --- 1. 准备数据：造一条正弦曲线 ---
x = torch.linspace(-3.14, 3.14, 1000).reshape(-1, 1) # 生成 1000 个从 -3.14 到 3.14 的点
y = torch.sin(x) # 目标是 sin(x)

# --- 2. 定义网络：极简 MLP (1 -> 4 -> 1) ---
class TinyMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(1, 4) # 输入层(1) -> 隐藏层(4)
        self.relu = nn.ReLU() # 激活函数
        self.output = nn.Linear(4, 1) # 隐藏层(4) -> 输出层(1)

    def forward(self, x):
        x = self.hidden(x)
        x = self.relu(x)
        x = self.output(x)
        return x


# --- 3. 定义损失和优化器 ---
model = TinyMLP()
criterion = nn.MSELoss() # 回归任务，用 MSE
optimizer = torch.optim.SGD(model.parameters(), lr=0.1) # SGD (学习率设大一点，方便观察变化)

# --- 4. 训练循环 ---
print("开始训练，观察 Loss 阶段性下降...")

loss_history = []
# 定义关键节点：0, 10, 30, 70, 150, 300
key_steps = [0, 10, 30, 70, 150, 300]
snapshots = []

# 抓拍初始状态（Step 0）
with torch.no_grad():
    snapshots.append(model(x).detach().numpy())

# 注意：我们要跑到 300 步，所以 range 是 300
for epoch in range(300):
    # 1. 前向传播
    prediction = model(x)
    # 2. 计算损失
    loss = criterion(prediction, y)

    # 3. 反向传播与更新
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # 记录 Loss
    loss_history.append(loss.item())

    # 在特定节点“抓拍”
    if (epoch + 1) in key_steps:
        print(f'Step: {epoch+1:4d}, Loss: {loss.item():.6f}')
        snapshots.append(prediction.detach().numpy())
```

:::
::: code-group-item 可视化代码

```py
# --- 5. 可视化结果：按照你的表格布局 ---
# 全局字体配置
plt.rcParams.update({
    'font.size': 10,          # 全局默认字体大小
    'axes.titlesize': 12,     # 坐标轴标题（即 plt.title）的大小
    'axes.labelsize': 10,     # 坐标轴标签（即 plt.xlabel/ylabel）的大小
    'xtick.labelsize': 8,     # X轴刻度数字的大小
    'ytick.labelsize': 8,     # Y轴刻度数字的大小
    'legend.fontsize': 8,     # 图例文字的大小
    'figure.titlesize': 14    # 整个画布标题的大小
})

# 5 行 3 列
plt.figure(figsize=(20, 25))

# 定义每个阶段的区间
# (总步数终点, 局部起点, 局部终点)
# 注意：这里的数字对应的是 key_steps 的索引逻辑
stages = [
    (10, 0, 10),
    (30, 10, 30),
    (70, 30, 70),
    (150, 70, 150),
    (300, 150, 300)
]

for i, (total_end, local_start, local_end) in enumerate(stages):
    # === 第一列：累积视角 (0 -> total_end) ===
    plt.subplot(5, 3, i * 3 + 1)
    # 截取从 0 到 total_end 的数据
    # 注意：loss_history 索引 0 是 Step 1，所以切片是 [:total_end]
    cumulative_loss = loss_history[:total_end]

    plt.plot(range(1, total_end + 1), cumulative_loss, 'k-', linewidth=1.5)
    plt.title(f'Cumulative View: Step 0 -> {total_end}', fontsize=14)
    plt.xlabel('Step')
    plt.ylabel('Loss')
    plt.grid(True, linestyle='--')
    # 标记当前阶段的结束点
    plt.axvline(x=total_end, color='r', linestyle='--', alpha=0.5)

    # === 第二列：局部视角 (local_start -> local_end) ===
    plt.subplot(5, 3, i * 3 + 2)
    # 截取局部数据
    # 比如 10-30，对应 loss_history 的索引 [9:30] (因为索引0是Step1)
    # 但为了方便，我们直接用切片 [local_start:local_end]
    # 因为 loss_history[0] 是 Step 1，所以 loss_history[10] 是 Step 11
    # 这里我们需要稍微调整一下索引以匹配 Step 数字
    # Step N 对应 loss_history[N-1]
    # 所以 Step A -> Step B 对应 loss_history[A-1 : B]

    # 修正索引逻辑：
    # 如果 local_start 是 0，从索引 0 开始
    start_idx = local_start if local_start == 0 else local_start
    end_idx = local_end

    # 为了画图横坐标正确，我们需要重新生成 x 轴
    segment_loss = loss_history[start_idx:end_idx]
    x_axis = range(local_start, local_end)

    plt.plot(x_axis, segment_loss, 'b-', linewidth=2)
    plt.title(f'Stage Detail: Step {local_start} -> {local_end}', fontsize=14)
    plt.xlabel('Step')
    plt.ylabel('Loss')
    plt.grid(True, linestyle='--')

    # === 第三列：拟合结果 (红线 vs 蓝线) ===
    plt.subplot(5, 3, i * 3 + 3)

    # 找到对应的快照索引
    # key_steps 是 [0, 10, 30...]
    # total_end 是 10, 30...
    # 我们需要找到 total_end 在 key_steps 中的位置
    snapshot_idx = key_steps.index(total_end)

    pred_at_step = snapshots[snapshot_idx]

    plt.plot(x.numpy(), y.numpy(), 'b-', label='Real Sine', linewidth=2, alpha=0.6)
    plt.plot(x.numpy(), pred_at_step, 'r-', label=f'Prediction at {total_end}', linewidth=2)

    plt.title(f'Fitting Result at Step {total_end}', fontsize=14)
    plt.xlabel('x')
    plt.ylabel('y')
    plt.legend()
    plt.grid(True)

plt.suptitle('Training Process Analysis: Cumulative vs Stage vs Fitting', fontsize=20)
plt.tight_layout()
plt.show()
```

:::
::::

## 6. 欧几里得空间与MSE

什么是欧几里得空间？简单来说：**欧几里得空间就是我们日常生活的空间**。

- 你住的房间是一个欧几里得空间（三维）
- 你画在纸上的图形是在欧几里得空间中（二维）
- 你走的直线、测量的距离、看到的角度——这些都是欧几里得几何

它的特点就是"符合我们的直觉"：

| 特性                   | 例子                                                         |
| ---------------------- | ------------------------------------------------------------ |
| **两点之间直线最短**   | 你想从A点到B点，走直线最快                                   |
| **平行线永不相交**     | 铁轨看起来在远处"交汇"，但实际上在欧氏空间中它们永远不会相交 |
| **三角形内角和是180°** | 你在纸上画的任何三角形，三个角加起来都是180度                |
| **勾股定理成立**       | 直角三角形的两条直角边平方和等于斜边平方                     |

在1维到3维我们很好理解，但是深度学习通常都是很高维的去处理，我们该怎么去理解这个事情呢？**高维欧几里得空间：严格符合定义吗？**

是的，严格符合。欧几里得空间的数学定义是：==n 维欧几里得空间 $\R^{n}$ 是由所有 n 元实数组成的集合，配上欧几里得距离度量==：

$$
d(x,y)=\sqrt{\sum^{n}_{i=1}(x_{i}-y_{i})^{2}}
$$

这个定义对任何维度n都成立，无论是 1 维直线、2 维平面、3 维空间、4 维空间 …… n 维空间。举个具体的例子，房价预测任务 🏠，假设我们有一个简单的任务，根据 4 个特征预测房价，4 个维度分别是什么？

| 维度  | 特征       | 单位   | 含义           |
| ----- | ---------- | ------ | -------------- |
| 第1维 | 房屋面积   | 平方米 | 房子有多大     |
| 第2维 | 房间数量   | 个     | 有几个房间     |
| 第3维 | 距离市中心 | 公里   | 离市中心多远   |
| 第4维 | 房龄       | 年     | 房子建了多少年 |

这4个维度构成了什么？每个房子在这个 4 维空间中就是一个点，坐标是：x = (面积,房间数,距离,房龄)。举个具体例子：

- 房子A：(100,3,5,10) → 100平米、3个房间、距离市中心5公里、10年房龄
- 房子B：(80,2,8,5) → 80平米、2个房间、距离市中心8公里、5年房龄

如何计算这两个房子的"距离"？用欧几里得距离公式计算一下：

$$
\begin{equation}
\begin{split}
d &=\sqrt{(100-80)^{2}+(3-2)^{2}+(5-8)^{2}+(10-5)^{2}} \\
  &=\sqrt{400+1+9+25}=\sqrt{435}\approx20.68
\end{split}
\end{equation}
$$

这个距离的含义是：**在 4 维特征空间中，房子A和房子B的"相似度"**。距离越小，说明两套房子越相似。这四个维度，每个维度代表一个独立的特征方向，也就是，四个方向在数学上 ==**互相正交**（点积为0），彼此独立==。
