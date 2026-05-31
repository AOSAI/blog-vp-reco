---
title: CNN 家族总结：演进脉络与并行分支
date: 2026/05/30
categories:
  - 网络结构
tags:
  - 神经网络
  - CNN
  - 总结
---

前五篇文章，我们沿着一条主线走了很远：从 LeNet 的 5 层到 ResNet 的 152 层。但深度只是 CNN 演进的一个维度。2014 年之后，研究者开始从宽度、效率、注意力、并行度等多个方向同时推进，形成了几条并行的演进路线。本文是整个 CNN 系列的收束。

## 1. 深度演进：从 LeNet 到 DenseNet

### 1.1 四代主线回顾

回顾我们走过的路：

| 网络    | 年份 | 核心创新              | 解决的问题                 |
| ------- | ---- | --------------------- | -------------------------- |
| LeNet-5 | 1989 | 卷积 + 池化的基本骨架 | 证明 CNN 可行              |
| AlexNet | 2012 | ReLU + Dropout + 双卡 | 梯度消失 + 数据不足        |
| VGG     | 2014 | 全用 3×3 小核堆叠     | 统一结构，证明深度的重要性 |
| ResNet  | 2015 | 残差连接              | 退化问题，让超深网络可训练 |

> **一句话**：LeNet 证明了 CNN 可行，AlexNet 让 CNN 变大，VGG 让 CNN 变规律，ResNet 让 CNN 变深。

这条线的核心问题是：**网络能不能做深？怎么做深？** ResNet 用残差连接给出了答案。但 2015 年之后，研究者发现单纯加深的收益开始递减——网络足够深之后，下一个瓶颈在哪里？

### 1.2 DenseNet：极致的特征复用

ResNet 的残差连接是"加法"：$y = F(x) + x$。输入 $x$ 只和当前层的输出 $F(x)$ 做一次加法。

2017 年，Gao Huang 等人提出了 DenseNet，走得更极端：**每一层都和前面所有层直接连接**。

![Fig.1 Dense Block 内部连接结构：每层都和前面所有层直接连接](/DeepLearning/Network/06_densenet_block.png)

```
Dense Block 内部：
Layer 1 → [x₁]
Layer 2 → [x₁, x₂]  （拼接 Layer 1 的输出）
Layer 3 → [x₁, x₂, x₃]  （拼接 Layer 1 和 2 的输出）
Layer 4 → [x₁, x₂, x₃, x₄]  （拼接前面所有输出）
```

如果 ResNet 是"加法"，DenseNet 就是"拼接"：$y = [x_1, x_2, ..., x_{\ell-1}, F(x)]$。每一层都能直接访问前面所有层的原始特征，不需要通过梯度逐层传递。

> **一句话记住 DenseNet**：ResNet 是"加一条捷径"，DenseNet 是"把所有路都打通"。

DenseNet 的核心洞察是：**特征复用**。如果浅层已经学到了边缘纹理，深层不需要重新学，直接拿过来用就行。这带来两个好处：

1. **参数效率极高**：不需要重新学习冗余特征，每层的卷积核数量可以很小（增长系数 $k$ 通常取 12 或 32）
2. **梯度流动顺畅**：每一层都能直接看到损失信号，训练更容易

#### 1.2.1 增长系数 $k$：每层学多少新东西

增长系数 $k$（growth rate）是 DenseNet 中每层新增的特征图数量。假设输入有 $C_{in}$ 个通道：

| Layer | 输入通道数  | 输出通道数 | 累计通道数  |
| ----- | ----------- | ---------- | ----------- |
| 1     | $C_{in}$    | $k$        | $C_{in}+k$  |
| 2     | $C_{in}+k$  | $k$        | $C_{in}+2k$ |
| 3     | $C_{in}+2k$ | $k$        | $C_{in}+3k$ |
| ...   | ...         | ...        | ...         |

每层只新增 $k$ 个特征图，但输入通道数在不断增加（因为拼接了前面所有层的输出）。

> **一个常见困惑**：如果一直用 3×3 卷积，图像尺寸变小了，特征图数量会不会也变少？答案是**不会**。通道数由卷积核数量决定，和输入尺寸无关。下采样只改变特征图的高宽，不改变通道数。

以 DenseNet-121（$k=32$）为例：

```
Dense Block 1（6层）：
  Layer 1: Conv(64, 32, 3×3) → 输出32个特征图
  Layer 2: Conv(64+32=96, 32, 3×3) → 输出32个特征图
  Layer 3: Conv(96+32=128, 32, 3×3) → 输出32个特征图
  ...
  Layer 6: Conv(192+32=224, 32, 3×3) → 输出32个特征图
  最终输出：64 + 6×32 = 256 个通道
```

这就是"特征复用"的代价：参数量很小（每层只学 $k$ 个新特征），但通道数在不断增加。

#### 1.2.2 "学不到东西"时会怎样？

一个自然的问题：如果到了深层，网络已经学不到新东西了，DenseNet 还会继续卷积吗？还是有判别机制做停止？答案是：**DenseNet 没有自动停止机制，但它的设计让"学不到东西"的代价很低**。

1. **每层必须输出 $k$ 个特征图**：不管学没学到有用的东西，每层都要输出 $k$ 个通道。如果学不到新东西，这 $k$ 个通道可能趋近于0（类似ReLU的死亡），或者重复前面层已经学过的特征。

2. **拼接操作保证信息不丢失**：即使某一层的输出是"废的"，前面所有层的原始特征仍然保留在拼接结果里。后面的层仍然可以访问那些有用的特征。

| 网络     | "学不到东西"时的表现                         | 信息是否丢失 |
| -------- | -------------------------------------------- | ------------ |
| ResNet   | 输出0，输入原封不动传过去（$y = 0 + x = x$） | 不丢失       |
| DenseNet | 该层输出废特征，但前面层特征保留             | 不丢失       |

![Fig.2 特征复用：浅层学边缘，深层直接用，不需要重新学](/DeepLearning/Network/06_densenet_reuse.png =560x)

> **一句话记住 DenseNet 的容错机制**：某一层学废了，不影响后面的层使用前面的有用特征。DenseNet 没有"停止"机制，但有"容错"机制。

#### 1.2.3 代码对比：forward 中的关键差异

ResNet 和 DenseNet 的核心差异在 `forward` 函数中一目了然：

```python
# ResNet BasicBlock
class BasicBlock(nn.Module):
    def forward(self, x):
        identity = x  # 保存输入
        out = self.conv1(x)
        out = self.conv2(out)
        out += identity  # 关键：加法（+）
        return out
```

```python
# DenseNet DenseLayer
class DenseLayer(nn.Module):
    def forward(self, x):
        # x 是前面所有层输出的拼接
        out = self.conv1(x)
        out = self.bn2(out)
        out = self.relu2(out)
        return torch.cat([x, out], dim=1)  # 关键：拼接（cat）
```

> ResNet 是 `out += x`（加法），DenseNet 是 `torch.cat([x, out])`（拼接）。

| 网络         | 深度 | 参数量 | Top-5 错误率 |
| ------------ | ---- | ------ | ------------ |
| ResNet-50    | 50   | 25M    | 5.25%        |
| DenseNet-121 | 121  | 8M     | 5.49%        |
| DenseNet-264 | 264  | 33M    | 4.96%        |

DenseNet-121 的参数量只有 ResNet-50 的 1/3，精度相当。代价是显存占用高（因为要拼接所有特征图），实际训练时 batch size 受限。

### 1.3 深度线收束：为什么不再单纯加深

从 LeNet 的 5 层到 DenseNet 的 264 层，深度增加了 50 倍。但 2017 年之后，研究者发现：

1. **收益递减**：超过 100 层后，精度提升非常有限
2. **计算成本剧增**：层数线性增加，推理时间线性增加
3. **工程难度加大**：训练时间长，显存占用大，调参复杂

> **设计哲学**：深度是手段，不是目的。网络最终要解决的是"如何高效地提取特征"，而不是"如何堆更多层"。

2017 年之后，研究重心从"加深"转向了其他方向：加宽、提效、注意力、并行度。这些方向的核心问题是：**在给定的计算预算下，如何让网络更聪明？**

## 2. 加宽：谷歌 Inception 家族的演进

"加宽"的核心思想是：**同一层内同时看多个尺度的特征**。与其用一个卷积核看局部，不如同时用多个不同大小的卷积核，最后拼起来。

### 2.1 Inception v1：多尺度并联

2014 年，Google 的 ==GoogLeNet（也叫 Inception v1）== 在 ImageNet 比赛中以 6.7% 的 top-5 错误率夺冠。它的核心创新是 **Inception 模块**：在同一层内并联 1×1、3×3、5×5 的卷积核，输出拼接后传给下一层。

![Fig.3 Inception Module 内部结构：4 个分支并联，最后拼接](/DeepLearning/Network/06_inception_module.png =560x)

**为什么不只用 3×3？** 因为图像中的特征尺度不同：猫耳朵是小区域，猫身体是大区域。一个 3×3 的核只能看局部，如果想知道"这张图的整体轮廓"，就需要更大的感受野。Inception 让网络自己学习"该看多大"。

#### 2.1.1 Inception v1 的配置表

每个分支的通道数是超参数，通过实验确定：

| 分支  | 第一层（1×1 Conv） | 第二层             | 输出通道 | 作用         |
| ----- | ------------------ | ------------------ | -------- | ------------ |
| 分支1 | 192 → 64           | 无                 | 64       | 细粒度特征   |
| 分支2 | 192 → 96           | 3×3 Conv（96→128） | 128      | 中等尺度特征 |
| 分支3 | 192 → 16           | 5×5 Conv（16→32）  | 32       | 大尺度特征   |
| 分支4 | MaxPool → 1×1 Conv | 192 → 32           | 32       | 池化特征     |

拼接后输出：64 + 128 + 32 + 32 = **256 通道**

#### 2.1.2 1×1 卷积降维的原理

"从 192 降到 96"不是简单的砍一半，而是用 1×1 卷积做**通道混合**：

```
1×1 卷积的本质：
- 输入：(192, H, W)  →  1×1 卷积核  →  输出：(96, H, W)
- 每个输出通道 = 192 个输入通道的加权和
- 相当于在通道维度上做"压缩"，空间尺寸不变
```

**为什么要降维？** 因为 3×3 和 5×5 卷积的计算量很大：

| 配置                         | 计算量                                                              |
| ---------------------------- | ------------------------------------------------------------------- |
| 直接 3×3：192 → 192          | $192 \times 192 \times 9 \times H \times W$                         |
| 先降维再 3×3：192 → 96 → 192 | $192 \times 96 \times 1 + 96 \times 192 \times 9 \times H \times W$ |

降维后计算量减少约 4 倍。这就是 1×1 卷积的价值：**用极少的计算量减少通道数，为后续的大卷积核减负**。

GoogLeNet 一共 22 层，包含 9 个 Inception Module。辅助分类器（Aux1、Aux2）用于解决梯度消失问题。

![Fig.4 GoogLeNet 完整架构：22 层，9 个 Inception Module](/DeepLearning/Network/06_inception_arch.png =560x)

### 2.2 Inception v3：小核拆分

2015 年，Inception v3 提出了一个更优雅的方案：**把大卷积核拆成多个小卷积核的串联**。

![Fig.5 卷积核分解：3×3 拆成 1×3 + 3×1，参数减少 33%](/DeepLearning/Network/06_inception_v3_decomp.png)

**两种分解方式：**

| 分解前   | 分解后              | 参数变化        | 适用场景               |
| -------- | ------------------- | --------------- | ---------------------- |
| 5×5 Conv | 两个 3×3 Conv       | 25 → 18（-28%） | 中等尺寸特征图         |
| 3×3 Conv | 1×3 Conv + 3×1 Conv | 9 → 6（-33%）   | 大尺寸特征图（≥17×17） |

**非对称分解的好处不只是参数少：**

1. **参数更少**：9 个参数变成 6 个，节省 33%
2. **非线性更强**：两层激活函数（ReLU）比一层多一次非线性变换
3. **感受野不变**：1×3 + 3×1 的感受野仍然是 3×3

**什么时候用非对称分解？** 论文建议：只有特征图尺寸 ≥17×17 时才有效。太小的图（如 7×7）用非对称分解反而效果差，因为水平和垂直方向的特征已经高度耦合。

| 对比项       | 层数  | 5×5 卷积     | 3×3 卷积       | 参数量 | Top-5 错误率 |
| ------------ | ----- | ------------ | -------------- | ------ | ------------ |
| Inception v1 | 22 层 | 直接用       | 直接用         | 6.8M   | 6.7%         |
| Inception v3 | 42 层 | 拆成两个 3×3 | 拆成 1×3 + 3×1 | 23.8M  | 3.58%        |

#### 2.2.1 模型保存、参数量与存储空间

模型文件里保存的不是"卷积结果"（特征图），而是**卷积核的权重**——即"怎么卷积"的规则。

```
一个卷积层的参数 = 卷积核大小 × 输入通道数 × 输出通道数 + 偏置

例如：Conv(192→64, 3×3)
参数 = 3 × 3 × 192 × 64 + 64 = 110,656 个数字
```

- 训练前：这些数字是随机初始化的
- 训练后：这些数字是学到的最佳权重
- 保存模型 = 保存这些权重数字

| 网络         | 参数量 | 存储空间（FP32） |
| ------------ | ------ | ---------------- |
| Inception v1 | 6.8M   | ~27 MB           |
| Inception v3 | 23.8M  | ~95 MB           |

> `1 个参数 = 1 个浮点数 = 4 字节（FP32）`。6.8M 参数 ≈ 27 MB，23.8M 参数 ≈ 95 MB。

### 2.3 Xception：深度可分离卷积

#### 2.3.1 背景：通道之间的耦合问题

Inception 的多尺度并联虽然有效，但每个分支仍然在**所有通道上同时做卷积**。这就引出一个问题：**通道之间的耦合是否必要？**

标准卷积的做法是：一个卷积核同时在空间维度（H×W）和通道维度（C）上做计算。但这两个维度的信息是否应该一起处理？

Xception 的回答是：**分开做**。先在空间维度提取特征（每个通道独立），再在通道维度混合信息。

#### 2.3.2 深度可分离卷积的两步

![Fig.6 深度可分离卷积：先空间提取，再通道混合](/DeepLearning/Network/06_xception_depthwise.png)

**第一步：深度卷积（Depthwise Conv）**

- 每个通道用独立的卷积核
- 输入 $C_{in}$ 个通道，就用 $C_{in}$ 个 $k×k$ 的卷积核
- 每个卷积核只在自己的通道上滑动，不看其他通道
- 输出 $C_{in}$ 个特征图

```
输入：(C_in, H, W)
深度卷积：C_in 个 k×k 卷积核，每个独立工作
输出：(C_in, H, W)  ← 通道数不变
```

**第二步：逐点卷积（Pointwise Conv）**

- 用 1×1 卷积混合通道信息
- 输入 $C_{in}$ 个通道，输出 $C_{out}$ 个通道
- 这一步和标准 1×1 卷积一样

```
输入：(C_in, H, W)
逐点卷积：1×1 卷积，C_in → C_out
输出：(C_out, H, W)  ← 通道数改变
```

#### 2.3.3 参数量对比

| 方式       | 计算内容        | 参数量（C_in=64, C_out=128, k=3）     |
| ---------- | --------------- | ------------------------------------- |
| 标准卷积   | 空间+通道一起做 | $64 \times 128 \times 9 = 73,728$     |
| 深度可分离 | 先空间，再通道  | $64 \times 9 + 64 \times 128 = 8,768$ |

参数量减少 **88%**！

#### 2.3.4 实验结果：ImageNet 上的表现

参数量少了 88%，效果呢？**更好了。**

| 模型         | Top-1 准确率 | Top-5 准确率 | 参数量 |
| ------------ | ------------ | ------------ | ------ |
| Inception v3 | 78.8%        | 94.4%        | 23.8M  |
| Xception     | 79.0%        | 94.5%        | 22.9M  |

数据集：ImageNet（1000 类，128 万张训练图，5 万张验证图）

Xception 的参数量更少（-4%），精度更高（Top-1 +0.2%）。这说明**空间和通道分开做是有效的**——标准卷积假设"两件事必须一起学"，但实验证明分开学再合作更好。

> **一句话记住 Xception**：把"空间特征提取"和"通道信息混合"分开做，参数更少、精度更高。

## 3. 提效：轻量化网络

Inception 和 Xception 的效率提升主要来自卷积操作的分解。但它们仍然不是为移动端设计的——参数量和计算量对手机来说还是太大。

**2017 年的移动端硬件背景**：当时移动端 NPU 刚刚起步（华为麒麟 970、苹果 A11 是首批内置 NPU 的芯片），大部分手机仍然依赖 CPU 和 GPU 进行推理。移动 GPU（如 Adreno、Mali）的算力有限，跑一个 Inception v3（23.8M 参数，56 亿次乘加）需要好几秒，远达不到实时要求。

轻量化网络的目标是：**在精度损失可接受的前提下，把计算量压到极致**，让手机等移动端设备也能实时推理。

### 3.1 MobileNet v1：深度可分离卷积

2017 年，Google 提出了 MobileNet v1，核心就是 Xception 中的 **深度可分离卷积**，但专门针对移动端做了优化。MobileNet v1 引入了两个超参数来控制效率：

| 超参数      | 含义           | 效果                              |
| ----------- | -------------- | --------------------------------- |
| Width Mult. | 通道数缩放     | 0.5 = 通道数减半，计算量减 4 倍   |
| Resolution  | 输入分辨率缩放 | 128×128 vs 224×224，计算量减 3 倍 |

通过调整这两个参数，可以在精度和速度之间灵活权衡。**这两个超参数是全局参数**，不在单个卷积层的代码中体现，而是在定义整个网络时使用。

:::: code-group
::: code-group-item 深度可分离卷积（单个层）

```py
class DepthwiseSeparableConv(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        # 深度卷积：每个通道独立
        self.depthwise = nn.Conv2d(in_ch, in_ch, 3, stride=stride,
                                   padding=1, groups=in_ch, bias=False)
        self.bn1 = nn.BatchNorm2d(in_ch)
        # 逐点卷积：1×1 混合通道
        self.pointwise = nn.Conv2d(in_ch, out_ch, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.relu(self.bn1(self.depthwise(x)))
        x = self.relu(self.bn2(self.pointwise(x)))
        return x
```

:::
::: code-group-item 完整网络（使用超参数）

```py
def MobileNetV1(width_multiplier=1.0, num_classes=1000):
    # 原始通道数
    cfg = [64, 128, 128, 256, 256, 512, 512, 512, 512, 512, 512, 1024, 1024]
    # 通道数缩放：width_multiplier=0.5 时，所有层通道数减半
    cfg = [int(c * width_multiplier) for c in cfg]

    layers = []
    in_ch = 3
    for out_ch in cfg:
        layers.append(DepthwiseSeparableConv(in_ch, out_ch))
        in_ch = out_ch
    layers.append(nn.AdaptiveAvgPool2d(1))
    layers.append(nn.Flatten())
    layers.append(nn.Linear(cfg[-1], num_classes))

    return nn.Sequential(*layers)

# 输入分辨率缩放：直接调整输入图像大小（数据预处理中操作）
# input_size=128 → 输入 128×128，计算量减小
# input_size=224 → 输入 224×224，标准配置
```

:::
::::

关键参数 `groups=in_ch`：这是 PyTorch 中实现深度卷积的方式。`groups` 等于通道数时，每个通道独立卷积。

### 3.2 MobileNet v2：倒残差 + 线性瓶颈

MobileNet v1 的深度可分离卷积虽然高效，但有一个问题：**ReLU 在 bottleneck 层上会损失信息**。v1 的每一层输出就是 bottleneck 层（比如 64 通道），ReLU 直接作用在这个层上，会"砍死"很多神经元（输出为 0 的神经元永远不更新），导致信息永久丢失。

2018 年，MobileNet v2 提出了两个改进：

![Fig.7 Inverted Residual Block 内部结构：升维→深度卷积→降维](/DeepLearning/Network/06_mobilenetv2_block.png =560x)

==**倒残差（Inverted Residual）**==：先用 1×1 卷积**升维**（6倍），再做深度卷积，最后用 1×1 卷积**降维**。和 ResNet 的"先降维再升维"刚好相反。

```
ResNet Block：    ↓ 1×1 Conv (降维) → 3×3 Conv → 1×1 Conv (升维) → + x
MobileNet v2：    ↓ 1×1 Conv (升维) → 3×3 Depthwise → 1×1 Conv (降维) → + x
```

==**线性瓶颈（Linear Bottleneck）**==：降维后的 1×1 卷积不加 ReLU，保持线性输出。原因和上面一样：ReLU 在低维空间会"砍死"特征。

> **一句话记住 MobileNet v2**：先升维再降维（倒残差），降维后不加激活（线性瓶颈）。

#### 3.2.1 MobileNetV2 的准确结构

![Fig.8 MobileNetV2 完整架构：Conv1 → 7 个 Inverted Residual Block → Conv2 → GAP → FC](/DeepLearning/Network/06_mobilenetv2_arch.png)

```text
第一层（Conv1）：
输入：3 通道（RGB）
→ 普通 3×3 Conv：3 → 32 通道，stride=2
→ 输出：32 通道

后续的 Inverted Residual Block（以第一个 block 为例）：
输入：32 通道（低维，bottleneck）
→ 扩展层（1×1 Conv）：32 → 192 通道（expand_ratio=6）
→ 深度卷积：192 → 192 通道
→ ReLU：在 192 通道上
→ 投影层（1×1 Conv）：192 → 16 通道
→ 不加 ReLU
→ 输出：16 通道（低维，bottleneck）
```

V2 把 ReLU 从 bottleneck 层移到了 expansion 层，bottleneck 层不加 ReLU。

### 3.3 MobileNet v3：NAS 搜索 + 注意力

2019 年，Google 发布了 MobileNet v3，核心改进是：**用神经架构搜索（NAS）自动设计网络结构**，并引入了轻量级注意力机制。

**两个版本：**

- MobileNetV3-Large：追求高精度，适合高端手机
- MobileNetV3-Small：追求高速度，适合低端手机

**关键创新：**

1. **NAS 搜索**：不再手动设计网络结构，让算法自动搜索最优配置
2. **SE 注意力的轻量化版**：用 1×1 Conv 代替全连接层，计算量更小
3. **h-swish 激活函数**：ReLU6 的近似，但更平滑，精度更高

```python
# MobileNetV3 的 SE 模块（轻量化版）
class SEModule(nn.Module):
    def __init__(self, channels, reduction=4):
        super().__init__()
        self.squeeze = nn.AdaptiveAvgPool2d(1)
        self.excitation = nn.Sequential(
            nn.Conv2d(channels, channels // reduction, 1),  # 用 Conv 代替 FC
            nn.ReLU(inplace=True),
            nn.Conv2d(channels // reduction, channels, 1),
            nn.Hardsigmoid(inplace=True),  # 用 Hardsigmoid 代替 Sigmoid
        )

    def forward(self, x):
        w = self.excitation(self.squeeze(x))
        return x * w
```

> **一句话记住 MobileNet v3**：NAS 搜索最优结构 + 轻量注意力，精度和速度都更好。

| 模型              | Top-1 准确率 | 延迟（Pixel 1） | 参数量 |
| ----------------- | ------------ | --------------- | ------ |
| MobileNetV2       | 72.0%        | 75ms            | 3.4M   |
| MobileNetV3-Large | 75.2%        | 51ms            | 5.4M   |
| MobileNetV3-Small | 67.5%        | 15ms            | 2.5M   |

### 3.4 MobileNetV4：通用高效架构

2024 年，Google 发布了 MobileNetV4，目标是**在所有移动硬件上都高效运行**（CPU、GPU、NPU、DSP）。

**核心创新：**

1. **Universal Inverted Bottleneck (UIB)**：统一了 Inverted Bottleneck、ConvNext、FFN 等结构，一个模块适配所有硬件
2. **Mobile MQA**：专为移动加速器设计的注意力机制，速度提升 39%
3. **优化的 NAS 配方**：搜索效率更高，找到的结构更优

```python
# MobileNetV4 的 UIB 结构（简化版）
class UIB(nn.Module):
    def __init__(self, in_ch, out_ch, expand_ratio=4, use_att=False):
        super().__init__()
        hidden_ch = in_ch * expand_ratio
        # 升维
        self.expand = nn.Conv2d(in_ch, hidden_ch, 1)
        # 深度卷积
        self.depthwise = nn.Conv2d(hidden_ch, hidden_ch, 3,
                                   padding=1, groups=hidden_ch)
        # 注意力（可选）
        self.attention = MobileMQA(hidden_ch) if use_att else nn.Identity()
        # 降维
        self.project = nn.Conv2d(hidden_ch, out_ch, 1)

    def forward(self, x):
        identity = x
        x = F.relu6(self.expand(x))
        x = self.depthwise(x)
        x = self.attention(x)
        x = self.project(x)
        return x + identity
```

**实验结果：**

| 模型                     | Top-1 准确率 | Pixel 8 EdgeTPU 延迟 |
| ------------------------ | ------------ | -------------------- |
| MobileNetV3-Large        | 75.2%        | 4.8ms                |
| MobileNetV4-Base         | 83.8%        | 4.0ms                |
| MobileNetV4-Hybrid-Large | **87.0%**    | **3.8ms**            |

MobileNetV4 在保持低延迟的同时，精度大幅提升（+12%），是目前移动端的最强选择。

> **一句话记住 MobileNetV4**：一个架构适配所有硬件，精度高、速度快。

## 4. 注意力：特征重标定

前面三个方向（深度、宽度、效率）都在调整卷积层的结构。注意力方向走了另一条路：**让网络自己学会"关注什么"**。

### 4.1 SENet：通道注意力

2017 年，Momenta 提出了 SENet（Squeeze-and-Excitation Network），核心思想是：**给每个通道学习一个权重**。

```
SE Block：
1. Squeeze：全局平均池化 → 1×1×C 的向量
2. Excitation：两个全连接层 → 每个通道的权重（0~1）
3. Scale：每个通道乘上自己的权重
```

直觉：一张猫图中，"有猫耳朵"的通道应该权重高，"背景纹理"的通道应该权重低。SE Block 让网络自动学这个权重。

> **一句话记住 SENet**：让网络自己学"哪个通道重要"。

```python
class SEBlock(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()
        self.squeeze = nn.AdaptiveAvgPool2d(1)  # 全局平均池化
        self.excitation = nn.Sequential(
            nn.Linear(channels, channels // reduction),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels),
            nn.Sigmoid(),  # 输出 0~1 的权重
        )

    def forward(self, x):
        b, c, _, _ = x.shape
        # Squeeze: (B, C, H, W) → (B, C)
        w = self.squeeze(x).view(b, c)
        # Excitation: (B, C) → (B, C)
        w = self.excitation(w).view(b, c, 1, 1)
        # Scale: 每个通道乘上权重
        return x * w
```

### 4.2 CBAM：通道 + 空间注意力

2018 年，Sanghyun Woo 等人提出了 CBAM（Convolutional Block Attention Module），在 SE 的基础上增加了**空间注意力**。

```
CBAM = 通道注意力 + 空间注意力

通道注意力：SE 的做法，学"哪个通道重要"
空间注意力：学"哪个位置重要"

两者串联：先通道注意力，再空间注意力
```

空间注意力的实现：对通道维度做 max pooling 和 avg pooling，拼接后用 7×7 卷积生成空间权重图。

> **一句话记住 CBAM**：SE 学"哪个通道重要"，CBAM 还学"哪个位置重要"。

## 5. 基数：分组并行

2017 年，Xie 等人提出了 ResNeXt，核心思想是：**不加深、不加宽，加"并行路径数"**。

### 5.1 ResNeXt：并行路径数

ResNeXt 的每个残差块内部，有 $C$ 条并行的路径（$C$ 叫 cardinality，基数）。每条路径是相同的变换（3×3 Conv），最后拼接或相加。

```
ResNet-50 的 Block：1 个 3×3 Conv
ResNeXt-50 的 Block：32 个 3×3 Conv（并行）

参数量：32 条路径 × 每条 1/32 通道 = 和 ResNet-50 相同
但精度更高：Top-5 错误率 5.49% vs ResNet-50 的 5.25%（~22M 参数）
```

| 模型               | 参数量 | Top-5 错误率 | 变量               |
| ------------------ | ------ | ------------ | ------------------ |
| ResNet-50          | 25M    | 5.25%        | 深度=50, 宽度=2048 |
| ResNeXt-50 (32×4d) | 25M    | 4.96%        | 深度=50, 基数=32   |

> **一句话记住 ResNeXt**：不加深不加宽，加"并行通道数"，参数量不变精度更高。

## 6. CNN 演进全景图

![CNN 演进全景图](/DeepLearning/Network/06_cnn_timeline.png =560x)

**五条演进路线的定位：**

| 方向   | 核心问题             | 代表网络                                  | 系列位置 |
| ------ | -------------------- | ----------------------------------------- | -------- |
| 深度   | 网络可以做多深       | LeNet → AlexNet → VGG → ResNet → DenseNet | 主线     |
| 宽度   | 一层能看多宽         | Inception v1 → v3 → Xception              | 支线     |
| 效率   | 如何用更少算力做更好 | MobileNet v1/v2 → ShuffleNet              | 支线     |
| 注意力 | 如何让网络"关注重点" | SENet → CBAM                              | 支线     |
| 基数   | 如何用并行路径提升   | ResNeXt                                   | 支线     |

这五条路线不是相互独立的，而是相互借鉴、相互融合。EfficientNet（2019）用 NAS 搜索 depth/width/resolution 的最优配比，就是把"深度"和"宽度"两个维度结合起来考虑。2020 年之后，Vision Transformer（ViT）开始取代 CNN 成为视觉领域的主流架构，但它借鉴了 CNN 的很多思想（如局部性、权值共享）。

> **CNN 的遗产**：它不仅是一种网络结构，更是一种思维方式——用先验知识（局部性、平移不变性）来约束网络结构，让模型在给定计算预算下更高效地学习。
