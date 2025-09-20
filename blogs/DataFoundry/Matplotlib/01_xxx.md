---
title: 画布结构与常见图
date: 2023-11-20
category:
  - 数据锻造坊
tag:
  - 机器学习
  - Matplotlib
---

## 1. 列阵在前

Matplotlib 是 Python 的一个绘图库，与 Numpy、Pandas 共享数据科学三剑客的美誉，也是很多高级可视化库的基础。但它并不是 Python 的内置库，需要手动下载，并且它依赖于 Numpy 库，因此如果遇到看不懂的地方，可以翻一翻 Numpy 的内容。

虽然在机器学习中用到的只是其中的 pyplot 这样一个子库，但其实它在运行的过程中，内部调用了 Matplotlib 路径下的大部分子模块，共同完成各种丰富的绘图功能。在学习的过程中我觉得还蛮有意思的，从中学时代数学的各种函数图像手绘画图，到现在用代码绘图，也算是一种学习的乐趣。

在吴恩达教授的课程中，绘图的方式经常有变化，其中还有一些参数的设定，经常会有简写的情况，我就想查阅一下文档到底是怎么设定的，奈何即便是 Matplotlib 的中文网站，也都是引用的英文文档链接，所以就自己记录一下吧。愿我早日脱离菜鸟称号。

[Matplotlib 官方中文文档](https://www.matplotlib.org.cn/)

### 1.1 API 层次

Matplotlib 的 API 包含有三层：

- ==backend_bases.FigureCanvas==：简单来说就是画布
- ==backend_bases.Renderer==：知道如何在 FigureCanvas 上绘图
- ==artist.Artist==：知道如何使用 Renderer 在 FigureCanvas 上绘图

FigureCanvas 和 Renderer 需要处理底层的绘图操作，Artist 则处理所有的高层结构，通常我们只和 Artist 打交道，不需要关心底层的绘制细节。就好比我们的高级编程语言 Java、Python，我们只需要去写我们的逻辑，而不用去考虑如何编译、如何解释执行。

在 Matplotlib 中最重要的基类是 Artist 类及其派生类，主要分为**绘图容器**和**绘图元素**两种类型：

1. 容器类型中包括：==Figure、Axes、Axis==，这些类确定一个绘图的区域，为元素类型的显示提供位置。

2. 元素类型包括：Line2D、Rectangle、Text、AxesImage 等，这些都是包含在容器类型所提供的绘图区域中的。

### 1.2 绘图结构

![绘图结构的图像描述](/matplotlib&numpy/plt-00-01.png)

- **Figure：** 红色的外框，可以将其理解为一个画板，我们所有的内容都会绘制在这个画板上，也就是说 Figure 会包含所有的子 Axes。

- **Axes：** 蓝色的内框，一套坐标轴组合，可以理解为是一个子图，就像小孩子爱看的漫画书，一页纸上有一般都六幅画，Axes 的数量可以是一个，也可以是多个。

- **Axis：** 绿色的横纵坐标，上面包含了刻度和标签（tick locations 和 labels）。

Axis 表示坐标轴（x、y、z……），而 Axes 在英文中是 Axis 的复数形式，也就是说 Axes 代表的其实是 Figure 中的一套坐标轴。所以在一个 Figure 当中，每次添加一个 subplot（子图），其实就是添加了一套坐标轴（一个 Axes）。==所以可以看出，ax 的设定一定一个数组，因为子图的数量是可以多个的，所以在多个图的情况下，最好采用 ax.plot() 的绘图方式。如果是一个图，plt.plot() 和 ax.plot() 两种方式效果是一样的。==

![子图样例](/matplotlib&numpy/plt-00-02.png =500x)

- **Artist：** 是所有绘图元素的基类，在 Figure 中可以被看到的都是一个个 Artist。当一个 figure 被渲染的时候，所有的 artists 都被画在画布 canvas 上。大多数的 artist 都是和某个 axes 绑定的，这些 artist 不能同时属于多个 axes。（因此当一个 figure 里有多个 axes 的时候最好是采用 ax.plot()的方式绘图）

<!-- ![Artist接口思维导图](/matplotlib&numpy/plt-00-03.png) -->

### 1.3 画布构成图

Figure 是最大的一个 Artist，它包括整幅图像的所有元素，一个 Figure 中的各个部分的 Artists 元素就如下图所示。Figure 中的所有元素类型的 Artist 属性都可以通过 ==ax.set_xxx()== 和 ==ax.get_xxx()== 来设置和获取。

![](/matplotlib&numpy/plt-00-04.png =560x)

### 1.4 绘图风格

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

## 2. 折线图

### 2.1 简单折线图（正弦余弦函数）

```py
import numpy as np
import matplotlib.pyplot as plt

fig = plt.figure()  # 操作1：创建一个空白画布
ax = plt.axes()  # 操作2：创建一个坐标轴，默认是二维坐标轴

x = np.linspace(0, 4*np.pi, 200)  # 操作3：创建一个范围 0~4Π，200个均匀的值的数组
ax.plot(x, np.sin(x))  # 操作4：在坐标轴上绘制正弦函数
plt.show()  # 操作5：显示图像，不论怎么写这一步都不能省略
```

值得一提的是，在上一章节中，我们并没有写 “操作 1” 和 “操作 2” 这两个步骤，但是同样绘制出了图形，这是因为我们在执行 plt.plot() 或 ax.plot() 操作的时候，自动生成了一个画布和对应的单个坐标轴。如果不涉及对坐标轴和画布的操作，单个图表的生成可以省略前两个步骤。

如果我们需要在同一幅坐标轴中绘制多根线条，只需要多次调用 plot 函数即可：

```py
plt.plot(x, np.sin(x))
plt.plot(x, np.cos(x))
```

<div class="layout">

![正弦函数](/matplotlib&numpy/plt-01-01.png =360x)

![正弦余弦函数](/matplotlib&numpy/plt-01-02.png =360x)

</div>

### 2.2 调整折线图（线条颜色和风格）

我们在完成上面正余弦函数的 plot 的时候一定有这样的疑惑，为什么正弦函数是蓝色的，而余弦函数是橙色的，我们并没有给它指定颜色啊。这是 Matplotlib 的内部设定，如果没有指定颜色，它会在默认颜色值中循环使用来绘制每一条线条。我们也可以给他手动更改颜色：

```py
plt.plot(x, np.sin(x - 0), color='blue')        # 通过颜色名称指定
plt.plot(x, np.sin(x - 1), color='g')           # 通过颜色简写名称指定(rgbcmyk)
plt.plot(x, np.sin(x - 2), color='0.75')        # 介于0-1之间的灰阶值
plt.plot(x, np.sin(x - 3), c='#FFDD44')     # 16进制的RRGGBB值
plt.plot(x, np.sin(x - 4), c=(1.0,0.2,0.3)) # RGB元组的颜色值，每个值介于0-1
plt.plot(x, np.sin(x - 5), c='chartreuse'); # 能支持所有HTML颜色名称值
```

我们可以看到，color 这个属性是可以简写成 c 的。常见的 ==颜色名称、16 进制颜色编号、RGB 元组== 这些表示颜色的方法都是可以使用的。

另外还有，==0-1 的灰度值，[HTML 颜色名称值](https://www.w3schools.com/colors/colors_names.asp)，[颜色名称简写](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.plot.html)== 三种方式。颜色名称简写在官方文档中只有 8 个值，我直接把它贴出来：

| character |  color  | character | color  |
| :-------: | :-----: | :-------: | :----: |
|    "b"    |  blue   |    "g"    | green  |
|    "r"    |   red   |    "c"    |  cyan  |
|    "m"    | magenta |    "y"    | yellow |
|    "k"    |  black  |    "w"    | white  |

类似的，我们可以通过 linestyle 关键字参数指定线条风格：

```py
plt.plot(x, x + 0, linestyle='-')  # 实线 == solid
plt.plot(x, x + 1, linestyle='solid')

plt.plot(x, x + 4, linestyle='--') # 虚线 == dashed
plt.plot(x, x + 5, linestyle='dashed')

plt.plot(x, x + 8, linestyle='-.') # 长短点虚线 == dashdot
plt.plot(x, x + 9, linestyle='dashdot')

plt.plot(x, x + 12, linestyle=':')  # 点线 == dotted
plt.plot(x, x + 13, linestyle='dotted')
```

如果你喜欢更简洁的代码，linestyle 和 color 这两个参数是可以合并成一个非关键词参数，传递给 plot 函数的：

```py
plt.plot(x, x + 0, '-g')  # 绿色实线
plt.plot(x, x + 1, '--c') # 天青色虚线
plt.plot(x, x + 2, '-.k') # 黑色长短点虚线
plt.plot(x, x + 3, ':r')  # 红色点线
```

<div class="layout">

![线条风格的符号/文字表示](/matplotlib&numpy/plt-01-03.png =360x)

![线条风格和颜色的合成表示](/matplotlib&numpy/plt-01-04.png =360x)

</div>

### 2.3 调整坐标轴（标签和范围）

坐标轴的 Title 和 坐标轴名称 通过 plt.functionName() 来设置它们，而 标签（折线的名称）通过 plt.plot() 内部属性 label="" 进行设置：

```py
# 图标标题、坐标轴名称
plt.title("Sin Function")
plt.xlabel("x")
plt.ylabel("sin(x)")

# 折线的标签名称，记得一定要加 legend()
plt.plot(x, np.sin(x), label='sin(x)')
plt.ylim(x, np.cos(x), label='cos(x)')
plt.legend()  # 决定标签是否在坐标轴内显示
```

Matplotlib 会自动选择合适的坐标轴范围来绘制你的图像，但是有些情况下也需要自己进行相关调整。可以使用 plt.xlim() 和 plt.ylim() 函数调整坐标轴的范围。

```py
plt.xlim(-1, 11)
plt.ylim(-1.5, 1.5)

# 如果需要坐标轴反向，只需要将参数的顺序颠倒。
plt.xlim(10, 0)
plt.ylim(1.2, -1.2)
```

相关的函数还有 plt.axis()，这个函数只需要一个调用，传递一个 [xmin, xmax, ymin, ymax] 的列表参数即可。

```py
plt.axis([-1, 11, -1.5, 1.5])
```

当然了，plt.axis() 函数不仅能设置范围，还有一些其他的参数，例如：“off”、“on”、“tight”、“equal”、“sacled”、“auto”、“image”、“square”，具体请看 [plt.axis() 函数文档](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.axis.html)

```py
plt.axis('tight')  # 将坐标轴压缩到刚好足够绘制折线图的大小
plt.axis('equal')  # 使 x轴和 y轴使用相同长度的单位
```

我们还可以通过调整坐标轴的刻度，来设置范围和刻度之间的步长：

```py
x_ticks = np.arange(-5, 5, 0.5)
y_ticks = np.arange(-2, 2, 0.2)
plt.xticks(x_ticks)
plt.yticks(y_ticks)
```

<div class="layout">

![标题，名称，标签](/matplotlib&numpy/plt-01-05.png =360x)

![坐标轴刻度及范围](/matplotlib&numpy/plt-01-06.png =360x)

</div>

### 2.4 调整坐标轴（边框和样式）

不知道大家有没有注意到，我们所绘制的图标都是一个四方形的方框，有的时候看着难受，我就想把正弦函数画成笛卡尔坐标的样子，不带边框行吗，坐标轴中心在（0，0）点行吗。行。

```py
# 隐藏所有的坐标轴以及边框
plt.axis('off')

# 通过 ax.get_xxx() 函数隐藏 x 轴或 y 轴
ax = plt.gca()  # 获取当前坐标轴信息
ax.get_xaxis().set_visible(False)
ax.get_yaxis().set_visible(False)

# 通过 ax.spines[] 函数隐藏边框
ax = plt.gca()
ax.spines['right'].set_color('none')
ax.spines['top'].set_color('none')

# 调整坐标轴位置基准
ax = plt.gca()
ax.xaxis.set_ticks_position("bottom")  # 设置 x 轴的名称
ax.spines["bottom"].set_position(("data", 0))
ax.yaxis.set_ticks_position('left')  # 设置 y 轴的名称
ax.spines['left'].set_position(('data', 0))
```

<div class="layout">

![去除边框](/matplotlib&numpy/plt-01-07.png =360x)

![使坐标轴中心点位于0处](/matplotlib&numpy/plt-01-08.png =360x)

</div>

### 2.5 plt 函数向 ax 函数转换的规律

虽然大多数的 plt 函数都可以直接转化为 ax 的方法进行调用，例如：plt.plot() --> ax.plot()，plt.legend() --> ax.legend() 等等，但并不是所有的命令都能符合这样的设定。

还记得上一章说过的内容吗，ax 对象的方法，都可以通过 get_xxx 和 set_xxx 去进行获取和设置，因此 MATLAB 风格转化为面向对象方法的规律就是：

- plt.xlabel() --> ax.set_xlabel()
- plt.ylabel() --> ax.set_ylabel()
- plt.xlim() --> ax.set_xlim()
- plt.ylim() --> ax.set_ylim()
- plt.title() --> ax.set_title()

在面向对象接口中，逐个的调用方法来设置属性会比较麻烦，不优雅，更常见的是通过 ax.set() 方法来一次性的设置所有的属性：

```py
ax = plt.axes()
ax.plot(x, np.sin(x))
ax.set(xlim=(0, 10), ylim=(-2, 2), xlabel='x',
        ylabel='sin(x)', title='A Simple Plot')
```

## 3. 散点图

### 3.1 plot() 函数绘制散点图

上一节中，我们使用 plt.plot() 和 ax.plot() 来绘制了折线图，这两个方法同样可以绘制散点图。

```py
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-10, 20, 30)
y = 0.1*(x-5)**2 - 10
plt.plot(x, y, 'o', c='g')
plt.show()
```

传递给函数的第三个参数是一个使用字符表示的形状去绘制具体的点，简写字符符号实在是太多了，具体的请看 [plt.plot() 函数文档](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.plot.html)，值得注意的是，==如果第三个参数写成了 marker="o"，那么图形将会变成 **散点图 + 线性函数**。== 它相当于是写成了 plt.plot(x, y, '-og') 这个样子。

<div class="layout">

![plot()的散点图](/matplotlib&numpy/plt-01-09.png =360x)

![plot()的散点图加线性函数](/matplotlib&numpy/plt-01-10.png =360x)

</div>

### 3.2 scatter() 函数绘制散点图

更强大的绘制散点图的方法是使用 plt.scatter() 函数，它的属性方法其实和 plot() 类似：

```py
plt.scatter(x, y, marker='o')
```

它们之间的区别在于，scatter 可以针对每个点设置不同的属性（大小、填充颜色、边缘颜色等），还可以通过数据集合对这些属性进行设置。

让我们通过一个随机值数据集，绘制不同颜色和大小的散点图来说明。为了更好的查看重叠效果，我们还是用了 alpha 关键字参数对点的透明度进行了调整：

```py
rng = np.random.RandomState(0)  # 定义一个随机数种子
x = rng.randn(100)  # 和 rand 一样，不过服从正态分布
y = rng.randn(100)
colors = rng.rand(100)  # 随机产生一个 [0,1) 之间的 100 个值的数组
sizes = 1000 * rng.rand(100)
# cmap 是指将具体的数值映射到颜色范围中，viridis 是默认值
plt.scatter(x, y, c=colors, s=sizes, alpha=0.3, cmap='viridis')
plt.colorbar()  # 显示颜色对比条
```

![散点图晕染效果](/matplotlib&numpy/plt-01-11.png =560x)

### 3.3 plot 和 scatter 性能对比

除了上面说的两个函数对于每个散点不同属性的支持不同之外，还有别的因素影响对这两个函数的选择吗？对于小的数据集来说，两者并无差异；但当数据增长到几千个点时，plot() 会明显比 scatter() 的性能要高。

造成这个差异的原因是，plt.scatter 支持每个点使用不同的大小和颜色，因此渲染每个点时需要完成更多额外的工作。而 plt.plot 来说，每个点都是简单的复制另一个点产生，因此对于整个数据集来说，确定每个点的展示属性的工作仅需要进行一次即可。

对于很大的数据集来说，这个差异会导致两者性能的巨大区别，因此，对于大数据集应该优先使用 plt.plot 函数。

## 4. 参考文献

### 4.1 画布结构与属性

[Matplotlib：绘图结构详解，Artist、Figure、Axes 和 Axis 的联系与区别](https://blog.csdn.net/u010021014/article/details/110393223)

[Matplotlib 使用教程(保姆级说明教程)](https://zhuanlan.zhihu.com/p/399679043)

[Matplotlib 入门详细教程](https://zhuanlan.zhihu.com/p/342422162)

[Matplotlib 官方中文文档](https://www.matplotlib.org.cn/)

### 4.2 常见图及属性

[全文 40000 字，最全(最强) Matplotlib 实操指南](https://zhuanlan.zhihu.com/p/388287863)

[Matplotlib：设置坐标轴范围，刻度，位置，自定义刻度名称，添加数据标签](https://blog.csdn.net/HHG20171226/article/details/101294381)

[matplotlib 隐藏坐标轴和边框](https://zhuanlan.zhihu.com/p/524724909)

[numpy.random.RandomState()函数用法详解](https://blog.csdn.net/weixin_42782150/article/details/102841192)
