---
title: PyQt5使用及踩坑小记 # 文章标题
# cover: /assets/images/cover1.jpg  # 自定义封面图片
# icon: file  # 页面的图标，在title的左侧
order: 3 # 侧边栏的顺序
author: AOSAI # 设置作者
date: 2023-09-06 # 设置写作时间
# 一个页面可以有多个分类
category:
  - 软件开发
  - 桌面程序
# 一个页面可以有多个标签
tag:
  - Python
  - PyQt5
  - QStackedWidget
  - 踩坑记录

sticky: false # 此页面会在文章列表置顶
star: false # 此页面会出现在文章收藏中
footer: 等我攒够六便士，就去寻找月亮 # 自定义页脚
copyright: AOSAI # 你可以自定义版权信息
---

## 序言

我本来是没打算学 Qt 的，但是因为之前使用 wxPython 的时候看那些博主说 Qt 多么多么好，吊打其他桌面开发，还有拖拽化的界面开发工具；再加上我看书看到网络爬虫的时候，最后项目实战那块用到了 Qt，所以择日不如撞日，那就学一下吧。

这一学可算是，给我头皮都快学炸了，踩的坑那叫一个络绎不绝，人山人海，川流不息…… 本着一切的牛鬼蛇神都源自于火力不足的思想，我又开始记录博客了。Let's go.

[PyQt5 中文教程](https://maicss.gitbook.io/pyqt-chinese-tutoral/pyqt5)
[PtQt5 官方文档英语](https://doc.qt.io/qtforpython-5/index.html)
[常用控件名称及方法大全](https://blog.csdn.net/weixin_53989417/article/details/128941319)
[CSDN 大佬整理的合集 PyQt6](https://dengjin.blog.csdn.net/article/details/115174639?ydreferer=aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2RlbmdqaW4yMDEwNDA0MjA1Ni9hcnRpY2xlL2RldGFpbHMvMTE1MzI4Mjg0)
[CSDN PtQt5](https://blog.csdn.net/yurensan/article/details/121055733)

## PyQt 的窗体组件

Qt 一共有四个窗体组件，分别是 QWidget、QMainWindow、QDialog、QFrame。在 Qt 中所有的类都有一个共同的基类 QObject。QWidget 直接继承于 QPaintDevice 类，而 QMainWindow、QDialog、QFrame 直接继承于 QWidget 类。

**QWidget：**
QWidget 类是所有用户界面对象的的基类，它从窗口系统接收鼠标、键盘和其他事件，并在屏幕上绘制自己。QWidget 可以是顶级窗口，也可以是其他窗口的子窗口。QWidget 的构造函数可以接收两个参数，其中第一个参数是该窗口的父窗口；第二个参数是该窗口的 Flag，也就是 Qt.WindowFlags。

他就相当于前端开发中的浏览器主界面一样，我们前端写 HTML、CSS 的时候，那些文本控件、输入框、单选框、复选框等等，都可以看作画在浏览器中的，浏览器就是画布，我们还可以把画布分成多个区域，QWidget 也是同样的道理。

**QMainWindow：**
QMainWindow 类叫做主应用程序窗口，它封装了菜单栏、工具栏、状态栏等控件。所以一般都作为桌面程序开发的主界面首选。

**QDialog：**
QDialog 类是对话框窗口的基类。对话框窗口主要用于短时期任务以及与用户进行简要通讯的顶级窗口。
顶级窗口：一个不会被嵌入到父窗口的窗口部件叫做顶级窗口。
非顶级窗口：子窗口部件，一般都嵌入到父窗口之中，视觉角度看不出来与父窗口的区别，融为一体。

**QFrame：**
QFrame 类是有框架的窗口部件的基类。它绘制部件并且调用一个虚函数 drawContents（）函数来填充这个框架。这个函数是被子类重新实现的。QFrame 类也可以之间创建没有任何内容的简单框架，尽管通常情况下，要用到 QHBox 或 QVBox，因为它们可以自动布置你放到框架的窗口部件。

## QStackedWidget 组件

QStackedWidget 继承自 QFrame。它提供了多页面切换的布局，一次只能看到一个界面。

它其实就是一个容器，我们把创建好的子界面 QWidget 通过 addWidget()这个方法，添加到容器中，通过 setCurrentIndex() 或者 setCurrentWidget() 方法来切换需要被显示的页面。

包含的方法（函数）有：

addWidget(QWidget):添加页面，并返回页面对应的索引。
count():获取容器中页面的数量。
currentIndex():获取当前页面的索引。
currentWidget():获取当前页面。
indexOf(QWidget):获取指定页面的索引。
insertWidget(index,QWidget):在索引 index 位置添加页面
removeWidget(QWidget):移除指定子页面。并没有被删除，只是从布局中移动，从而被隐藏。
widget(index):返回索引值为 index 的组件。

setCurrentIndex(index):根据索引值，显示页面。
setCurrentWidget(QWidget):根据子窗口对象显示页面。

currentChanged(index):当页面发生变化的时候被调用，index 为新的索引值。
currentRemoved(index):当页面被移除的时候被调用，index 为页面对应的索引值。

## 提示窗组件

QMessageBox 组件继承于 QWidget。

```
# 软件关闭提示框：是否需要退出整个软件
a = QMessageBox.question(self, '退出', '你确定要退出吗?', QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
if a == QMessageBox.Yes:
    event.accept()        #接受关闭事件
else:
    event.ignore()        #忽略关闭事件

# 信息提示框：提示一些基本信息
QMessageBox.information(self, "标题", "我很喜欢学习python")

# 错误提示框：用户出现错误操作，必须要进行处理
QMessageBox.critical(self, "错误", "系统错误")

# 警告提示框：提示用户最好操作什么，警示用户操作
QMessageBox.warning(self, "警告", "如果再不学习,你会被淘汰")

# 关于提示框：给用户展示系统信息，软件介绍，公司介绍之类的
QMessageBox.about(self, "关于", "本文作者QQ 8594969")
```

## 踩坑记录

### QMainWindow

我想把之前做的，图片压缩工具重新写在 Qt 框架里，因为内容不多，如果写成一个菜单，里面两个子菜单，这样子，不太符合我的审美，所以我就想，尽可能的把所有能切换子界面的按钮，平铺在一个界面里。就相当于一个网页中常见的，最上方的导航栏、还有下方的内容界面，内容界面作为一个容器可以通过导航栏切换不同的子界面。

1. 我首先尝试了菜单栏，但是菜单栏的一级菜单是不存在事件绑定的，只有子菜单才可以绑定事件，行，换。

2. 我又尝试了使用工具栏，普通的工具栏 toolBar 很奇怪，绑定事件的时候必须要图片，我尝试更改 toolButtonStyle 的方式让其只显示文字，刚开始是成功了的，点击事件的响应也是没有问题的。但是我将子界面切换的方法，换成 QStackedWidget 方式后，三个工具栏按钮前两个失效了。很迷。

3. 最后我把菜单栏、工具栏这些全部去了，用不同的 QWidget 窗口分割了主窗口，最上方用 QPushButton 作为导航。

### 子页面切换

子页面切换我在网上就找到两种方式，一种是使用 show/hidden 的方式，让现在显示的页面隐藏，让目标页面显示。另一种是使用 QStackedWidget 的方式。

show/hidden 的方式，由于每一次都需要把不同的子窗口，先隐藏，再使用 setCentralWidget 重新绘制在页面上，所以软件会闪跳，用户体验非常差，不推荐使用这种方式去切换子界面。

QStackedWidget 的方式很好用，但是最开始我只能在 class 内，创建新的子窗口使用，由于我喜欢分割模块，好几天的时间里，我 import 组件的子窗口都打不开。但是这个坑是我自己的问题，我忘记调用 class 类需要初始化了，直接调用就会报错，因为代码虽然在，但是这个东西没有被实例化，用不了。

### Qt Desinger

说实话，我对这个图形化编程界面的体验感，不是特别好。因为它最后生成的代码，真的看着很臃肿。不过可以作为，熟悉各种控件的一个工具。作为一个大前端出身的程序员，我推荐大家还是编程式开发这些东西。

### self 的使用

我刚开始确实没太理解，为什么 Desinger 自动生成的代码里，所有的控件都以 self 开头，很多博主也是。后来啊，盲生发现了华点。

第一个用法，它就相当于把这个变量声明为成员变量。我们知道函数是有作用域的，如果一个 class 中，函数一想要调用函数二的变量，那是不可能的，我们要把这个变量，变成类所属的变量，这样作用域提升，就可以所有函数都能调用了。

```
self.button = QPushButton()
```

第二个用法，指定父亲。self 代表这个类本身，以这个水平布局为例，加上 self 就表示这个布局的容器是 self，亦或者，指定这个子窗口继承 self 这个父窗口。

```
hbox = QHBoxLayout(self)
newPage = QWidget(self)
```
