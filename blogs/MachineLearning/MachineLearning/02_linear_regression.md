---
title: 1-1 一元线性回归
order: 2
author: AOSAI
date: 2023-10-31
category:
  - 机器学习
tag:
  - 机器学习
---

<style>
  @media (orientation:landscape){
    .layout{
      display:flex;
    }
  }
  @media (orientation:portrait){
    .layout{}
  }
</style>

一元线性回归（Linear Regression with One Variable）

## 1.线性回归模型（Linear Regression Model）

### 1.1 什么是线性回归

我翻阅了一下我统计学的笔记，和吴恩达教授的内容有一点点出入，并且描述词汇过于专业化。不过问题不大，学习不就是取其精华、去其糟粕嘛。

在统计学中，变量和变量之间的关系，分为：**确定性关系**和**相关性关系**

<div class="layout">

![确定性关系](/machinelearning/one/02-1.png =360x)

![相关性关系](/machinelearning/one/02-2.png =360x)

</div>

**确定性关系：** 就是有这么一个线性函数，自变量无论如何取值，应变量与其组成的点坐标，都落到这个线性函数上。所以也称作函数关系。

**相关性关系：** 变量之间的关系并不确定，而是表现为具有随机性质的一种趋势。定义很拗口，其实就是把握一个事物的走势，有点形而上的感觉。

线性回归就是相关性关系的确定过程。

### 1.2 数据集（Data set）

| x(size in square feet) | y(price in $1000's) |
| ---------------------- | ------------------- |
| (1) 2104               | 400                 |
| (2) 1416               | 232                 |
| (3) 1534               | 315                 |
| (4) 852                | 178                 |
| ......                 | ......              |

上方的表格就是“相关性关系图例”中训练数据用的数据集（Training set），在不同的教材下：

**（1）x 被叫做 input 变量，或者叫做特征值；** x = "input" variable | feature

**（2）y 被叫做 output 变量，或者目标变量；** y = "output" variable | "target" variable

**（3）m 代表了数据集中的样本数量；** m = number of training examples

**（4）（x，y）表示一个单独的样本。** (x,y) = single training example

所有的样本（x~i~，y~i~）放在一起组成的样本集，就是我们的数据集。

### 1.3 程序实现线性回归的简易流程

![](/machinelearning/one/02-3.png =560x)

我们将包含特征值 x 和目标值 y 的数据集，放入机器学习算法中训练，然后就会得到一个训练出来的模型 f（function），通过这个方法，我们给出新的特征值 x，就能够预测出目标值 y-hat。

如何表示这个模型 f 呢。我们在上一章概述中，用了一元函数的形式来表示：y = wx +b，在这里，只需要把 y 变成 f(x) 或 f~w,b~(x) 就可以了，即：f~w,b~(x) = wx + b。

## 2.代价函数（Cost Function）

### 2.1 代价函数是什么？

<font color="green">The cost function will tell us how well the model is doing so that we can try to get it to do better.</font>

代价函数会告诉我们如何使训练模型的效果更好。

说到底我们就是要通过（x,y）的点集去把 w 和 b 确定下来嘛，要找出一个最佳的 w 和 b 的组合。我们之前说过，就是要让每一个样本到线性函数的距离总和最小，这里有一个衡量方式，叫做**平方误差**（Squared error）：

就是让每一个样本点的 y 值，减去训练出的线性函数对应 x 点的 y 值，然后平方。所以使用这种方式的代价函数也叫做：平方误差代价函数。公式写做：

$$
J(w,b) = \frac{1}{2m} \sum_{i=1}^m (\hat{y_i} - y_i)^2
$$

$$
J(w,b) = \frac{1}{2m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i)^2
$$

这里得说明几个点：
（1）$\hat{y_i} = f_{w,b}(x_i) = wx_i + b$
（2）除以 m 是为了让误差平均到每个样本
（3）除以 2 是一个微积分技巧，用于消除计算偏导数时出现的 2

### 2.2 代价函数的几何表示

线性回归的意义就是找到一条直线或曲线，使得所有的真实数据距离这个直线或曲线，总的误差最小。而代价函数就是衡量这个误差的方法，我们需要让代价函数的结果最小化。

我们来看最核心的部分：wx~i~ + b - y~i~，回想一下我们中学的知识，w 是直线的斜率，b 是与 y 轴的交点。b 在这里我们先忽略：wx~i~ - y~i~，然后这个式子是不是就变成了一条通过原点的直线。

假设数据集就是（1，1）（2，2）（3，3），当 w=1 的时候完美通过，如果 w 变大变成 2、3……，变小变成 0，-1……，误差平方的总和就会越来越大，我们看看图例就会发现，J(w)随着 w 的变化，是一条抛物线的变化，只有对称轴这里是最小值。

<div class="layout">

![f~w~(x)图例](/machinelearning/one/02-4.png =360x)

![J(w)图例](/machinelearning/one/02-5.png =360x)

</div>

$$
J(w=1) = \frac{1}{2m} \sum_{i=1}^m (f_{w}(x_i) - y_i)^2 = \frac{1}{2m} \sum_{i=1}^m (wx_i - y_i)^2 = \frac{1}{2m} (0^2 + 0^2 + 0^2) = 0
$$

抛开 b 是有原因的，应该已经能想到，b 的存在只是让这条抛物线往正上方或者正下方平移，只是让最小值变得不是 0 了而已。

### 2.3 可视化寻找最优解

一个开口向上的抛物线是不难计算，但也不能什么都我们自己计算吧，那不然要计算机有什么用。况且到了三次方、四次方等高阶方程，我们就很难把图像画出来了。因此，我们要想办法用计算机完成这个寻找最优解的过程。

吴恩达教授给我们讲了两种方式，一种是可视化，一种是梯度下降。可视化（Visualizing）可以说是一个半自动化的过程，主要是画出**等高线图**以及**代价函数 J(w,b)的 3D 视图**，来辅助我们进行判断。

<div class="layout">

![可视化图例1](/machinelearning/one/02-6.png =360x)

![可视化图例2](/machinelearning/one/02-7.png =360x)

</div>

等高线图是可视化 3D 成本函数 J 的简便方式，但是在某种程度上，它只是以 2D 绘制的，因此也更加高效。可视化的代码我可能会在 Matplotlib 笔记中写，吴恩达教授的课程里这个函数是直接写好的，我们只是简单调用了一下，传递了个参数，所以我目前也不是特别清楚实现原理。

但其实可视化并不是一个很好的程序，它终归要依赖人去手动测量等高线图中 w 和 b 的最佳值，一旦涉及到更复杂的机器学习模型的时候，它也就不起作用了。

我们想要的其实是一种可以用代码编写的高效算法，自动的查找参数 w 和 b 的值，它们会为你提供最佳拟合线，让成本函数 J 的值最小化。

<font color="green">There is an algorithm for doing this called gradient descent. This algorithm is one of the most important algorithm in machine learning. Gradient descent and variations on gradient descent are used to train, not just linear regression, but some of the biggest and most complex models in all of AI.</font>

有一种算法可以做到这一点，它叫做梯度下降。该算法是机器学习中最重要的算法之一。梯度下降和梯度下降的变化用于训练模型，不仅仅是线性回归模型，包括所有最大和最复杂的人工智能模型。

OK，让我们来看看什么是梯度下降。

## 3.梯度下降（Gradient Descent）

### 3.1 什么是梯度下降

![梯度下降的形象比喻](/machinelearning/one/02-8.png =560x)

教授举了一个很有趣的例子，就是我们在连绵起伏的高山上做下山运动，要去到这片区域的最低处。在这个过程中我们可能遇到以下几个问题：

1. 我们的所在的山不一定是最高的山（初始梯度值好不好我们无法确认）
2. 我们所看到的地势最低的地方，不一定是这片区域内最低的地方，山高决定了视野，而站立的方向决定了看到的地势。因此我们去到的最低点不一定是全局的最低点。

这两个问题不知道各方道友有没有什么联想，反正我是想到了二元函数求极值问题，极小值不一定是最小值，极大值不一定是最大值。

所以总结来说，梯度下降就这么几个步骤：

1. Start with some w,b （初始化梯度值）
2. Keep changing w,b to reduce J(w,b) （通过不断改变 w 和 b 的值，使代价函数减小）
3. Until we settle at or near a minimun （直到代价函数的变化大小为 0 或趋近于 0）

### 3.2 梯度下降的实现原理

梯度下降算法，即上述步骤 2 所重复运算的步骤写做：

$$
\begin{cases}
w = w - \alpha \frac{\partial}{\partial{w}} J(w,b) \\
b = b - \alpha \frac{\partial}{\partial{b}} J(w,b)
\end{cases}
$$

方程中出现的 α 叫做学习率，具体看下一小节，紧跟其后的是一个偏导数方程，$\frac{\partial}{\partial{w}} J(w,b)$ 自然就是对代价函数 J(w,b)中的 w 求偏导，b 同理。

这里有一个非常需要注意的地方，在程序编写的过程中，一定是同一组（w，b）运行完算法后，重新再赋值新一轮的（w，b）进行运算，否则会出错。我们把这个步骤稍微改写一下会看的比较明显：

1. $tmp\_w = w - \alpha \frac{\partial}{\partial{w}} J(w,b)$
2. $tmp\_b = b - \alpha \frac{\partial}{\partial{b}} J(w,b)$
3. $w = tmp\_w$
4. $b = tmp\_b$

这是正确的顺序。在偏导数运算 b 中，我们知道虽然不会对 w 进行求导，但是保不齐就有 w 和 b 相乘的结合状态，这样的情况下，如果 w 发生改变，就会对结果造成误差。就比如我们把 2 和 3 的顺序互换，我们的结果就可能会完全不一样。

![直击灵魂的演示](/machinelearning/one/02-9.png =560x)

首先我们在这里明确一个概念：导数的集合意义就是切线斜率，偏导数可以看作多元的情况下，单个变量的斜率计算。因此呢，我们每做一次对 w 的偏导数，切线就会往下移动一次，直到斜率变为 0，也就是和 x 轴平行，这样就到了最低点。

这个图示的画图和计算演示告诉我们，无论初始值是正的还是负的，梯度下降算法都会让其逼近于最低点。

### 3.3 学习率（Learning rate）

![学习率的意义](/machinelearning/one/02-10.png =560x)

学习率如果过小，是可以到达最低点，但是会导致计算量变多，梯度下降的速度变慢，就像 100 米让婴儿去爬，就需要很长时间。

学习率如果过大，可能根本就到不了最小值，反而会越来越大，就像图中下方用粉色线段连接的那样，直接跨越过了最小值。

因此，**最好的方式**应该是随着梯度下降算法运行次数的增加，阿尔法 α 的大小也随之递减。

### 3.4 线性回归的梯度下降

我们回忆一下在之前的房价预测中（房屋面积、价格），线性回归模型的方程：

$$
J_{w,b}(x) = wx + b
$$

平方误差代价函数：

$$
J(w,b) = \frac{1}{2m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i)^2
$$

将其带入到梯度下降方程中：

$$
w = w - \alpha \frac{\partial}{\partial{w}} J(w,b) = w -  \frac{\alpha}{m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i) x_i \\

b = b - \alpha \frac{\partial}{\partial{b}} J(w,b) = b -  \frac{\alpha}{m} \sum_{i=1}^m (f_{w,b}(x_i) - y_i)
$$

这里附上吴恩达教授手写的推导过程，其实不难理解，自己可以手动推一下：

![线性回归梯度下降的推导](/machinelearning/one/02-11.png =560x)

如果我们使用了平方误差成本函数，得到的图形是一个碗状（bowl shape）的图形，也叫 凹函数（convex function），它只会有一个全局的最小值，如下图所示。

![使用平方误差的几何表示](/machinelearning/one/02-12.png =560x)
