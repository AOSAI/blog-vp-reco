---
title: 1-2 多元线性回归
order: 3
author: AOSAI
date: 2023-11-07
category:
  - 机器学习
tag:
  - 机器学习
---

多元线性回归（Linear Regression with Multiple Variable）

## 1.多维特征（Multiple Features）

我想读者应该对之前的数据集还有印象，只有房屋大小（size in squared feet）和价格（Price），现在我们来构建一个具有多个特征的数据集：

| 房屋大小(x~1~) | 几个卧室(x~2~) | 所处楼层(x~3~) | 建筑年龄(x~4~) | 价格（~千美刀） |
| :------------: | :------------: | :------------: | :------------: | :-------------: |
|      2014      |       5        |       1        |       45       |       460       |
|      1416      |       3        |       2        |       40       |       232       |
|      1534      |       3        |       2        |       30       |       315       |
|      852       |       2        |       1        |       36       |       178       |
|       ……       |       ……       |       ……       |       ……       |       ……        |

之前我们房屋买卖的线性模型是：$f_{w,b}(x) = wx +b$

新的数据集内一共有四个特征（n=4）；x~i~表示第几个特征，比如 x~2~表示有几个卧室；

因此新的线性模型为：$f_{w,b}(x) = w_1x_1 + w_2x_2 + w_3x_3 + w_4x_4 +b$

根据上述描述，加上数学归纳法，我们可以推广到 N 维：$f_{w,b} = w_1x_1 + w_2x_2 + ... + w_nx_n + b$

## 2.矢量化·向量化（Vectorization Part）

### 2.1 矢量化的概念

1. 向量是同时具有大小和方向，且满足平行四边形法则的几何对象。它是由一行、或一列的元素构成的。由带箭头的符号表示：$\vec{a} = [x_1 x_2 ... x_n]$（具体还是得看《线性代数》）

2. 向量的点积（内积）是指两个向量间，每一个对应的元素相乘。因此必须同为 N 维向量，即元素的个数要相同。比如：$\vec{a}=[1,2,3]$，$\vec{b}=[2,3,4]$，向量 a 和向量 b 的内积就是：$1\times{2}+2\times{3}+3\times{4}=2+6+12=20$

我们可以将房屋买卖的四个特征写做一组向量 $\vec{x}=[x_1,x_2,x_3,x_4]$，把参数 w 也写做一组向量 $\vec{w}=[w_1,w_2,w_3,w_4]$，这样就得到了一个推广到 N 维的简化公式：

$$
f_{\vec{w},b}(\vec{x})=\vec{w}\cdot \vec{x}+b=w_1x_1 + w_2x_2 +...+ w_nx_n + b
$$

### 2.2 为什么要矢量化

1. 我们编写代码的时候，能避免循环，减少了程序的运算时间，并且代码还简洁美观。
2. Numpy 的 np.dot()，向量点积函数，从物理运算（硬件层面），减小了内存占用和运算时间。

我们来看几组例子：

::: tabs

@tab Python 编写-1

```
w = [1.0, 2.1, 3.2, 4.3]
b = 4
x = [10, 20, 30, 40]
f = w[0]*x[0] + w[1]*x[1] + w[2]*x[2] + w[3]*x[3] + b

# 在向量维度低，也就是特征值少的时候可以这么写，如果多了，这样写起来就会非常繁琐
```

@tab Python 编写-2

```
w = [1.0, 2.1, 3.2, 4.3, ..., n]
b = 4
x = [10, 20, 30, 40, ..., n]
f = 0
for j in range(len(x)):
  f += w[j] * x[j]
f = f + b

# 循环写起来是方便，但是时间复杂度也会随着n的增大，变多。
```

@tab Numpy 编写

```
import numpy as np
w = [1.0, 2.1, 3.2, 4.3, ..., n]
b = 4
x = [10, 20, 30, 40, ..., n]
f = np.dot(w,x) + b

# 一句话结束了，优雅简洁
```

:::

### 2.3 Python 库的使用

吴恩达教授在第一个大课程中，用到了三个 Python 的库，分别是：

1. Numpy，它用来提供多维数组对象，以及用于数组快速操作的各种 API，包括但不限于：数学、逻辑、形状操作、排序、基本线性代数、离散傅里叶变换、基本统计运算和随机模拟等。

2. Matplotlib 中的 pyplot 库，它是一个用来绘图的工具，很好用。

3. Scikit-learn，它是一个 Python 用于机器学习的库，封装了很多成熟的方法，拿来即用系列。

## 3.多元线性回归的梯度下降（Gradient Descent for Multiple Regression）

### 3.1 梯度下降推导式

回顾一下一元线性回归的梯度下降推导式：

$$
w = w - \alpha \frac{\partial}{\partial{w}} J(w,b) = w -  \frac{\alpha}{m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i) x_i \\

b = b - \alpha \frac{\partial}{\partial{b}} J(w,b) = b -  \frac{\alpha}{m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i)
$$

多元线性回归的梯度下降：

$$
w_j = w_j - \alpha \frac{\partial}{\partial{w_j}} J(\vec{w},b) \\

= \begin{cases}
w_1 = w_1 - \alpha \frac{\partial}{\partial{w_1}} J(\vec{w},b) = w_1 - \frac{\alpha}{m} \sum_{i=1}^m (f_{\vec{w},b}(\vec{x_i}) - y_i) x_{i1} \\
\vdots \\
w_n = w_n - \alpha \frac{\partial}{\partial{w_n}} J(\vec{w},b) = w_n - \frac{\alpha}{m} \sum_{i=1}^m (f_{\vec{w},b}(\vec{x_i}) - y_i) x_{in}
\end{cases} \\

b = b - \alpha \frac{\partial}{\partial{b}} J(\vec{w},b) = b -  \frac{\alpha}{m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i)
$$

### 3.2 正规方程（Normal Equation）

正规方程只是被提了一嘴，说有助于实现线性回归，没有具体讲解，这一块先打个 tag。

## 4.特征缩放（Feature Scaling）

### 4.1 由来

有的时候，数据集中的特征，它的大小可能差的比较大，就比如我们房屋特征中的面积，范围 300~2000，但是卧室的数量只有 0~5，这个时候我们要让 w~1~ 的取值变小，降低 x~1~ 的影响，让 w~2~ 的取值变大，增大 x~2~ 的影响。

我们来看一组例子，一个房屋买卖训练样本：x~1~ = 2000，x~2~ = 5，price = $500k

假如 w~1~ = 50，w~2~ = 0.1，b = 50
预测价格 = 50 × 2000 + 0.1 × 5 + 50 = 100,050.5k，与真实价格相差甚远

假如 w~1~ = 0.1，w~2~ = 50，b = 50
预测价格 = 0.1 × 2000 + 50 × 50 + 50 = 500k，几乎和真实价格一样

因此，一般来说，我们要对大的特征值 x，给小的参数 w，对小的特征值 x，给大的参数 w，这样会让结果更趋近于正确答案。因此我们也说，特征缩放可以帮助我们加快梯度下降的过程。

我们同样可以通过几何上的观察发现，特征缩放让图形变得更加的均匀：

![3.1 特征缩放](/machinelearning/one/03-1.png =560x)

### 4.2 除以最大值

$$x_{ij}=\frac{x_{ij}}{max_i},\quad i,j=0,1,2,3……$$

这样做的好处是，每个特征的区间都就变成了 [x,1]，0 < x < 1。这样一来，不同特征的影响力就变得相对一致了，不会出现上方的“房屋面积”和“卧室数目”那样巨大的差异。

![3.2 除以最大值](/machinelearning/one/03-2.png =560x)

### 4.3 均值归一化（Mean Normalization）

$$x_{ij}=\frac{x_{ij}-\mu_{i}}{max_{i}-min_{i}},\quad i,j=0,1,2,3……$$

均值归一化，顾名思义啊，就是特征 i 中的每个数值减去特征 i 的平均值 μ，再除以最大值减去最小值，最后这个图像理论上不管是几维，都会落在对应维数的[-1,1]上。

![3.3 均值归一化](/machinelearning/one/03-3.png =560x)

### 4.4 Z-score 标准化（Z-score Normalization）

$$x_{ij}=\frac{x_{ij}-\mu_{i}}{\sigma_{i}},\quad i,j=0,1,2,3……$$

这一步和“均值归一化”的差别在于，分母是标准差 σ，也就是方差。

![3.4 标准化](/machinelearning/one/03-4.png =560x)

### 4.5 总结

我们要尽可能的保证特征区间在[-1,1]之间，如果过大，会导致提梯度下降过慢，太小也会导致梯度下降过快。看一看吴恩达教授举得一些例子：

![3.5 特征区间的选择](/machinelearning/one/03-5.png =560x)

## 5.一些实用技巧（Practical Tips for Linear Regression）

### 5.1 检查梯度下降是否收敛（Checking Gradient Descent for Convergence）

1. **第一种方式：** 绘制梯度下降曲线，观察曲线末端是否变得平滑，即与 x 轴平行。

2. **第二种方式：** 自动收敛。比如判断下降是否小于 0.001，如果小于，就相当于收敛了。

p.s. 没有具体的方式可以判断到底需要梯度下降多少次，有可能是 30 次也有可能是 1000 次。当然，如果代价函数 J 没有下降，反而在上升，可能是学习率 α 设置的有问题，或者代码有错误。

![3.6 判断梯度下降是否收敛](/machinelearning/one/03-6.png =560x)

### 5.2 选择学习率（Choosing the Learning Rate）

![3.7 学习率的选择](/machinelearning/one/03-7.png =560x)

学习率过大，会导致永远到不了最优解；学习率过小，会导致迭代次数过多。但是学习率的选择，并没有一个可以由经验确定下来的数值，我们需要去不断试错。

比如：0.001、0.01、0.1、1……

吴教授他的个人习惯是，在试错的过程中，不同的学习率乘以 3，拿上述的学习率值来说就是：

0.001、0.003、0.01、0.03、0.1、0.3、1……

当然了，我们也可以按照自己的喜好去调整学习率，比如用二分法的思想、动态规划的思想……

### 5.3 特征工程（Feature Engineering）

<font color="green">Creating a new feature is an example of what's called feature engineering, in which you might use your knowledge or intuition about the problem to design new features。Usually by transforming or combining original features of the problem in order to make it easier for the learning algorithm to make accurate predictions.</font>

创造一个新的特征就是所谓特征工程的一个例子，你可以在其中使用关于问题的知识或直觉来设计新功能。通常通过转换或者组合问题中原有的特征，以使得算法更容易做出准确的预测。

![3.8 特征工程](/machinelearning/one/03-8.png =560x)

我们还是拿房屋买卖举例子，假设我们现在有两个特征，一个是房屋的长度，一个是房屋的宽度，我们通过这两个特征，可以构造出第三个特征“房屋面积”，这样就有了三个特征，或许这样做会让算法的预测变得更为准确。特征工程讲的就是这么个事儿。

### 5.4 多项式回归（Polynomial Regression）

<font color="green">Let's take the idea of multiple linear regression and feature engineering to come up with a new algorithm called polynomial regression, which will let you fit curves, non-linear functions, to your data.</font>

让我们以多元线性回归和特征工程的思想来得出一种称为多项式回归的新算法，它可以让你在你的数据上拟合曲线，或非线性函数。

![3.9 多项式回归](/machinelearning/one/03-9.png =560x)
