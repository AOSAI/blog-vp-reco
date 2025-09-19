---
title: PyTorch基础知识
order: 1
author: AOSAI
date: 2024-09-13
category:
  - PyTorch
tag:
  - PyTorch基础
---

## 1. Tensor（张量）

张量是一种特殊的数据结构，不管是 PyTorch 还是 Tensorflow 都是使用张量进行运算，因为它可以在 GPU 或其它硬件加速器上使用，并且针对自动微分进行了优化。

它有点类似 Numpy 的 ndarray，并且很多张量 API 的使用方式都是相同的，如果你熟悉 Numpy，你会发现 torch 使用起来也会非常顺手，而且它两是可以相互转化的。

### 1.1 初始化

PyTorch 创建张量的 API 很多，这里只写一些比较常见的方式，想要了解的更详细，请看相关链接。首先，导入 torch 和 numpy：

```py
import torch
import numpy as np
```

1. **直接从 Python 数据初始化**，数据类型 torch 会自动推断。
2. **从 Numpy 数组初始化**，Numpy 的 ndarray 可以和 PyTorch 的 Tensor 相互转化。
3. **从另一个张量初始化**，除非显示覆盖，否则新张量将保留参数张量的属性（形状、数据类型）。

```py
# 初始化一个名叫 data 的 python 列表，并转化为张量形式
data = [[1, 2],[3, 4]]
x_data = torch.tensor(data)

# 将 data 转化为 ndarray，再将 ndarray 转化为 tensor
np_array = np.array(data)
x_np = torch.from_numpy(np_array)

# 以 x_data 的形式，创建一个全为 1 的张量
x_ones = torch.ones_like(x_data)

# 以 x_data 的形式，创建一个由随机数组成的张量
x_rand = torch.rand_like(x_data, dtype=torch.float)
print(f"Random Tensor: \n {x_rand} \n")
```

4. **使用随机值或常量值等**，shape 是一个张量维度的元组，也就是上面所说的张量的形状属性。

```py
# 定义一个二维的，2行3列 的张量形状
shape = (2,3,)

# 以这个张量形状，别分创建由 随机数、全为1、全为0 组成的张量
rand_tensor = torch.rand(shape)
ones_tensor = torch.ones(shape, dtype=torch.long)
zeros_tensor = torch.zeros(shape, dtype=torch.float32)

print(f"Random Tensor: \n {rand_tensor} \n")
```

**参考文献&相关链接：**

1. [《PyTorch 中文文档 - 张量创建相关 API》](https://pytorch.ac.cn/docs/stable/torch.html#creation-ops)
2. [《PyTorch 中文文档 - 张量简介》](https://pytorch.ac.cn/tutorials/beginner/basics/tensorqs_tutorial.html)

### 1.2 维度及属性

- 0 维：scalar（数值、标量）
- 1 维：vector（向量、一维向量）
- 2 维：matrix（矩阵、二维向量）
- n 维：n-dimensional tensor（n 维向量）

```py
x0 = tensor(42.)
x1 = tensor([1.1, 1.2, 1.3])
x2 = tensor([[1.1, 1.2, 1.3], [2.1, 2.2, 2.3]])


```

张量的属性有很多，只列举一部分。但是支持初始化时传参的，仅有前三个：

1. init：仅在 init 初始化构造器中使用，支持传入 initializer 的子类
2. 形状（shape）：是一个由数字组成的元组（tuple）
3. 数据类型（dtype）：double、float、long、boolean 等

- 转置（T）：线性代数里有讲
- 单个元素大小（itemsize）：整数，代表每一个元素占用的字节数
- 总的字节数量（nbytes）：整数，代表 Tensor 占用的总字节数
- 维度数量（ndim）：整数，代表 Tensor 的秩，=len(tensor.shape)
- 元素个数（size）：整数，表示一共有多少个元素
- 每一维度步长（strides）：元组（tuple），每一个维度所需要的字节数
- 储存张量的设备（device）：cpu、gpu

```py
x1.ndim   # 1
x1.shape  # (1, )
x2.T      # [[1.1, 2.1], [1.2, 2.2], [1.3, 2.3]]
```

### 1.3 张量上的操作

张量上的操作超过了 100 种，包括算数、线性代数、矩阵操作、采样等等。这些操作都可以运行在 GPU 上，通常比 CPU 上的速度更快。

但是默认情况下张量是在 CPU 上创建的，我们需要通过 .to 的方法将张量显式的转移到 GPU 上去。

```py
# 如果 GPU 可用
if torch.cuda.is_availabel():
  # 将数据发送给 GPU，并重新赋值
  tensor = tensor.to("cuda")

# 也可以通过 device() 指定设备
device = torch.device("cpu")

# 如果 GPU 可用选择 GPU，否则选择 CPU
device = torch.device("cuda" if torch.cuda.is_availabel() else "cpu")
tensor = tensor.to(device)
```

**索引和切片操作**，与 Numpy、Python 并无不同：

```py
tensor = torch.ones(4, 4)
print(f"First row: {tensor[0]}")
print(f"First column: {tensor[:, 0]}")
print(f"Last column: {tensor[..., -1]}")
tensor[:,1] = 0
print(tensor)
```

**张量连接操作**，可以使用 torch.cat 和 torch.stack 对张量进行连接：

```py
tensor = torch.ones(4, 4)
print(tensor)
t1 = torch.cat([tensor, tensor, tensor], dim=1)
print(t1)
```

**单元素张量（数值）**，比如你做了求和操作，可以使用 item() 函数将其从张量数据转化为 Python 数据：

```py
tensor = torch.ones(4, 4)
agg = tensor.sum()
agg_item = agg.item()
print(agg_item, type(agg_item))
```

**参考文献&相关链接：**

1. [《PyTorch 中文文档 - 张量操作及运算 API》](https://pytorch.ac.cn/docs/stable/torch.html#indexing-slicing-joining-mutating-ops)
2. [《Pytorch 指定设备》](https://blog.csdn.net/Ethan_Rich/article/details/134799695)
3. [《PyTorch 中文文档 - 张量上的操作》](https://pytorch.ac.cn/tutorials/beginner/basics/tensorqs_tutorial.html#operations-on-tensors)

### 1.4 数学运算

Tensor 里简单的运算，比如加减乘除、取余（%）、整除（//），可以使用 Python 中的运算符，也可以使用封装好的运算函数。

**逐点运算**：这些基本运算都是对数值的运算，放在 1 维以上的维度中，就是相同位置元素之间的运算，所以两个张量的形状必须一样。

```py
x = torch.ones(5 ,3)
y = torch.ones(5, 3)

z1 = x + y
z2 = x - y
z3 = x * y
z4 = x / y
print(x, "\n", y, "\n", z1, "\n", z2, "\n", z3, "\n", z4)

m1 = torch.add(x, y)
m2 = torch.sub(x, y)
m3 = torch.mul(x, y)
m4 = torch.div(x, y)
print(m1, "\n", m2, "\n", m3, "\n", m4)
```

**矩阵运算**：在线性代数中，最常用的就是矩阵（向量）的乘法、转置、求逆等操作：

```py
a = torch.tensor([1.,2.])   # 向量默认都是竖向量
b = torch.tensor([2.,3.]).view(1,2)   # 通过 view 变换成横向量

# 二维矩阵中的矩阵乘法有这 3 种形式
print(torch.mm(a, b))
print(torch.matmul(a, b))
print(a @ b)

# 假如参与运算的是一个多维张量，那么只有torch.matmul()可以使用
# 并且在多维张量中，参与矩阵运算的只有后两个维度，前面的维度就像是索引一样
a = torch.rand((1,2,64,32))
b = torch.rand((1,2,32,64))
print(torch.matmul(a, b).shape)
>>> torch.Size([1, 2, 64, 64])
```

**参考文献&相关链接：**

1. [《PyTorch 中文文档 - 数学运算 API》](https://pytorch.ac.cn/docs/stable/torch.html#math-operations)
2. [《PyTorch 中的常见运算》](https://blog.csdn.net/qq_40728667/article/details/134013899)

### 1.5 与 Numpy 的桥梁

**torch 张量变换为 Numpy 数组：**

```py
t = torch.ones(5)
n = t.numpy()
print(f"t: {t}\nn: {n}")

# 此时如果操作张量 t，numpy 数组同样也会变化
t.add_(1)
print(f"t: {t}\nn: {n}")
```

**Numpy 数组变换为 torch 张量：**

```py
n = np.ones(5)
t = torch.from_numpy(n)
print(f"n: {n}\nt: {t}")

# 此时如果操作 numpy 数组，张量 t 同样也会变化
np.add(n, 1, out=n)
print(f"n: {n}\nt: {t}")
```

## 2. PyTorch 常用封装

这里列举了一些，做模型训练时经常会用到的函数，或者说 API。仅仅只是介绍一下，有个印象，具体的用法和实例我会在每一个部分都添加几个比较易懂的博文。

### 2.1 数据加载器（数据集）

处理数据样本的代码可能会变得混乱且难以维护，理想的情况下，我们希望数据集代码与模型训练代码分离开来，让其可以方便的模块化、以及提高可读性。

所以 PyTorch 给我们提供了两个处理数据集的 API：

- torch.utils.data.Dataset：用于处理单个训练样本，读取数据特征、size、标签等，并且包括数据转换等；

- torch.utils.data.DataLoader：DataLoader 在 Dataset 周围重载一个可迭代对象，以便轻松访问样本。

**参考文献&相关链接：**

1. [Dataset 与 DataLoader 使用、构建自定义数据集](https://blog.csdn.net/weixin_47748259/article/details/135611161)
2. [PyTorch 中文文档 - 数据集 & 数据加载器](https://pytorch.ac.cn/tutorials/beginner/basics/data_tutorial.html)

### 2.2 数据变换

一般情况下，预加载的数据集或自己构造的数据集并不能直接用于训练机器学习算法，为了将其转换为训练模型所需的最终形式，我们可以使用 torchvision.transforms 对数据进行处理，以使其适合训练。

从包名我们就可以看出来，这是一个专门为了计算机视觉（图像）处理而写的 API，不做 CV 的人可以跳过。

**参考文献&相关链接：**

1. [Pytorch(三)：数据变换 Transforms](https://blog.csdn.net/weixin_41936775/article/details/117160981)
2. [PyTorch 中文文档 - 变换](https://pytorch.ac.cn/tutorials/beginner/basics/transforms_tutorial.html)

### 2.3 神经网络模型构建

怎么说呢，就是一些简单的机器学习的问题，比如线性回归、逻辑回归等，都可以使用神经网络的形式去进行解决，并且实现层面也比较简单，所以推荐直接从神经网络开始上手。如果有原理什么不懂的，可以查看我的《机器学习》的博文，或者百度。

PyTorch 里面，neural network 直接被简写成 nn，非常的简洁。 torch.nn 命名空间提供了构建您自己的神经网络所需的所有构建块。PyTorch 中的每个模块都是 nn.Module 的子类。神经网络本身就是一个模块，它由其他模块（层）组成。这种嵌套结构允许轻松构建和管理复杂的架构。

**参考文献&相关链接：**

1. [神经网络模型（最细的手写字识别案例）](https://blog.csdn.net/AI_dataloads/article/details/133144350)
2. [PyTorch 中文文档 - 构建神经网络](https://pytorch.ac.cn/tutorials/beginner/basics/buildmodel_tutorial.html)

### 2.4 自动微分（求导）

第一次跟着 b 站博主写鸢尾花分类问题的代码时，我还不太理解为什么会有**反向传播**这个操作，而且每次都要做，每一个迭代还都要清零一次。

我们知道神经网络，是从输入层，到隐藏层（1 to n），再到输出层，这是一步一步向前走的，叫做**向前传播**，在继承 nn.Module 的类时，必须要重写的一个类函数就是它，def forward(self)这样子。

**反向传播**顾名思义，就是从后往前走，主要是[梯度下降](https://aosai.github.io/blog-pages/zh/intelligence/MachineLearning/02_linear_regression.html#_3-%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D-gradient-descent)时需要用到。为了计算这些梯度，PyTorch 有一个内置的微分引擎，称为 torch.autograd。它支持自动计算任何计算图的梯度。只需要在张量初始化的时候，加入一个属性：requires_grad=True 即可。

**参考文献&相关链接：**

1. [【PyTorch 基础教程 4】反向传播与计算图（学不会来打我啊）](https://blog.csdn.net/qq_35812205/article/details/120814447)
2. [PyTorch 中文文档 - 使用 torch.autograd 进行自动微分](https://pytorch.ac.cn/tutorials/beginner/basics/autogradqs_tutorial.html)

### 2.5 参数优化

这里的参数优化主要是指**超参数**，它是可调整的参数，允许您控制模型优化过程。不同的超参数值会影响模型训练和收敛速度。

经过吴恩达教授的机器学习课程，我们也积累的很多类型的超参数，比如：

- 线性回归里的：学习率 alpha（α）
- 逻辑回归里的：正则化参数 lambda（λ）
- 神经网络里的：迭代训练次数、批量大小
- ......

PyTorch 内置了很多类型的参数优化器，比如 SGD 优化器，ADAM 优化器，RMSProp 优化器等等，它们适用于不同类型的模型和数据。

**参考文献&相关链接：**

1. [PyTorch 学习—13.优化器 optimizer 的概念及常用优化器](https://blog.csdn.net/weixin_46649052/article/details/119718582)
2. [PyTorch 中文文档 - 优化模型参数](https://pytorch.ac.cn/tutorials/beginner/basics/optimization_tutorial.html)

### 2.6 模型的保存和加载

保存模型就是为了再次使用，不管我们是在这个保存的数据基础上进一步的训练优化，还是我们去做迁移学习、共享参数，我们都得先把这个训练好的模型记录下来。

**参考文献&相关链接：**

1. [PyTorch 中的模型保存：一键保存、两种选择/保存整个模型和保存模型参数](https://blog.csdn.net/m0_52987303/article/details/136509035)
2. [pytorch 模型保存及加载参数恢复训练的例子](https://blog.csdn.net/qq_39698985/article/details/141823143)
3. [PyTorch 中文文档 - 保存和加载模型](https://pytorch.ac.cn/tutorials/beginner/basics/saveloadrun_tutorial.html)
