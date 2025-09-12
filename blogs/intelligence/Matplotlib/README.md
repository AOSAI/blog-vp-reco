---
title: 画布结构详解
order: 0
author: AOSAI
date: 2023-11-20
category:
  - 机器学习
tag:
  - 机器学习
  - Matplotlib
---

## 1. 列阵在前

Matplotlib 是 Python 的一个绘图库，与 Numpy、Pandas 共享数据科学三剑客的美誉，也是很多高级可视化库的基础。但它并不是 Python 的内置库，需要手动下载，并且它依赖于 Numpy 库，因此如果遇到看不懂的地方，可以翻一翻 Numpy 的内容。

虽然在机器学习中用到的只是其中的 pyplot 这样一个子库，但其实它在运行的过程中，内部调用了 Matplotlib 路径下的大部分子模块，共同完成各种丰富的绘图功能。在学习的过程中我觉得还蛮有意思的，从中学时代数学的各种函数图像手绘画图，到现在用代码绘图，也算是一种学习的乐趣。

在吴恩达教授的课程中，绘图的方式经常有变化，其中还有一些参数的设定，经常会有简写的情况，我就想查阅一下文档到底是怎么设定的，奈何即便是 Matplotlib 的中文网站，也都是引用的英文文档链接，所以就自己记录一下吧。愿我早日脱离菜鸟称号。

[Matplotlib 官方中文文档](https://www.matplotlib.org.cn/)

## 2. API 层次

Matplotlib 的 API 包含有三层：

- backend_bases.FigureCanvas：简单来说就是画布
- backend_bases.Renderer：知道如何在 FigureCanvas 上绘图
- artist.Artist：知道如何使用 Renderer 在 FigureCanvas 上绘图

FigureCanvas 和 Renderer 需要处理底层的绘图操作，Artist 则处理所有的高层结构，通常我们只和 Artist 打交道，不需要关心底层的绘制细节。就好比我们的高级编程语言 Java、Python，我们只需要去写我们的逻辑，而不用去考虑如何编译、如何解释执行。

在 Matplotlib 中最重要的基类是 Artist 类及其派生类，主要分为**绘图容器**和**绘图元素**两种类型：

1. 容器类型中包括：==Figure、Axes、Axis==，这些类确定一个绘图的区域，为元素类型的显示提供位置。

2. 元素类型包括：Line2D、Rectangle、Text、AxesImage 等，这些都是包含在容器类型所提供的绘图区域中的。

## 3. 绘图结构

![绘图结构的图像描述](/matplotlib&numpy/plt-00-01.png)

- **Figure：** 红色的外框，可以将其理解为一个画板，我们所有的内容都会绘制在这个画板上，也就是说 Figure 会包含所有的子 Axes。

- **Axes：** 蓝色的内框，一套坐标轴组合，可以理解为是一个子图，就像小孩子爱看的漫画书，一页纸上有一般都六幅画，Axes 的数量可以是一个，也可以是多个。

- **Axis：** 绿色的横纵坐标，上面包含了刻度和标签（tick locations 和 labels）。

Axis 表示坐标轴（x、y、z……），而 Axes 在英文中是 Axis 的复数形式，也就是说 Axes 代表的其实是 Figure 中的一套坐标轴。所以在一个 Figure 当中，每次添加一个 subplot（子图），其实就是添加了一套坐标轴（一个 Axes）。==所以可以看出，ax 的设定一定一个数组，因为子图的数量是可以多个的，所以在多个图的情况下，最好采用 ax.plot() 的绘图方式。如果是一个图，plt.plot() 和 ax.plot() 两种方式效果是一样的。==

![子图样例](/matplotlib&numpy/plt-00-02.png =500x)

- **Artist：** 是所有绘图元素的基类，在 Figure 中可以被看到的都是一个个 Artist。当一个 figure 被渲染的时候，所有的 artists 都被画在画布 canvas 上。大多数的 artist 都是和某个 axes 绑定的，这些 artist 不能同时属于多个 axes。（因此当一个 figure 里有多个 axes 的时候最好是采用 ax.plot()的方式绘图）

<!-- ![Artist接口思维导图](/matplotlib&numpy/plt-00-03.png) -->

## 4. 画布构成图

Figure 是最大的一个 Artist，它包括整幅图像的所有元素，一个 Figure 中的各个部分的 Artists 元素就如下图所示。

Figure 中的所有元素类型的 Artist 属性都可以通过 ax.set_xxx() 和 ax.get_xxx() 来设置和获取。

![](/matplotlib&numpy/plt-00-04.png =560x)

## 5. 绘图风格

Matplotlib 在使用的时候有两种风格：面向对象风格（ax）和 pyplot 函数风格。看看同样绘制下方的图例，两种风格的代码有何不同。

![](/matplotlib&numpy/plt-00-05.png =560x)

```py
# 面向对象风格
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2, 100)
# Note that even in the OO-style, we use `.pyplot.figure` to create the figure.
fig, ax = plt.subplots()  # Create a figure and an axes.
ax.plot(x, x, label='linear')  # Plot some data on the axes.
ax.plot(x, x**2, label='quadratic')  # Plot more data on the axes...
ax.plot(x, x**3, label='cubic')  # ... and some more.
ax.set_xlabel('x label')  # Add an x-label to the axes.
ax.set_ylabel('y label')  # Add a y-label to the axes.
ax.set_title("Simple Plot")  # Add a title to the axes.
ax.legend()  # Add a legend.
```

```py
# pyplot 函数风格
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2, 100)
plt.plot(x, x, label='linear')  # Plot some data on the (implicit) axes.
plt.plot(x, x**2, label='quadratic')  # etc.
plt.plot(x, x**3, label='cubic')
plt.xlabel('x label')
plt.ylabel('y label')
plt.title("Simple Plot")
plt.legend()
```

两种风格都可以，但是在使用时最好不要混着用。事实上，在调用 plt.plot()、plt.scatter()、plt.bar()等方法时，其实本质上还是在 axes 上画图，可以将他们理解为：先在 figure（画板）上获取一个当前要操作的 axes（坐标系），如果没有 axes 就自动创建一个并将其设为当前的 axes，然后在当前这个 axes 上执行各种绘图功能。

```py
# 画布调用的一些小区别

fig = plt.figure()  # an empty figure with no Axes
fig, ax = plt.subplots()  # a figure with a single Axes
fig, axs = plt.subplots(2, 2)  # a figure with a 2x2 grid of Axes
```

## 6. 参考文献

[Matplotlib：绘图结构详解，Artist、Figure、Axes 和 Axis 的联系与区别](https://blog.csdn.net/u010021014/article/details/110393223)

[Matplotlib 使用教程(保姆级说明教程)](https://zhuanlan.zhihu.com/p/399679043)

[Matplotlib 入门详细教程](https://zhuanlan.zhihu.com/p/342422162)

[Matplotlib 官方中文文档](https://www.matplotlib.org.cn/)
