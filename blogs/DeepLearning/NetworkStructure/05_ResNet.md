---
title: ResNet：残差连接与超深网络
date: 2026/05/24
categories:
  - 网络结构
tags:
  - 神经网络
  - CNN
  - ResNet
---

## 1. 退化问题：更深反而更差

VGG 证明了 19 层可行。但如果再往上堆呢？2015 年，研究者把 VGG 风格的 plain 网络推到 34 层时，遇到了一个反直觉的现象：**34 层的训练误差，比 18 层更高**。

这不是过拟合（过拟合是指，训练集的误差会很小，而测试集的误差会很大），但这里两者都很差。这个现象被称为**退化问题**（Degradation Problem）。

![Fig.1 退化问题：更深网络的训练误差反而更高](/DeepLearning/Network/05_resnet_01.png =560x)

Kaiming He 在论文里写了一段非常优雅的推理：

> 如果一个 18 层网络就能做好的事，34 层网络至少应该做到一样好。多出来的 16 层只需要"原封不动地传下去"（学恒等映射）就行了。

> 但神经网络很难通过堆叠非线性层来学恒等映射：每一层 Conv + ReLU 都在改变信号，要让它们"什么都不做"反而比让它们"做点什么"更难。

所以，ResNet 是为了解决 **“退化问题”** 而出现的，VGG 把结构做规律了，ResNet 把结构做稳了。

> **设计哲学**：如果你学不到更好的映射，那至少保证不比浅层差。用一条"捷径"把输入直接送到后面。

## 2. 残差连接（skip connection）

### 2.1 从 H(x) 到 F(x) + x

**残差连接** 通常写作 **skip/shortcut connection**，都是指绕过中间层把输入直接加到输出的那根"捷径"。用一个具体的数字例子来理解残差：

假设输入 $x = 10$，期望输出是 $12$（即目标映射 $H(x) = 12$）。

- **传统层直接学 H(x)**：层要把 10 变成 12。层学的是"怎么做 +2 这件事"。
- **残差层学 F(x) = H(x) − x**：层只需要学 2（$F(x) = 12 - 10 = 2$），然后 shortcut 把输入 10 加回来：$2 + 10 = 12$。结果一样，但层学的东西更简单。

再看另一种情况：期望输出就是 10（$H(x) = x$，什么都不用变）。

- **传统层**：层要把 10 变成 10。听起来不难，但 Conv + BN + ReLU 都在改变信号，让它们"保持原样"非常困难，因为每一层都在做非线性变换。
- **残差层**：层只需要学 0（$F(x) = 0$），然后 shortcut 把 10 加回来：$0 + 10 = 10$。让权重层的输出接近 0 非常容易（初始化时权重就是接近 0 的小数）。

换成公式：

$$
y = F(x, \{W_i\}) + x
$$

**一句话记住**：残差连接让层只需要学"改进"的部分。学不出来就输出 0，输入原封不动地传过去。传统层是"你必须学"，残差层是"学不出来就算了，用原来的"。

### 2.2 两种残差块

ResNet 根据网络深度定义了两种残差块：

**Basic Block**（ResNet-18/34 使用）：两层 3×3 Conv，每层后面跟 BN + [ReLU](../ActivationFunction/02_ReLU.md)。shortcut 直接跳过两层。

```
x
↓
Conv 3×3 → BN → ReLU
↓
Conv 3×3 → BN
↓
+ x (shortcut) → ReLU → 输出
```

**Bottleneck Block**（ResNet-50/101/152 使用）：三层设计。中间的 3×3 负责特征提取，两边的 1×1 分别负责降维和升维。

```
x
↓
Conv 1×1 → BN → ReLU     (降维到 C/4)
↓
Conv 3×3 → BN → ReLU     (特征提取)
↓
Conv 1×1 → BN            (升维到 C)
↓
+ x (shortcut) → ReLU → 输出
```

为什么深网络用 Bottleneck？如果 ResNet-152 用 Basic Block，参数量会爆炸。每个 stage 通道数到 512 甚至 1024 时，两层 3×3 Conv 的参数量是 $2 \times 3^2 \times C^2$。Bottleneck 先用 1×1 把 256 维降到 64 维再做 3×3，再升回来，升降维都是 1×1 Conv（计算量极小）。

![Fig.2 两种残差块结构对比](/DeepLearning/Network/05_resnet_02.png =660x)

### 2.3 为什么残差有效

核心原因只有一个：**梯度短路**。

反向传播时，损失 $L$ 对残差块输入 $x$ 的梯度为：

$$
\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y} \cdot \left(1 + \frac{\partial F}{\partial x}\right)
$$

梯度可以沿着 shortcut（$\frac{\partial L}{\partial y}$）直接传到浅层，不受中间层 $\frac{\partial F}{\partial x}$ 衰减的影响。即便 $\frac{\partial F}{\partial x}$ 非常小，还有 **1** 这个常数项保持梯度不消失。

这就是 ResNet 能训到 152 层而 plain 网络在 34 层就开始退化的原因：短期带来了梯度，残差块只需要学"改进"的部分。

## 3. 信息流动

### 3.1 配置一览

ResNet 有 5 个主要版本，核心区别只有两个：用什么 Block、每段叠几次。

| 版本       | Block 类型 | 总层数（权重层） | 参数量  | 对比        |
| ---------- | ---------- | ---------------- | ------- | ----------- |
| ResNet-18  | Basic      | 18               | 11M     |             |
| ResNet-34  | Basic      | 34               | 21M     | VGG16: 138M |
| ResNet-50  | Bottleneck | 50               | 25M     |             |
| ResNet-101 | Bottleneck | 101              | 44M     |             |
| ResNet-152 | Bottleneck | 152              | **60M** | VGG19: 144M |

ResNet-152 比 VGG-19 深 **8 倍**，参数却少了 60%。这就是残差连接 + Bottleneck 的效率。

> 每个 stage 的第一个 block 遇到通道变化或下采样时，shortcut 需要用 1×1 Conv + stride=2 做投影，使形状匹配。类似 VGG 的 “感受野的递推计算”。

### 3.2 ResNet-50 的数据流

ResNet 没有 VGG 那么多 MaxPool。除了 Conv1 后面的一个 MaxPool，所有下采样都靠 stride=2 的卷积。

Conv1（7×7, stride=2）先把 224×224 压到 112×112，经过 BN + ReLU 激活后，再接一个 MaxPool（3×3, stride=2）压到 56×56。两层下采样中间插了一层非线性，让 Conv1 的特征经过 ReLU 后再做最大值池化，信息利用更充分。

```
输入 224×224×3
│
├─ Conv1: 7×7, 64, stride=2 → BN → ReLU    → 112×112×64
├─ MaxPool: 3×3, stride=2                  → 56×56×64
│
├─ Stage 1: [Bottleneck 256] × 3           → 56×56×256
│  (第一个 block 的 shortcut 用 1×1 Conv 对齐通道)
│
├─ Stage 2: [Bottleneck 512] × 4           → 28×28×512
│  (第一个 block stride=2 下采样，shortcut 也 stride=2)
│
├─ Stage 3: [Bottleneck 1024] × 6          → 14×14×1024
│  (第一个 block stride=2 下采样)
│
├─ Stage 4: [Bottleneck 2048] × 3          → 7×7×2048
│  (第一个 block stride=2 下采样)
│
├─ Global Average Pooling (GAP, 7×7 → 1×1)
└─ FC 1000
```

注意一个关键差异：VGG 用 MaxPool 下采样，ResNet 用 stride=2 的卷积下采样。卷积有可学参数，下采样同时也在提取特征。

这里还有一个值得注意的设计：前期的 3×3 MaxPool（Conv1 之后）和最后的 GAP 虽然都叫"池化"，但目的完全不同。

- MaxPool 做**空间压缩**：7×7 窗口取最大值，保留最强响应，丢掉空间冗余。
- GAP 做**通道聚合**：每个通道的 7×7 特征图取均值，转成一个语义描述子，然后直接接 FC 分类。前者保最强，后者看整体。

如果最后不用 GAP 而是 Flatten + FC（VGG 的做法），7×7×2048 = 100K 个特征接入 FC，参数量是 100K×1000 = 100M——VGG 的全连接黑洞再现。GAP 用 2048 个均值概括全图，参数量降到几乎可忽略。

![Fig.3 ResNet-50：Conv1 → 4 个 Bottleneck Stage → GAP → FC](/DeepLearning/Network/05_resnet_03.png =800x)

### 3.3 PyTorch代码

ResNet 的代码比 VGG 多了一层抽象，因为需要处理两种 Block 的切换和 shortcut 投影。但整体思路仍然清晰：定义块、定义 stage、定义网络。

:::: code-group
::: code-group-item ResNet 通用骨架

```py
import torch.nn as nn

class ResNet(nn.Module):
    def __init__(self, block, layers, num_classes=1000):
        super().__init__()
        self.in_channels = 64

        # Conv1: 7×7 大核下采样到 112
        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 64, 7, stride=2, padding=3),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
        )
        self.maxpool = nn.MaxPool2d(3, stride=2, padding=1)

        # 4 个 stage，每个 stage 的通道数翻倍
        self.layer1 = self._make_layer(block, 64,  layers[0], stride=1)
        self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
        self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
        self.layer4 = self._make_layer(block, 512, layers[3], stride=2)

        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(512 * block.expansion, num_classes)

    def _make_layer(self, block, out_channels, num_blocks, stride):
        downsample = None
        if stride != 1 or self.in_channels != out_channels * block.expansion:
            downsample = nn.Sequential(
                nn.Conv2d(self.in_channels, out_channels * block.expansion,
                          kernel_size=1, stride=stride),
                nn.BatchNorm2d(out_channels * block.expansion),
            )

        layers = []
        layers.append(block(self.in_channels, out_channels, stride, downsample))
        self.in_channels = out_channels * block.expansion
        for _ in range(1, num_blocks):
            layers.append(block(self.in_channels, out_channels))

        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.conv1(x)
        x = self.maxpool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


# 5 个构造函数
def resnet18():  return ResNet(BasicBlock, [2, 2, 2, 2])
def resnet34():  return ResNet(BasicBlock, [3, 4, 6, 3])
def resnet50():  return ResNet(Bottleneck, [3, 4, 6, 3])
def resnet101(): return ResNet(Bottleneck, [3, 4, 23, 3])
def resnet152(): return ResNet(Bottleneck, [3, 8, 36, 3])
```

:::
::: code-group-item BasicBlock（ResNet-18/34）

```py
class BasicBlock(nn.Module):
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1, downsample=None):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3,
                               stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3,
                               stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.downsample = downsample

    def forward(self, x):
        identity = x
        if self.downsample is not None:
            identity = self.downsample(x)

        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += identity
        out = self.relu(out)
        return out
```

:::
::: code-group-item Bottleneck（ResNet-50/101/152）

```py
class Bottleneck(nn.Module):
    expansion = 4

    def __init__(self, in_channels, out_channels, stride=1, downsample=None):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 1,
                               stride=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3,
                               stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.conv3 = nn.Conv2d(out_channels, out_channels * 4, 1,
                               stride=1, bias=False)
        self.bn3 = nn.BatchNorm2d(out_channels * 4)
        self.relu = nn.ReLU(inplace=True)
        self.downsample = downsample

    def forward(self, x):
        identity = x
        if self.downsample is not None:
            identity = self.downsample(x)

        out = self.relu(self.bn1(self.conv1(x)))
        out = self.relu(self.bn2(self.conv2(out)))
        out = self.bn3(self.conv3(out))
        out += identity
        out = self.relu(out)
        return out
```

:::
::::

骨架代码中 `_make_layer` 体现了 ResNet 的设计精髓：遇到 stride≠1 或通道不匹配时，自动插入投影 shortcut 对齐形状。后续的 block 复用同一通道数，直接 identity 相加。

## 4. 知识扩展

### 4.1 为什么 BN 是残差的最佳搭档

ResNet 的每一个卷积后面都跟了 BN + ReLU。残差连接解决的是"梯度流向"问题：提供一条短路让梯度直达浅层。但光有短路不够，如果深层的激活值数值本身就不稳定（ReLU 无上界，层越深激活值可能越大），BN 不稳定的信号即使通过短路传到浅层也没有意义。

BN 解决了第二个问题：**每层输入的归一化**。

$$
\hat{x} = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} \times \gamma + \beta
$$

BN 把每个 mini-batch 的激活值拉到均值为 0、方差为 1 的分布，再用可学参数 $\gamma$ 和 $\beta$ 恢复表达能力。这样一来，无论网络多深，每一层看到的输入分布都在可控范围内。

**残差提供高速路，BN 保持路面平整**——两者结合，152 层才能稳定训练。

### 4.2 Pre-activation ResNet（v2）

2016 年，Kaiming He 对 ResNet 提出了一项改进：把 BN + ReLU 移到 Conv 的**前面**。

```
v1: Conv → BN → ReLU → Conv → BN → + → ReLU
v2: BN → ReLU → Conv → BN → ReLU → Conv → +
```

这个改动看似微小，但有两个好处：

1. **梯度流动更顺畅**：因为 identity 分支上不再有激活函数（v1 的最后一个 ReLU 在 shortcut 合并之后，实际上阻挡了梯度）
2. **正则化效果更好**：Pre-activation 的 BN 让输入分布更稳定

现在大多数 PyTorch 官方实现和第三方库都默认使用 Pre-activation 模式。但为了和原论文保持一致，本文的代码仍然使用 v1 模式。

### 4.3 ResNet 的遗产

ResNet 是 CNN 结构演进的里程碑。VGG 把结构做规律了，ResNet 把结构做稳了。2015 年之后，**深度不再是结构设计的瓶颈**——残差连接让任意深度的网络都能稳定训练。后续的网络（DenseNet、ResNeXt 等）不再纠结于"能不能训到 100 层"，而是专注在"怎么用更少的参数量做得更好"。

ResNet 在 ImageNet 上的表现：152 层的 top-5 错误率 3.57%，**第一次超越了人类分类水平**（约 5%）。这不是算法的终点，但确实是一个分水岭——在那之后，计算机在"看图识物"这件事上已经比人更可靠了。
