---
title: 0-0 机器学习目录与概述
index: True
author: AOSAI
date: 2023-10-28
category:
  - 机器学习
tag:
  - 机器学习
---

## 1. 序言

实话实说，我最初是逃避学英语的，但是为了能够更好的进行学习，看论文，所以我是硬着头皮看的吴恩达教授的课程，后来慢慢就适应了，而且吴恩达老师讲的真的非常细，很适合入门学习。

这里得感谢“啥都会点的研究生(B 站 up 主)”为我们提供的带翻译的教学视频，链接放这里：[吴恩达教授 2022 年机器学习课程 b 站](https://www.bilibili.com/video/BV1Pa411X76s/?spm_id_from=333.999.0.0&vd_source=18006c3daf5f2be7d7b9e5fa500af4c8)，相关的代码练习文档：[Github 配套文档整理](https://github.com/kaieye/2022-Machine-Learning-Specialization)。

## 2. 目录

机器学习的内容目前是基于吴恩达教授的 2022 年课程内容进行整理的。包含的内容很杂，因此在目录这里做一个分类：

### 2.1 有监督的机器学习（Supervised Machine Learning）

- [1-1 一元线性回归模型](02_linear_regression.md)
- [1-2 多元线性回归模型](03_linear_regression.md)
- [1-3 分类模型](04_classification.md)

这一部分学习了，线性回归、逻辑回归、成本函数、梯度下降算法。

### 2.2 更高级的学习算法（Advanced Learning Algorithm）

- [2-1 神经网络初探](05_deep_learning.md)
- [2-2 神经网络进阶](06_tensorflow.md)
- [2-3 模型评估](07_model_evaluation.md)
- [2-4 决策树模型](08_decision_tree.md)

这一部分学习了，神经网络、对机器学习优化的一些方法、决策树。

### 2.3 无监督学习、推荐系统、强化学习

- [3-1 无监督学习（Unsupervised Learning）](09_unsupervised_learning.md)
- [3-2 推荐系统（Recommendation System）](10_recommendation_system.md)
- [3-3 强化学习（Reinforcement Learning）](11_reinforcement_learning.md)

这一部分学习了，（1）聚类算法（Clustering）、异常检测算法（Anomaly Detection）；（2）协同过滤算法（Collaborative Filtering）、基于内容的过滤算法（Content-based Filtering）、PCA 算法；（3）强化学习算法

## 3. 机器学习概述

### 3.1 什么是机器学习（What is Machine Learning）

<font color="green">Arthur Samuel(1959). Machine Learning: Field of study that gives computers the ability to learn without being explicitly programmed.</font>

阿瑟·萨缪尔在 1959 年的时候给出了这样一个定义：“在没有明确设置的情况下，是计算机具有学习能力的研究领域。”称为机器学习。

这位教授当年编写了一个跳棋程序，让电脑自己对抗自己，对战上万次，终于程序学习到了什么样的布局最容易获胜，最终学会了下棋。这个事件可以称得上是，人工智能领域的开始。

<font color="green">Tom Mitchell(1998). Well-posed Learning Problem: A computer program is said to learn from experience E with respect to some task T and some performance measure P, if its performance on T, as measured by P, improves with experience E.</font>

Mitchell 教授在 98 年的时候，将机器学习重新定义为：“计算机从经验 E 中学习解决某一任务 T，进行某一性能度量 P，通过 P 测定计算机在解决任务 T 上的表现因 E 而提高”

对于跳棋游戏，经验 E 就是让程序和它自己下几万次跳棋，任务 T 就是玩跳棋，性能度量 P 就是与新对手玩跳棋时赢的概率。

### 3.2 监督学习（Supervised Learning）

监督学习的前提是 Right answers given，也就是说，我们构建的数据集，其中全部都是正确答案。通过这些正确答案，我们找到一种方式去拟合这些数据，从而得到更多合理的预测，这就是监督学习。

常见的监督学习有两类任务：

<font color="blue">1. 回归问题（Regression）</font>
预测连续的数值输出。例如直线、曲线等。

<font color="blue">2. 分类问题（Classification）</font>
预测离散的数值输出。比如非好即坏的布尔值类型数据。

单说概念的话可能会比较朦胧，我们来看看吴恩达教授举出的例子。

![](/machinelearning/one/01-1.png =560x)

这是一个房价预测的案例，只有一个“特征”房子大小（size），通过房子大小去预测房价（price）。先前我们说了，监督学习的前提是数据集（样本）的答案正确，所以图中画红 X 的点，都是某一个地方的真实房价关系。我们要通过一种线性关系，来表示这个房价随房屋面积的走势。

通过九年义务教育的熏陶，我们一看图就知道，这肯定是对数函数最贴合数据对吧。但这是我们人通过思考和经验得出来的结论，在此处我们先假设用直线函数来表示：y = wx + b，w 表示斜率，b 表示直线与 y 轴交汇点。

我们义务教育学过，通过两点来确定一条直线对吧，这么多点（数据），我们怎么找到一条合适的直线，让其尽可能的接近所有的数据呢？这就涉及到了《概率论与数理统计》这门课的知识。简单的理解，就是我们把所有的点对这条直线做垂线，使垂线的距离之和最小，就是最合适的直线。

这就是回归问题，具体的计算的实现之后会有，这里我们再看另一个分类的例子。

![](/machinelearning/one/01-2.png =560x)

这是一个肿瘤预测的案例，我们通过肿瘤的大小（一个特征），来预测肿瘤是良性的还是恶性的。我们看到肿瘤越小良性的更多，肿瘤越大恶性的越多。从概率上来说通常是这么回事儿，但是这种预测真的需要非常慎重，所以我们来看看下面这张图。

![](/machinelearning/one/01-3.png)

这张图我们通过肿瘤的大小、病人的年龄（两个特征），来预测肿瘤的好坏。通过图我们发现，年龄也是对肿瘤的好坏有影响的，同样的肿瘤大小，年龄越大的人恶性的概率越高。

在实际的模型中，特征值一般会很多，比如这个肿瘤预测，还会有：肿块的厚度、肿瘤细胞大小的均匀性、肿瘤细胞形状的均匀性等。

我们可以把每一个特征都看作一个变量 x，写作 x~i~，预测的结果看作 y，我们寻找合适的 w~i~ 和 b 的过程，就可以看作是机器学习的过程。

### 3.3 无监督学习（Unsupervised Learning）

其实很好理解，监督学习是我们给出了正确答案，无监督学习即我们不给答案，需要机器自己去寻找某一些特征，把相似的东西提取出来。

![](/machinelearning/one/01-4.png =560x)

举一个简单的例子，我们要让机器识别出狗。如果是监督学习，我们需要把数据集中全部存入狗的照片，让机器取提取狗的特征进行学习，这样进行测试的时候，符合狗特征的就判定为狗，这样就是分类问题。

但如果，数据集我们使用上万张动物的照片，让程序自动去提取特征分类，在训练量足够大、特征量足够充分的时候，也是能达到同样效果的，哪怕机器不知道这个东西叫狗，他也能找出近似的狗的图片，这就是聚类问题。

我们来看常见的无监督学习的算法：

<font color="blue">1. 聚类算法（Clustering Algorithm）</font>

比如：组织大型的计算机集群、社交网络分析（哪些人认识、或属于一个圈子）、市场细分、天文数据分析、星系形成分析……

<font color="blue">2. 鸡尾酒会算法（Cocktail Party Algorithm）</font>

两个麦克风，称其为 m1、m2，放置在不同的地方，两个不同位置的人同一时间进行说话，假设两人为 x1、x2，说话的时候两只麦克风都能接收到两个人的声音，只不过因为距离原因，声音的大小等属性不一样，通过**奇异值分解**，将声音分离，这就是鸡尾酒会算法。

这个例子我很容易想到，音乐文件中的人声分离，以前很多歌曲都是没有单独出伴奏的，我们就只能通过剔除人声、提取音乐这样的方式得到伴奏。我用过 IZotope RX9，它是一个免费的音频处理软件，我试过一次完美提取伴奏，真的难以想象的完美，人声全部剔除，并且连和声都无损的保留下来了，还挺好奇它背后的算法是什么样的。
