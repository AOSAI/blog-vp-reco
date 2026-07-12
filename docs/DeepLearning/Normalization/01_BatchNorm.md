---
title: 批归一化：Batch Norm
date: 2026/06/01
categories:
  - 归一化
tags:
  - 归一化
  - BatchNorm
---

## 1. 归一化的起源

### 1.1 ReLU 的副作用

2012年，Alex Krizhevsky、Ilya Sutskever 和 Geoffrey Hinton 用 AlexNet 拿下了 ImageNet 大赛冠军（NeurIPS 2012）。AlexNet 最关键的创新是用 ReLU 替代了传统的 tanh/sigmoid：

- ReLU 在正半区导数恒为 1，梯度不会衰减，让深层网络第一次真正"训得动"。

但 ReLU 有一个特性：**没有上界**。输入多大，输出就多大。不像 tanh/sigmoid 那样会自动把值压到一个固定区间里。这就带来一个问题：不同通道的激活值可能差异极大。

某个通道学到的特征响应特别强（比如边缘检测器碰到一条明显的边缘），另一个通道学到的东西虽然有用但值偏小（比如纹理检测器），就会被大通道"淹没"——小特征的梯度被大特征主导，白训了。

### 1.2 第一个解决方案：LRN

AlexNet 的解决办法是**局部响应归一化（Local Response Normalization, LRN）**，借鉴了生物视觉中的"侧向抑制"——视网膜上一个神经元兴奋时，会抑制周围神经元的活动，从而增强对比度。

$$
b_{x,y}^{i} = a_{x,y}^{i} / \left(k + \alpha \sum_{j=\max(0,i-n/2)}^{\min(N-1,i+n/2)}(a_{x,y}^{j})^2\right)^{\beta}
$$

LRN 的逻辑是：一个通道在某个位置的激活值，如果周围几个通道的激活值也很大，就把它压一压；只有你一个通道兴奋，那就保留。

![1. LRN 在相邻通道间做归一化 =560x](/DeepLearning/Normalization/01_lrn.png)

LRN 在 AlexNet 时代确实有效，它让 top-1 错误率降低了约 0.5%。但这个方法有一个致命的局限：**它只在相邻通道之间做归一化，范围太窄了**。

### 1.3 更深层的问题：内部协变量偏移

LRN 解决了通道间的激活失衡，但还有一个更根本的问题它碰都没碰到。

在深度神经网络中，每一层的输入都来自前一层的输出。当前面层的参数在更新时，后面层的输入分布就会发生变化。这种现象被称为**内部协变量偏移（Internal Covariate Shift）**。

![2. 训练过程中，每层的输入分布不断变化](/DeepLearning/Normalization/02_ics.png)

想象你在一家公司上班，每天的工作内容都一样，但你的上级每隔几天就换一次。每个新上级都有自己的工作风格和要求，你得不断重新适应。这就是深层网络每层的处境，具体来说：

- 第一层的参数更新后，第二层看到的数据分布就变了
- 第二层刚适应了这个分布，第一层又更新了，分布又变了
- 网络越深，这种"地面不断晃动"的问题越严重

LRN 只在单个层的通道之间做归一化，它无法阻止"分布漂移"这件事。网络一深，前面几层的参数稍微一动，后面所有层的输入分布全变了，LRN 根本管不了这个。

### 1.4 BN 的诞生

2015年，Google 的 Sergey Ioffe 和 Christian Szegedy 提出了 Batch Normalization（ICLR 2015）。他们的核心想法很简单：**既然输入分布一直在变，那我每层在做激活之前，先把整个 mini-batch 的数据强制拉回到均值为 0、方差为 1 的标准分布**。

这个想法的效果是革命性的。BN 论文报告，用 BN 后训练步数减少了 14 倍，最终 ImageNet 上 top-5 错误率达到了 4.8%，超过了人类水平。

## 2. BatchNorm 的原理与推导

### 2.1 基本思想：把分布拉回来

BN 的核心想法就一句话：**在每层激活之前，对数据做归一化，强制拉回到均值为 0、方差为 1 的标准分布**。假设某一层的输入是一个 mini-batch 的数据 $B = \{x_1, x_2, ..., x_m\}$，BN 分三步走：

**第一步：算均值 μ——这组数据的"重心"在哪**

$$
\mu_B = \frac{1}{m}\sum_{i=1}^{m}x_i
$$

比如一个班 5 个同学的身高是 [160, 165, 170, 175, 180]（单位 cm），那均值 μ = 170。均值告诉我们这组数据"整体偏大还是偏小"。

**第二步：算方差 σ²——数据有多"散"**

$$
\sigma_B^2 = \frac{1}{m}\sum_{i=1}^{m}(x_i - \mu_B)^2
$$

方差是每个数据点和均值之差的平方的平均。方差大，说明数据分布很散；方差小，说明数据都挤在一起。上面那组身高的方差就是 50。

**第三步：归一化——统一标尺**

$$
\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}
$$

减去均值（去掉偏移）再除以标准差（缩放幅度），数据就被拉回到了均值 0、方差 1 的标准分布。其中 $\epsilon$ 是一个极小的常数（比如 $10^{-5}$），纯粹是为了防止分母为零，没有实际含义。

**BN 一般放在哪里？** BN 通常放在激活函数之前（原论文推荐的位置）。也有放之后的，但效果没有之前好。

```
输入 x → [BN] → 激活函数 → 下一层
          ↑
    在激活之前做归一化
```

### 2.2 但这还不够：可学习参数 γ 和 β

上一节讲的三步，本质上是把所有数据都硬拉到均值 0、方差 1。但这里有一个问题：**这样做会不会把网络的表达能力也一起"拉平"了？** 打个比方：

你要求公司里每个人每天必须穿同样的衣服、说同样的话。表面上看起来整齐划一了，但创造力也没了。神经网络也一样，如果每一层的输出都是标准正态分布，那网络就失去了 "根据任务需要调整分布" 的自由度。

所以 BN 引入了两个**可学习参数** $\gamma$（缩放）和 $\beta$（偏移）：

$$
y_i = \gamma \hat{x}_i + \beta
$$

加了这两个参数后，网络可以"反悔"：

- 如果 $\gamma = 1, \beta = 0$，就是刚才讲的原始归一化（均值 0，方差 1）
- 如果 $\gamma = \sigma, \beta = \mu$，可以完全恢复到原始的分布（等价于没做归一化）
- 其他值，网络可以学到介于两者之间的最优分布

这就像给每个人发了一套标准工装，但允许他们自己选颜色和配饰——既保证了统一性，又保留了灵活性。

![3. γ 控制分布的宽窄，β 控制分布的位置](/DeepLearning/Normalization/03_gamma_beta.png)

**网络怎么找到"最优分布"？** 答案是靠梯度下降。γ 和 β 是可学习参数，和权重 W 一样参与反向传播。每跑一个 batch，loss 对 γ 和 β 的梯度就会告诉它们：往哪个方向调能让 loss 更小。调着调着，网络就自动找到了当前层最优的分布形态。

## 3. PyTorch 实现

### 3.1 基本用法

BatchNorm 的命名里有 1d、2d、3d，指的是**空间维度的个数**，不是输入张量的总维度：

| 类名          | 空间维度    | 输入形状                | 适用场景          |
| ------------- | ----------- | ----------------------- | ----------------- |
| `BatchNorm1d` | 1D（或 0D） | `(N, C)` 或 `(N, C, L)` | 全连接层、序列    |
| `BatchNorm2d` | 2D          | `(N, C, H, W)`          | 卷积层处理图片    |
| `BatchNorm3d` | 3D          | `(N, C, D, H, W)`       | 视频、3D 医学影像 |

其中 N 是 batch size，C 是通道数，H/W/D 是空间尺寸。

```python
import torch.nn as nn

# 全连接层：输入 (N, 64)，N 是 batch size，64 是特征数
bn1 = nn.BatchNorm1d(num_features=64)

# 卷积层：输入 (N, 32, H, W)，32 是通道数
bn2 = nn.BatchNorm2d(num_features=32)

# 常用可选参数
bn = nn.BatchNorm2d(
    num_features=32,
    eps=1e-5,        # 防止除零的小常数，默认 1e-5
    momentum=0.1,    # running mean/var 的更新速度，默认 0.1
    affine=True      # 是否启用可学习参数 γ 和 β，默认 True
)
```

### 3.2 完整流程：从定义到训练再到推理

下面用一个简单的例子串起 BN 的完整使用流程。场景是：用一个两层全连接网络做手写数字分类。

**第一步：把 BN 塞进网络**

```python
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.bn1 = nn.BatchNorm1d(256)  # BN 放在激活之前
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        x = self.fc1(x)
        x = self.bn1(x)    # BN
        x = self.relu(x)   # 激活
        x = self.fc2(x)
        return x
```

BN 就是一层，和 `nn.Linear`、`nn.ReLU` 一样往网络里塞就行。位置在激活函数之前。这里之所以是 1D，因为网络层用的 Linear 线性层。

**第二步：训练时——BN 用 batch 统计量**

```python
model = SimpleNet()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = nn.CrossEntropyLoss()

model.train()  # ← 关键：告诉 BN "现在是训练模式"

for epoch in range(10):
    for batch_x, batch_y in dataloader:
        pred = model(batch_x)          # 前向传播
        loss = loss_fn(pred, batch_y)  # 算损失

        optimizer.zero_grad()          # 梯度清零
        loss.backward()                # 反向传播
        optimizer.step()               # 更新参数
```

训练时，BN 每次用当前 batch 的均值和方差来归一化。比如 batch size = 32，BN 就从这 32 个样本里算出均值 μ 和方差 σ²，然后用它们做归一化。同时，BN 还会悄悄积累一个全局的 running mean 和 running variance，为推理做准备。

**第三步：推理时——BN 用全局统计量**

```python
# ✅ 正确
model.eval()  # 切到推理模式，BN 用 running statistics
with torch.no_grad():
    test_pred = model(test_x)

# ❌ 错误：忘记调 model.eval()
# BN 会继续用 batch 统计量，输出不确定
with torch.no_grad():
    test_pred = model(test_x)
```

推理时可能只有一个样本，没法算 batch 的统计量。而且我们希望同样的输入得到同样的输出，不能因为 batch 里其他样本不同而导致结果变化。所以推理时 BN 用训练中积累的 running mean 和 running variance。

> 记住：**训练前 `model.train()`，推理前 `model.eval()`**，这两个调用成对出现。

### 3.4 SyncBatchNorm：分布式训练

当使用多 GPU 训练时，每个 GPU 上的 batch 统计量可能不同。SyncBN 会跨 GPU 同步统计量，让每个 GPU 看到全局的 batch 信息。

```python
# 将模型转换为使用 SyncBatchNorm
model = nn.SyncBatchNorm.convert_sync_batchnorm(model)

# 然后用 DistributedDataParallel 包装
model = nn.parallel.DistributedDataParallel(model)
```

### 3.5 LocalResponseNorm：早期的归一化

这是 AlexNet 时期（2012年）使用的归一化方法，现在已被 BN 取代，仅了解。

```python
lrn = nn.LocalResponseNorm(
    size=5,       # 参与归一化的相邻通道数
    alpha=0.0001, # 缩放系数
    beta=0.75,    # 指数系数
    k=2.0         # 偏移量，防止分母为零
)
```

## 4. 总结

### 4.1 优点

1. **加速训练**：可以使用更大的学习率
2. **减少对初始化的依赖**：网络不再那么敏感于权重初始化
3. **一定的正则化效果**：因为每个样本的归一化依赖于 batch 中的其他样本

### 4.2 缺点与注意事项

1. **依赖 batch size**：batch 太小时统计量不准确。建议 batch_size 取 32 或 64；太小（1-2）会导致 BN 效果很差，这时候考虑用 GroupNorm 或 LayerNorm
2. **不适用于变长序列**：RNN/Transformer 中序列长度不一致，用 LayerNorm
3. **训练和推理的差异**：两个模式行为不同，推理前记得调 `model.eval()`
4. **可学习参数 γ 和 β**：让网络有"反悔"的能力，归一化后效果不好可以恢复原始分布
