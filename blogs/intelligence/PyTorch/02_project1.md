---
title: 实战1-离散分类问题
order: 2
author: AOSAI
date: 2025-02-23
category:
  - PyTorch
tag:
  - PyTorch实战
  - 逻辑回归
  - 分类问题
  - 监督学习
---

## 1. 实战练习

手写数字识别项目可以视为机器学习中的“Hello World”，因为它涉及到数据收集、特征提取、模型选择、训练和评估等机器学习中的基本步骤。所以这个项目经常被当作机器学习的入门练习。

该项目的前身是 National Institute of Standards and Technology(美国国家标准技术研究所，简称 NIST)于 1998 年发布的一篇论文。该数据集的论文想要证明在模式识别问题上，基于 CNN 的方法可以取代之前的基于手工特征的方法，所以作者创建了一个手写数字的数据集，以手写数字识别作为例子证明 CNN 在模式识别问题上的优越性。

MNIST 数据集是从 NIST 的两个手写数字数据集：Special Database 3 和 Special Database 1 中分别取出部分图像，并经过一些图像处理后得到的。MNIST 数据集共有 70000 张图像，其中训练集 60000 张，测试集 10000 张。所有图像都是 28×28 的灰度图像，每张图像包含一个手写数字。

```py
dataset_compressed/
├── t10k-images-idx3-ubyte.gz             #测试集图像压缩包(1648877 bytes)
├── t10k-labels-idx1-ubyte.gz             #测试集标签压缩包(4542 bytes)
├── train-images-idx3-ubyte.gz            #训练集图像压缩包(9912422 bytes)
└── train-labels-idx1-ubyte.gz            #训练集标签压缩包(28881 bytes)
```

.gz 是压缩后的文件格式，解压后会变成一种叫做 idx 格式的二进制文件，它将图像和标签都以矩阵的形式储存下来。以训练集的标签数据/图像数据为例子：

- 训练集标签数据（train-labels-idx1-ubyte）

| 偏移量(bytes) | 值类型         | 数值           | 含义           |
| ------------- | -------------- | -------------- | -------------- |
| 0             | 32 位整形      | 0x00000801     | magic number   |
| 4             | 32 位整型      | 60000          | 有效标签的数量 |
| 8             | 8 位无符号整型 | 不定(0~9 之间) | 标签           |
| ...           | ...            | ...            | ...            |
| xxxx          | 8 位无符号整型 | 不定(0~9 之间) | 标签           |

- 训练集图像数据（train-images-idx3-ubyte）

| 偏移量(bytes) | 值类型         | 数值             | 含义              |
| ------------- | -------------- | ---------------- | ----------------- |
| 0             | 32 位整形      | 0x00000803       | magic number      |
| 4             | 32 位整型      | 60000            | 有效图像的数量    |
| 8             | 32 位整型      | 28               | 图像的高(rows)    |
| 12            | 32 位整型      | 28               | 图像的宽(columns) |
| 16            | 8 位无符号整型 | 不定(0~255 之间) | 图像内容          |
| ...           | ...            | ...              | ...               |
| xxxx          | 8 位无符号整型 | 不定(0~255 之间) | 图像内容          |

每个 idx 文件都以 magic number 开头，magic number 是一个 4 个字节，32 位的整数，用于说明该 idx 文件的 data 字段存储的数据类型。

前两个字节都是 0，第三个字节 0x08 表示 data 部分的数值类型都是“8 位无符号整型”，第四个字节 0x01 表示向量的维度。

标签只有一个维度，所以是 0x01，而图像数据，宽和高就占了两个维度，第三个维度就是所有图像叠在一起（想象一踏 A4 纸），每一个值都指向一张图像，所以是 0x03。

### 1.1 数据集的使用

（1）通过 torchvision 下载数据集

```py
import torchvision.transforms as transforms
from torchvision.datasets import MNIST

# define transform of data
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, ), (0.5, ))
])

# download training dataset / testing dataset
train_dataset = MNIST(root='./data', train=True, transform=transform, download=True)
test_dataset = MNIST(root='./data', train=False, transform=transform, download=True)

```

- root 表示存储路径。它会检查文件是否已经存在，存在的话就不会再次下载。
- train 表示数据集属于训练集还是测试集。
- transform 属性对应上方自定义的预处理方式，这段代码中的预处理表示，先将其转换为 tensor 格式的向量，然后进行归一化处理。
- download 属性表示 root 路径下不存在对应文件时，是否进行下载。

（2）通过 scikit-learn 使用数据集

```py
from sklearn.datasets import fetch_openml
import matplotlib.pyplot as plt

mnist = fetch_openml(name='mnist_784', version=1, as_frame=False, cache=True)
X, y = mnist['data'], mnist['target']

# 数据的类型：<class 'numpy.ndarray'>，标签的类型：<class 'numpy.ndarray'>
print(f"数据的类型：{type(X)}，标签的类型：{type(y)}")
# data shape: (70000, 784)
print('data shape:', X.shape)
# label shape: (70000,)
print('label shape:', y.shape)

# show image
image = X[1].reshape(28, 28)
plt.imshow(image, cmap='gray')
plt.title(f"Label:{y[1]}")
plt.show()
```

sklearn 是一个扁平化的数据集，一个图像存为一个向量，图像的大小 28\*28=784，所以命名为 mnist_784。

- as_frame 属性是指：false 返回 numpy 数组；true 返回 pandas DataFrame 和 Series，可以直接通过 pandas 语言进行处理（预处理、分析、可视化等等）。
- cache 属性是指是否缓存到本地。false，不缓存，每次使用从网络下载；true，缓存，优先从缓存路径读取。

结尾是一个解构成图像的操作，使用 numpy 操作对索引为 1 的向量恢复成 28\*28 的图像格式，然后用 matplotlib 显示。

（3）通过官网下载数据集

下载下来的文件和 torchvision 是一样的，但是现在官网的文件好像没有了，所以就不贴链接了，这里仅仅写一下怎么以文件的方式读取数据集。

```py
import numpy as np
import gzip
import struct

# 读取图片文件
def read_images(file_path):
    # 通过 gzip 解压，并读取 ‘rb’ 二进制格式文件
    # 如果已经在本地解压了，去掉 gzip 直接 open 就行了
    with gzip.open(file_path, 'rb') as f:
        # struct.unpack() 用于解压二进制头部文件，格式是固定的前 16 字节
        # 解构的四个类型的数值，在前面表格里已经介绍过了
        magic, num_images, rows, cols = struct.unpack('>IIII', f.read(16))

        # f.read() 会读取文件剩余的所有字节
        # np.frombuffer() 将字节串转换成一个 Numpy 数组
        # np.uint8 是指定数据类型为 无符号8位整数，不是 utf-8！
        image_data = np.frombuffer(f.read(), dtype=np.uint8)

        # 重塑为 (num_images, rows * cols) 的矩阵，每行是一个扁平化的图像
        images = image_data.reshape(num_images, rows * cols)

        # 归一化处理
        images = images / 255.0

        return images

# 读取标签文件
def read_labels(file_path):
    with gzip.open(file_path, 'rb') as f:
        # 文件头是固定的，前 8 字节为文件头信息
        magic, num_labels = struct.unpack('>II', f.read(8))

        # 读取标签数据
        labels = np.frombuffer(f.read(), dtype=np.uint8)
        return labels

# 示例：读取训练集和测试集
train_images = read_images('./data/MNIST/raw/train-images-idx3-ubyte.gz')
train_labels = read_labels('./data/MNIST/raw/train-labels-idx1-ubyte.gz')
test_images = read_images('./data/MNIST/raw/t10k-images-idx3-ubyte.gz')
test_labels = read_labels('./data/MNIST/raw/t10k-labels-idx1-ubyte.gz')

# 打印一些信息，确保数据加载正常
print(f"训练集图像形状：{train_images.shape}, 训练集标签形状：{train_labels.shape}")
print(f"测试集图像形状：{test_images.shape}, 测试集标签形状：{test_labels.shape}")

```

### 1.2 数学题的解法

还记得在初中、高中做数学题的时候，一个问题，可能有很多种解法。但这并不意味着学霸的方法就一定好，学渣的方法就一定差，对于初学者而言，适合自己的，能够解决问题的方法就是好方法。

对于“手写数字识别”这个问题，常见的几种解法有：

1. 归一化指数函数 Softmax（用于多分类任务，是逻辑回归中二分类函数 Sigmoid 的推广）
2. 卷积神经网络（CNN, Convolutional Neural Network）
3. 支持向量机（SVM, Support Vector Machine）
4. K-近邻算法（KNN，K-Nearest Neighbor Classification）
5. 随机森林（Random Forest）

**（1）单层神经网络实现逻辑回归**

逻辑回归狭义上的讲，仅用于二分类问题，通过 Sigmoid 函数将输出映射到 [0, 1] 区间，表示概率。Softmax 是逻辑回归的推广，用于多分类问题，将输出映射为概率分布，所有类别的概率之和为 1。手写数字识别有十个输出值，0 ～ 9，它是一个多分类问题。

这里使用 torchvision 调用 MNIST 数据集，内容和 1.1 小节一样，不再赘述。接下来使用 DataLoader 函数加载数据：

```py
from torch.utils.data import DataLoader

batch_size = 64
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
```

DataLoader 是 PyTorch 中用于加载数据的工具，它可以将数据集分成小批量（batches），并支持多线程加载数据。以下是它的核心功能和用法：

```py
DataLoader(
    dataset,           # 数据集（如 MNIST）
    batch_size=32,     # 每批数据的大小（将数据集分成小批量（batches），方便训练）
    shuffle=False,     # 是否打乱数据（在每个 epoch 开始时打乱数据，避免模型过拟合）
    num_workers=0,     # 加载数据的线程数（通过多线程加速数据加载，减少训练时间）
    drop_last=False    # 是否丢弃最后不足一个 batch 的数据
)
```

接着，通过继承 nn.Module 这个类，自定义逻辑回归的类和方法。torch.nn.Module 是 PyTorch 中所有神经网络模块的基类，它提供标准接口，自动管理参数，支持模型保存和加载等强大功能。

这里还有一个细节需要说明，为什么明明是多分类问题，不写 Sigmoid 函数或 Softmax 函数，反而用了一个 nn.Linear() 线性变换。回忆一下，逻辑回归的基础是线性回归，线性回归 $z=\vec{w}\cdot{x}+\vec{b}$ 作为逻辑回归 e 的指数形式存在。

损失函数是在模型的输出和真实标签之间计算的，通常都是输出层。因为本次没有使用隐藏层，只有输入层和输出层，并且使用的是交叉熵损失函数，它在运算时，会先计算 Softmax，再计算交叉熵。所以，在本次定义神经网络时，我们不需要显式的添加激活函数，仅仅只用 nn.Linear() 做线性变换即可。

```py
import torch.nn as nn

# Logistic model
class LogisticRegression(nn.Module):
    def __init__(self, input, output):
        super(LogisticRegression, self).__init__()
        self.linear = nn.Linear(input, output)

    def forward(self, x):
        return self.linear(x)
```

下一步，设置我们的超参数，实例化模型、损失函数、优化器。众所周知，英伟达系列显卡可以通过 cuda 进行加速运算，苹果 M 芯片系列的 MacBook 可以通过 MPS 进行加速。写这篇 blog 时，我用的 mac，所以是 mps。

```py
import torch

# check if mps can be use
device = torch.device('mps' if (torch.backends.mps.is_available()) else 'cpu')
print(f"Using device: {device}")

# hyper parameters
input = 28 * 28         # 输入的维度，也就是输入层神经元数量
output = 10             # 输出层维度，输出层神经元数量
learning_rate = 0.001   # 学习率
num_epochs = 5         # 训练多少轮

# 初始化 模型、损失函数、优化器
# 将自定义逻辑回归类初始化给 model 对象，然后发送给运算的硬件载体 mps 或 cpu
model = LogisticRegression(input, output).to(device)
# 使用交叉熵作为损失函数
criterion = nn.CrossEntropyLoss()
# Adam优化器
optimizer = optim.Adam(model.parameters(), lr=learning_rate)
```

将训练模块和测试模块封装成函数。我个人觉得这样写挺优雅的，模块化、结构化，方便调用和扩展。

```py
# training function
def train(model, train_loader, criterion, optimizer, device):
    model.train()
    total_loss = 0

    for images, labels in train_loader:
        # images.view() 是 pytorch 的标准方法，用于改变张量的形状
        # 但它并不改变数据本身，会返回一个新的张量，共享原始张量的数据存储
        # 它要求张量的内存布局是连续的，如果不连续，需要先调用 .contiguous()
        # 即 images.contiguous().view()
        images = images.view(-1, 28*28).to(device)
        labels = labels.to(device)

        # 向前传播 forward
        # model(images) = model.forward(images)
        outputs = model(images)
        # 交叉熵损失函数API标准参数：带有梯度信息的输出数据和标签
        loss = criterion(outputs, labels)

        # 反向传播 backward
        optimizer.zero_grad() # 清空梯度
        loss.backward()       # 计算梯度
        optimizer.step()      # 更新参数

        # loss.item() 当前批次的损失值
        total_loss += loss.item()

    # 计算平均损失并返回
    return total_loss / len(train_loader)
```

model 是自定义 LogisticRegression 函数的实例，而该函数继承自 nn.Module，其中的 .train()方法和 .eval()方法用来切换模型的模式，训练模式需要引入随机性和动态调整，评估模式则不需要：

- model.train()为训练模式，会启用 Dropout 和 Batch Normalization 等层的训练行为。Dropout 会随机丢弃一些神经元，Batch Normalization 会使用当前批次的统计量。

- model.eval()为评估模式，禁用 Dropout 和 Batch Normalization 等层的训练行为。Dropout 不会丢弃神经元，Batch Normalization 会使用训练时计算的全局统计量。

```py
# testing function
def test(model, test_loader, device):
    model.eval()
    correct = 0
    total = 0

    # 禁用梯度计算，通常用于推理阶段（如测试和验证），以减少内存消耗并加速计算。
    with torch.no_grad():
        for images, labels in test_loader:
            # images 的形状是 [batch_size, 1, 28, 28]，1 表示单通道（灰度）图像
            # 经过 .view() 扁平化为 [batch_size, 784]
            images = images.view(-1, 28*28).to(device)
            labels = labels.to(device)

            outputs = model(images)
            # torch.max() 找到模型输出中每个样本的最大值（最高评分）及其对应的类别索引。
            # 最大值（最高评分）我们不关心，所以用 _ 忽略，predicted 表示索引。
            # outputs.data 表示模型输出的纯数据部分，形状为 [batch_size, num_classes]
            # 训练函数中使用的 outputs 是一个包含梯度信息的张量
            # 1 表示在第 1 维度上求最大值。
            _, predicted = torch.max(outputs.data, 1)
            # labels.size(0) 返回当前批次的样本数
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    return correct / total
```

最后就是训练函数与测试函数的调用，以及模型参数的保存。首先需要说明几个混淆概念，Epoch、Batch Size 和 Batch（批次）：

- Epoch：1 个 epoch 表示模型遍历整个训练/测试数据集一次。
- Batch Size：每次训练时同时计算的样本数量。
- Batch（批次）：将整个数据集分成若干个小块，每个小块就是一个 batch。就比如训练集 60000 张图像，我设置的 batch_size = 64，Batch = 训练集大小 / batch_size = 937。训练函数中的 loss.item() 当前批次的损失，以及测试函数中的 labels.size(0) 当前批次的样本数，指的就是这个批次。

```py
# training and testing
for epoch in range(num_epochs):
    train_loss = train(model, train_loader, criterion, optimizer, device)
    test_acc = test(model, test_loader, device)
    print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {train_loss:.4f}, Test Accuracy: {test_acc:.4f}")

# save model
torch.save(model.state_dict(), 'mnist_model.pth')
print("model saved to mnist_model.pth")
```

torch.nn.Module 提供了 state_dict() 方法，可以方便地保存模型参数:

```py
torch.save(model.state_dict(), 'model.pth')  # 保存模型
model.load_state_dict(torch.load('model.pth'))  # 加载模型
```

**（2）卷积神经网络**

经过刚才 softmax 的代码案例，我们已经学会了一种构建神经网络的方法。转换成神经网络 CNN，仅需要修改少数几个部分，首先是自定义 CNN 模型：

```py
# 在 softmax 中叫做 LogisticRegression
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        # 输入通道 1，MNIST 是灰度图像，通道数为 1
        # 输出通道 32，卷积核的数量，即提取 32 种特征
        # 卷积核大小 3*3；步长（stride）1，卷积核每次移动 1 像素；
        # padding，表示在图像边缘填充 1 圈 0，防止图像边缘信息学习不充分
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1)
        # 同理，输入 32个低级特征，输出 64个高级特征，其余参数未变
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1)
        # 池化层，降低特征图的尺寸，减少计算量，同时增强特征的鲁棒性
        # 池化核大小 2*2；步长（stride）为 2，表示池化核每次移动 2个像素；不填充像素
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2, padding=0)
        # 全连接层 1，将 3136 维特征映射到 128 维空间，学习特征之间的复杂关系
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        # 全连接层 2，也是输出层，将 128 维特征映射到 10 个类别空间
        self.fc2 = nn.Linear(128, 10)
        # 激活函数，引入非线性，是模型能够学习复杂的模式
        self.relu = nn.ReLU()

    def forward(self, x):
        # 第一层卷积 + ReLU，输出形状 [batch_size, 32, 28, 28]
        x = self.relu(self.conv1(x))
        # 池化，输出形状 [batch_size, 32, 14, 14]
        x = self.pool(x)
        # 第二层卷积 + ReLU，输出形状 [batch_size, 64, 14, 14]
        x = self.relu(self.conv2(x))
        # 池化，输出形状 [batch_size, 64, 7, 7]
        x = self.pool(x)
        # 展平，两层卷积后特征数量为64，两次池化后特征图维度降低为 7*7
        # 因此输出形状展平后变为 [batch_size, 3136（64 * 7 * 7）]
        x = x.view(-1, 64 * 7 * 7)
        x = self.relu(self.fc1(x))      # 全连接层
        x = self.fc2(x)                 # 输出层
        return x
```

为什么设置两层卷积？第一层卷积提取低级特征（如边缘、纹理、线条等），第二层卷积在低级特征的基础上，提取更高级的特征（如形状、结构等）。通过多层卷积，模型可以逐步提取更复杂、更抽象的特征，从而提高分类性能。如果不记得，请翻阅《机器学习》中《2-1 神经网络初探》的 4.3 小节。

Conv2d 和 MaxPool2d 的使用方法已经在注释中说明了，相同类型的处理函数还有 1d 和 3d：

- Conv1d 和 MaxPool1d：用于 1D（1 维）数据，如时间序列、文本
- Conv2d 和 MaxPool2d：用于 2D（2 维）数据，如图像
- Conv3d 和 MaxPool3d：用于 3D（3 维）数据，如视频、医学图像

其余就是一些小细节的变动：

```py
# 实例化模型的名称需要更名为 CNN
model = CNN().to(device)

# 训练函数和测试函数中不需要对数据扁平化了，直接发送给 device
images, labels = images.to(device), labels.to(device)

# 保存模型的文件名需要修改一下
torch.save(model.state_dict(), 'mnist_cnn.pth')
```

（3）SoftMax 与 CNN 的结果对比

除了准确度，运算时间我们也大概的计算一下，导入 time 模块，在 epoch 循环训练的前后加入时间记录代码：

```py
import time

start_time = time.time()
# training and testing
# ......
end_time = time.time() - start_time
print(f"xxx 模型5个Epoch的运算时间: {softmax_time:.6f} 秒")
```

从结果可以看到出，卷积神经网络对于手写数字识别问题，准确度要比 SoftMax 高很多，99%的测试正确率。我们的运算时间是 5 轮训练加测试的时间，这个看不出什么。在实际的应用中，只会应用推理而不是训练，只要测试时间和 Softmax 差不多，应用时必定首选 CNN。有兴趣可以自己重写 time 计算，对比一下单次推理时间。

```py
# SoftMax
Epoch [1/5], Loss: 0.4670, Test Accuracy: 0.9108
Epoch [2/5], Loss: 0.3269, Test Accuracy: 0.9162
Epoch [3/5], Loss: 0.3106, Test Accuracy: 0.9180
Epoch [4/5], Loss: 0.3029, Test Accuracy: 0.9185
Epoch [5/5], Loss: 0.2939, Test Accuracy: 0.9187
Softmax 模型5个Epoch的运算时间: 18.785970 秒

# CNN
Epoch [1/5], Loss: 0.1567, Test Accuracy: 0.9859
Epoch [2/5], Loss: 0.0446, Test Accuracy: 0.9875
Epoch [3/5], Loss: 0.0314, Test Accuracy: 0.9864
Epoch [4/5], Loss: 0.0228, Test Accuracy: 0.9871
Epoch [5/5], Loss: 0.0172, Test Accuracy: 0.9905
CNN 模型5个Epoch的运算时间: 61.244848 秒
```

### 1.3 补充 - 其余三种算法

支持向量机（SVM）、K 近邻算法（KNN）、随机森林这三种算法的实现相对简单，并且都用的 scikit-learn 这个库，所以就放在一起写了。

```py
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import time

# 加载完整的 MNIST 数据集
mnist = fetch_openml('mnist_784', version=1, cache=True)
X = mnist.data  # 特征
y = mnist.target.astype(int)  # 标签

# random_state 随机种子，控制着数据集划分的随机性，每次拆分都按这个拆分，保证了结果的可重复性
X_train, X_test, y_train, y_test = train_test_split(
    X, y, train_size=0.8, test_size=0.2, random_state=42)

# SVM前置工作，标准化数据，和使用 PCA 降维
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
pca = PCA(n_components=100)
X_train_pca = pca.fit_transform(X_train_scaled)
X_test_pca = pca.transform(X_test_scaled)

# SVM
svm_model = SVC(kernel='linear')
start_time = time.time()
svm_model.fit(X_train_pca, y_train)
train_time = time.time() - start_time
y_pred = svm_model.predict(X_test_pca)
accuracy = accuracy_score(y_test, y_pred)
print(f"SVM 准确率: {accuracy:.4f}, 训练时间: {train_time:.4f} 秒")

# KNN
# n_neighbors 表示选择三个最邻近进行评分； n_jobs = -1 表示使用所有 CPU 核心
knn_model = KNeighborsClassifier(n_neighbors=3, n_jobs=-1)
start_time = time.time()
knn_model.fit(X_train, y_train)
train_time = time.time() - start_time
y_pred = knn_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"KNN 准确率: {accuracy:.4f}, 训练时间: {train_time:.4f} 秒")

# 随机森林
# n_estimators = 10：使用 10 棵树
rf_model = RandomForestClassifier(n_estimators=10, n_jobs=-1, random_state=42)
start_time = time.time()
rf_model.fit(X_train, y_train)
train_time = time.time() - start_time
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"随机森林 准确率: {accuracy:.4f}, 训练时间: {train_time:.4f} 秒")
```

训练的时候 SVM 模块遇到了点问题，因为 sklearn 使用的是扁平化数据，一共 28\*28 = 784 维，并且它是使用 CPU 进行计算的。一方面数据量大了之后，特征计算成指数级增长，另一个方面就是运算慢，我训练集数据降到 30% 才能正常运行。为了使用全部数据，我采用了 PCA 降维的方法处理。

```py
SVM 准确率: 0.9349, 训练时间: 45.4076 秒
KNN 准确率: 0.9713, 训练时间: 0.0592 秒
随机森林准确率: 0.9458, 训练时间: 0.5464 秒
```

可以看到 KNN 和随机森林的训练时间非常短，准确率虽然比不过 CNN，但是也还不错。

sklearn 中还有一个 8\*8 的小型手写数字识别的数据集，包含 1797 个数据，每张图像展平后是 64 维，这个数据集 SVM 就可以不进行 PCA 降维。 8\*8 图像虽然分辨率较低，但仍然有一些应用价值，比如:

- 快速原型开发：用于验证模型的基本功能；或者在计算资源有限的环境中测试模型。
- 嵌入式设备：单片机、嵌入式摄像头……
- 数据增强：作为高分辨率图像的缩略图，用于数据增强或快速筛选。

```py
# 加载 8*8 的小型 MNIST 数据集
digits = datasets.load_digits()
X = digits.data  # 特征
y = digits.target  # 标签
```

## 2. 实战测验

实践是检验真理的唯一标准。

### 2.1 AI 模型练习平台

AI 模型的练习和比赛，同样也有类似 Leetcode（算法） 或 CTF（网络攻防） 这种专门的平台。从使用人数、科研应用、就业机会三个方面，我挑选了 5 个最常用的机器学习平台。

1. Kaggle：全球最大的机器学习竞赛平台，提供各种真实数据集，适用于各个领域的科研实践。需要数据科学和机器学习公司在招聘时，都会关注求职者在 Kaggle 上的成绩。

2. DrivenData：相较于 Kaggle 较小，主要集中在解决社会问题，如健康、教育等领域。

3. AI Challenger：在国内较为出名，尤其是在中文 NLP 和语音识别等方面有较强的影响力。国内公司（百度、阿里、腾讯等）会比较关注优胜者，相关比赛成绩有助于就业。

4. Zindi：用户社群相对活跃，特别是在非洲。Zindi 提供与全球社会和企业相关的多种挑战，特别适合需要解决大规模数据问题的科研人员。

5. Hackerearth：使用人数相对较多，尤其是在印度等地有广泛的影响力。提供了多种 机器学习 和 数据科学 相关的挑战，适合研究人员提升实际应用能力。

### 2.2 经典分类问题

**1. 二分类问题：肿瘤分类（Breast Cancer Dataset）**

目标：判断乳腺肿瘤是良性还是恶性。数据来源：[UCI ML Repository - Breast Cancer Wisconsin (Diagnostic)](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic)

该数据集包含 30 个特征，如肿瘤的大小、形状、纹理等，用于判断肿瘤的类型。属于医疗领域（医学图像处理）的经典案例。难度指数 2 颗星。

**2. 二分类问题：泰坦尼克号幸存者预测**

目标：构建一个预测模型，回答“什么样的人更有可能生存”这个问题。数据来源：[Kaggle - Titanic](https://www.kaggle.com/c/titanic)

该问题是 Kaggle 中的一个长期公开的挑战练习题：虽然生存下来有一些运气因素，但似乎某些群体比其他人更有可能生存下来。该数据集包含各种关于乘客的特征，比如年龄、性别、票价、船舱等信息。难度指数 3 颗星。

**3. 多分类问题：鸢尾花分类（Iris Dataset）**

目标：区分三种不同类型的鸢尾花（Setosa、Versicolor 和 Virginica）。数据来源：[UCI ML Repository - Iris](https://archive.ics.uci.edu/dataset/53/iris)。该数据集包含四个特征，比手写数字识别更适合多分类问题的入门。难度指数 1 颗星。

**4. 多分类问题：猫狗图像区分（Dogs vs Cats）**

简单来看，是个二分问题，区分猫和狗；复杂来看，可以扩展到多分类问题，区分猫和狗，并且区分猫的品种和狗的品种。适合用卷积神经网络等深度学习模型来练手。

数据来源：[Kaggle - Dogs vs. Cats](https://www.kaggle.com/c/dogs-vs-cats)。难度指数 3 颗星。前面的链接是比赛链接，该比赛已经结束且并未公开，但是可以从 Kaggle 的数据集仓库中找到相关数据集：[Kaggle - Cat and Dog](https://www.kaggle.com/c/dogs-vs-cats)。

**5. 多标签分类问题：情感分析（Sentiment Analysis）**

情感分析是一个典型的“多标签分类”问题，通常对文本进行情感分类，如正面、负面、中性等标签。数据集包含一系列社交媒体评论、产品评价等文本，每个文本可能有多个情感标签（例如“正面”和“中性”）。

数据来源：[Kaggle - Sentiment140 dataset with 1.6 million tweets](https://www.kaggle.com/datasets/kazanova/sentiment140)。难度指数 4 颗星。

### 2.3 参考答案

我并不知道我写的是否就是当前最佳的解决方案，也许有比我更好的方法，希望各位跑完自己的代码，和我的代码以及网络博客中大佬们的代码，相互做做比较。取其精华，去其糟粕。

| 任务       | SVM          | KNN      | Random Forest | Softmax      | CNN          |
| ---------- | ------------ | -------- | ------------- | ------------ | ------------ |
| 肿瘤分类   | ==&#10003;== | &#10003; | ==&#10003;==  | &#10007;     | &#10007;     |
| 鸢尾花分类 | &#10003;     | &#10003; | &#10003;      | ==&#10003;== | &#10007;     |
| 幸存者预测 | &#10003;     | &#10003; | ==&#10003;==  | &#10007;     | &#10007;     |
| 猫狗分类   | &#10007;     | &#10007; | &#10007;      | &#10003;     | ==&#10003;== |
| 情感分析   | &#10003;     | &#10003; | &#10003;      | ==&#10003;== | ==&#10003;== |

❌ 号表示不合适，✅ 号表示可以做，标黄的 ✅ 号表示推荐方法。请翻阅下一章《实战 1-参考答案》
