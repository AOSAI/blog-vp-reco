---
title: Python桌面压缩图片小工具 # 文章标题
# cover: /assets/images/cover1.jpg  # 自定义封面图片
# icon: file  # 页面的图标，在title的左侧
order: 1 # 侧边栏的顺序
author: AOSAI # 设置作者
date: 2023-08-28 # 设置写作时间
# 一个页面可以有多个分类
category:
  - 软件开发
  - 桌面程序
# 一个页面可以有多个标签
tag:
  - Python
  - wxPython
  - Pillow
  - OpenCV

sticky: false # 此页面会在文章列表置顶
star: false # 此页面会出现在文章收藏中
footer: 等我攒够六便士，就去寻找月亮 # 自定义页脚
copyright: AOSAI # 你可以自定义版权信息
---

## 序言

萌生出自己做一个压缩图片的小工具的起因啊，一方面是刚好我和我的朋友都打算未来，拍拍照写写博客，但是网络图片一般都要求限制大小，不然渲染以及加载会体验变差，另一方面呢是我刚好在重新刷 python 的书，刚好看到 GUI 图形编程了，就直接上手练练。现在做的差不多了，来写个博客，记录一下。

## wxPython 主程序界面

GUI 图形编程有很多成熟的库，书上介绍的 wxPython，所以我也就用的这个，当然，最后还是查了官方文档，书毕竟还是介绍的有限。代码我这里就不具体细讲了，我就挑些有意思的地方，有需要看看书《Python 从入门到精通》，b 站看看视频，或者直接去看官方文档也可以。

这个小工具的主界面呢，我用了类似前端弹性布局的 BoxSizer，他同样也有栅格布局，但是讲真的，用起来我觉得比前端的差了好大一截。我们看下方的代码，虽然我们可以用 flag 属性去控制目标左端对齐、居中对齐等，但是如果不仔细计算总的长宽、border 大小、目标的大小，最后还是达不到我们想要的样子，所以基本上，这个布局呢，相当于也是写死了的。另外，我们先用 layout_row1 容器填充的第一行，再用 layout_row2 填充第二行，再用 layout_root 把前两个容器竖着填充进去，才写成栅格的样式，如果用 flex，直接一次就写完了，所以习惯写前端的人，肯定用这个会疯狂吐槽。

::: tabs#wxPython1

@tab 主程序代码#main_code

```
import wx
import CompressPhotos as CP

class RootFrame(wx.Frame):
    def __init__(self, parent, id):
        wx.Frame.__init__(self, parent, id, 'AOSAI的实用工具集', size=(800, 600))
        panel = wx.Panel(self)

        self.bt_compress_pictures = wx.Button(
            panel, label='批量压缩图片', size=(340, 240))
        self.bt_compress_pictures.Bind(wx.EVT_BUTTON, self.CompressPictures)
        self.bt_undefine1 = wx.Button(panel, label='等待开发', size=(340, 240))
        self.bt_undefine2 = wx.Button(panel, label='等待开发', size=(340, 240))
        self.bt_undefine3 = wx.Button(panel, label='等待开发', size=(340, 240))

        font = wx.Font(24, wx.DEFAULT, wx.FONTSTYLE_NORMAL, wx.NORMAL)
        self.bt_compress_pictures.SetFont(font)
        self.bt_undefine1.SetFont(font)
        self.bt_undefine2.SetFont(font)
        self.bt_undefine3.SetFont(font)

        layout_row1 = wx.BoxSizer(wx.HORIZONTAL)
        layout_row1.Add(self.bt_compress_pictures, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.LEFT | wx.RIGHT, border=40)
        layout_row1.Add(self.bt_undefine1, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.RIGHT, border=40)

        layout_row2 = wx.BoxSizer(wx.HORIZONTAL)
        layout_row2.Add(self.bt_undefine2, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.LEFT | wx.RIGHT, border=40)
        layout_row2.Add(self.bt_undefine3, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.RIGHT, border=40)

        layout_root = wx.BoxSizer(wx.VERTICAL)
        layout_root.Add(layout_row1, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.TOP | wx.BOTTOM, border=30)
        layout_root.Add(layout_row2, proportion=0,
                        flag=wx.ALIGN_CENTER | wx.BOTTOM, border=30)
        panel.SetSizer(layout_root)

    def CompressPictures(self, event):
        app_compress = wx.App()
        frame_compress = CP.CompressFrame(parent=None, id=-1)
        frame_compress.Show()
        app_compress.MainLoop()


if __name__ == '__main__':
    app = wx.App()
    frame = RootFrame(parent=None, id=-1)
    frame.Show()
    app.MainLoop()
```

@tab 运行结果#output1

![](/software/code_desktop/01_wxPython_main.png)

:::

这个小工具箱之后肯定是会继续扩展的，所以我选择了模块化的方式，将其分割成了多个 Python 文件进行书写，我看到官方文档中其实是有子程序的写法的，但是真的很丑，不是我喜欢的风格，放弃了。

## wxPython 压缩程序界面

这个压缩小程序我想用户可以做的事是：

- 指定压缩的目标值（多少 KB），一般网络图片都会控制在 200KB 之内
- 指定文件的输出路径（可选）‘
- 通过文件管理器选择需要压缩的图片
- 选择压缩方式（后加的，因为 Pillow 压缩不了 PNG 格式图片）

因为是在练手，加上这个布局的特殊性，这次我选择了通过 pos，元素的左上角位于哪个像素点，再加上 size，元素的大小，将布局写死，固定为这个形式。

按钮的事件响应呢，需要先绑定响应事件的函数。通过 self.按钮的变量名称.Bind(wx.EVT_BUTTON, self.函数名称)这样一种形式进行绑定。

::: tabs#wxPython2

@tab 压缩程序界面代码#compress_layout_code

```
import wx

class CompressFrame(wx.Frame):

    photo_list = ()

    def __init__(self, parent, id):
        wx.Frame.__init__(self, parent, id, '批量图片压缩工具', size=(500, 600))
        panel = wx.Panel(self)

        self.label_expect_size = wx.StaticText(
            panel, label="1.预期压缩后的图片为多少KB：请输入罗马数字,\n常见单位转换：1MB=1024KB，2MB=2048KB", pos=(60, 60), size=(370, 40))
        self.text_expect_size = wx.TextCtrl(
            panel, style=wx.TE_LEFT, pos=(60, 105), size=(370, 30))
        self.label_expect_filePath = wx.StaticText(
            panel, label="2.预期存放的文件夹路径：如果未指定路径，默认会在第一张照片\n的路径中，创建新的文件夹CompressedPhotos。例：D:\Blog", pos=(60, 155), size=(370, 40))
        self.text_expect_filePath = wx.TextCtrl(
            panel, style=wx.TE_LEFT, pos=(60, 200), size=(370, 30))

        methods_list = ["OpenCV", "Pillow"]
        self.method_choose_rbox = wx.RadioBox(panel, label="3.请选择压缩方式：JPG/JPEG(Pillow),PNG(OpenCV)", pos=(
            60, 240), choices=methods_list, majorDimension=1, style=wx.RA_SPECIFY_ROWS)

        self.label_select_photos = wx.StaticText(
            panel, label="4.请选择想压缩的图片：仅支持JPG(JPEG)、PNG格式", pos=(60, 310), size=(370, 30))
        self.bt_select_photos = wx.Button(
            panel, label='选择图片', pos=(60, 340), size=(370, 30))
        self.bt_select_photos.Bind(wx.EVT_BUTTON, self.SelectPhotos)

        self.bt_start_compress = wx.Button(
            panel, label="开始压缩", pos=(100, 440), size=(120, 40))
        self.bt_start_compress.Bind(wx.EVT_BUTTON, self.StartCompress)
        self.bt_reset = wx.Button(
            panel, label="清空重置", pos=(260, 440), size=(120, 40))
        self.bt_reset.Bind(wx.EVT_BUTTON, self.ResetData)

    def StartCompress(self, event):
        pass

    def ResetData(self, event):
        pass

    def SelectPhotos(self, event):
        pass

```

@tab 运行结果#output2

![](/software/code_desktop/01_compress_layout.png)

:::

## 按钮事件响应函数的实现

在实现事件响应前，得先理清我们需要做什么。

清空重置：最简单，将上方 TextCtrl 里的字符串都清空，把单选框回归到第一个选项。

选择图片：对于程序员而言，写文件路径，进行图片压缩是没问题的，但是对于用户而言，当然还是通过图形界面的文件选择器来选择图片合适，所以首先就是要实现文件选择器的功能。其次，我们要将取得的图片文件的路径保存到一个序列里面，对其进行格式的筛选判断，如果有非 JPG、PNG 格式的照片，需要提醒用户重新进行选择。

开始压缩：这个函数内的判断最多。首先因为文件输出路径是可选的，我们要对输出文件路径进行判断，得出一个正确的输出路径。其次，要判断用户输入的目标文件大小是否正确，是否是数值类型，因为输入框得到的数据都是字符串 str，我们还需要将其类型转换变成 int 类型。第三，我们要判断需要压缩的图像，是否已经读取到，是否用户已经成功选择了图像。第四，才是开始压缩这个步骤。

```
import tkinter as tk
from tkinter import filedialog
import re

class CompressFrame(wx.Frame):

    photo_list = ()

    def StartCompress(self, event):
        expect_folder = ""
        expect_size = 200
        size = self.text_expect_size.GetValue()
        if size != "" and re.search('[^\d]', size) != None:
            wx.MessageBox("您输入的期望压缩值有误，请修改。")
            return 0
        else:
            expect_size = int(size)

        if self.photo_list == ():
            wx.MessageBox("您还未选择需要压缩的图片！")
            return 0

        if self.text_expect_filePath.GetValue() == "":
            base_path = os.path.dirname(self.photo_list[0])
            expect_folder = base_path + "/CompressedPhotos"
            if not os.path.exists(expect_folder):
                os.mkdir(expect_folder)
        else:
            path = self.text_expect_filePath.GetValue()
            if os.path.isdir(path):
                expect_folder = path
            else:
                wx.MessageBox("您输入的目标文件夹路径有误！\n请重新修正！")
                return 0

    def ResetData(self, event):
        self.text_expect_size.Clear()
        self.text_expect_filePath.Clear()
        self.method_choose_rbox.SetStringSelection("OpenCV")

    def SelectPhotos(self, event):
        select = tk.Tk()
        select.withdraw()

        # folder_path = filedialog.askdirectory()   # 选择文件夹
        file_path = filedialog.askopenfilenames()   # 选择多个文件

        for index, item in enumerate(file_path):
            if not item.endswith(".jpg") and not item.endswith(".jpeg") and not item.endswith(".png"):
                wx.MessageBox("您选择的图片存在格式错误的情况！\n请重新选择！")
                break
            if index == (len(file_path) - 1):
                self.photo_list = file_path
```

## 压缩图像的实现（Pillow、OpenCV）

图片压缩的原理，简单来说就是，我们把一张图片提取成矩阵形式，经过算法进行一系列的矩阵运算后，可以出现很多个零，这个零越多，就意味着可以压缩的比例越大。

JPG、JPEG 这个格式的图片呢，最常用于网络传输，但它在不改变图像尺寸，也就是分辨率的情况下，如果压过头，就会失真很严重，它是有损压缩。

PNG 这个格式的图片是无损压缩，他是可逆的。也就意味着一般情况下，PNG 格式的照片会比 JPG 的要大。

我们将压缩图像的功能，封装到一个函数中，批量压缩的实现呢，循环调用这个函数即可。

Pillow 的压缩代码很简单，先用 PIL 模块中的 Image 方法打开图片，再用 save 保存的时候，选择保存的质量 quality 即可。一般要求 quality 不能大于 95，不然压缩可能无效。

OpenCV 的压缩代码基本和 Pillow 类似，但是存在一个问题，OpenCV 原本是不支持中文路径的，可能只能支持英文路径，而我们日常使用大概率都会有中文，不管是文件夹名称，还是图片名称，所以我们要进行一个可以读取中文路径的修正。

::: tabs

@tab Pillow 压缩 JPG/JPEG

```
def _CompressByPillow(self, input, output, expect_size, quality1=95):
    # 将原图的单位转化成KB  Bytes/1024=KB
    photo_size = os.path.getsize(input) / 1024

    while photo_size > expect_size:
        img = Image.open(input)
        img.save(output, quality=quality1)
        if quality1 <= 0:
            break
        quality1 -= 5
        # 将压缩后的图片单位转化为KB，同时赋值给photo_size，进行循环判断
        photo_size = os.path.getsize(output) / 1024
```

@tab OpenCV 压缩 PNG 原版

```
def _CompressByOpenCV(self, input, output, expect_size, ratio=1):
        photo_size = os.path.getsize(input) / 1024

        while photo_size > expect_size:
            img = cv2.imread(input, 1)
            cv2.imwrite(output, img, [cv2.IMWRITE_PNG_COMPRESSION, ratio])
            if ratio >= 9:
                break
            ratio += 1
            photo_size = os.path.getsize(output) / 1024
```

@tab OpenCV 可读取中文路径

```
def _CompressByOpenCV(self, input, output, expect_size, ratio=1):
    photo_size = os.path.getsize(input) / 1024

    while photo_size > expect_size:
        img = cv2.imdecode(np.fromfile(input, dtype=np.uint8), 1)
        params = [cv2.IMWRITE_PNG_COMPRESSION, ratio]
        cv2.imencode('.png', img, params)[1].tofile(output)
        if ratio >= 9:
            break
        ratio += 1
        photo_size = os.path.getsize(output) / 1024
```

@tab 循环批量调用

```
def StartCompress(self, event):
    # 验证等省略，见上一个代码块

    method_name = self.method_choose_rbox.GetStringSelection()
        if method_name == "Pillow":
            for index, item in enumerate(self.photo_list):
                new_photo = expect_folder + "/" + str(index) + ".jpeg"
                self._CompressByPillow(item, new_photo, expect_size)
            os.startfile(expect_folder)
            self.ResetData(wx.EVT_BUTTON)
        if method_name == "OpenCV":
            for index, item in enumerate(self.photo_list):
                new_photo = expect_folder + "/" + str(index) + ".png"
                self._CompressByOpenCV(item, new_photo, expect_size)
            os.startfile(expect_folder)
            self.ResetData(wx.EVT_BUTTON)
```

:::

## 二分法优化压缩步骤

我在已有的博客中，借鉴了循环压缩的方法：从高质量不断递减。如果是 PNG 倒还好，压缩比率只是 0-9，最多也就 9 次，但是 JPG 从 95 每次减 5，最极端情况递减到 0，这可就是 20 次，一张图片 20 次循环，100 张图片，那个处理效率就会爆炸，因此，打算通过二分法寻找最优解。

我们给定一个左边界 left，一个右边界 right，中间值 mid=(left+right)/2。如果在中间值 mid 的压缩质量下，输出图片大小高于目标大小，我们让右边界 right=mid，如果在中间值 mid 的压缩质量下，输出图片大小小于目标大小，我们就让左边界值 left=mid，然后再循环进行比较。终止条件就是 rigth - left <= 2。

::: tabs

@tab 优化后的 Pillow

```
def _CompressByPillow(self, input, output, expect_size):
    photo_size = os.path.getsize(input) / 1024
    left = 0
    right = 100
    while True:
        mid = int((left+right)/2)
        img = Image.open(input)
        img.save(output, quality=mid)
        photo_size = os.path.getsize(output) / 1024
        if right - left <= 1:
            break
        if photo_size >= expect_size:
            right = mid
        else:
            left = mid
```

@tab 优化后的 OpenCV

```
def _CompressByOpenCV(self, input, output, expect_size):
    photo_size = os.path.getsize(input) / 1024
    left = 0
    right = 9
    while True:
        mid = int((left+right)/2)
        img = cv2.imdecode(np.fromfile(input, dtype=np.uint8), -1)
        params = [cv2.IMWRITE_PNG_COMPRESSION, mid]
        cv2.imencode('.png', img, params)[1].tofile(output)
        photo_size = os.path.getsize(output) / 1024
        if right - left <= 1:
            break
        if photo_size >= expect_size:
            left = mid
        else:
            right = mid
```

:::

## 增加压缩过程进度条

图片如果太多，压缩是要一定过程的，如果没有进度条，用户不知道到底多久才能完成，就会造成体验降低的结果。因此我们添加一下这个功能。

这里用到了 tkinter 模块的 geometry 方法，它可以生成一个大小为自定义的显示框。然后使用 tkinter.ttk 模块，向其中添加进度条。进度条的变动，是需要和压缩的循环体结构挂钩的，每压缩一个，进度增加一个。此处代码仅拿 JPG 循环体举例，PNG 是一样的。

```
import tkinter as tk
from tkinter import ttk
import time

root = tk.Tk()
    root.geometry('500x100')
    progress = ttk.Progressbar(root)
    progress.pack(pady=20)
    progress['length'] = 400
    progress['maximum'] = len(self.photo_list)
    progress['value'] = 0

    method_name = self.method_choose_rbox.GetStringSelection()
    if method_name == "JPG/JPEG":
        for index, item in enumerate(self.photo_list):
            new_photo = expect_folder + "/" + str(index) + ".jpeg"
            self._CompressByPillow(item, new_photo, expect_size)
            progress['value'] += 1
            root.update()
            time.sleep(0.05)
        root.destroy()
        os.startfile(expect_folder)
        self.ResetData(wx.EVT_BUTTON)
```

## 打包成 exe 文件

Python 文件打包常见的有 Pyinstaller 和 Nuitka，这里我们选择使用前者。

首先先配置一个虚拟环境，Python 文件的打包啊，他会扫描当前环境下的所有模块，如果下载的没有用到的模块很多，或者直接使用了 Anaconda，那打包出来的文件就会非常大。如果使用 Anaconda，可以直接使用它自带的 conda 虚拟环境工具。分为四个步骤：创建环境，激活环境，下载需要的模块，开始打包。

```
# 创建Python版本为x.x的虚拟环境
conda create -n folder_name python==x.x

# 激活使用
conda activate folder_name

# 本次虚拟环境需要安装的模块
pip install wxPython
pip install opencv-python
pip install numpy
pip install Pillow

# 先创建 .spec文件，按照自己需求修改里面内容
pyi-makespec -w main.py

# 再开始打包
pyinstaller main.spec
```

关于打包的内容详细我还写了另一篇博文，有兴趣可以看看：[Python 文件打包成 Exe 文件](02_file_packaging.md)

完稿时间：2023 年 9 月 2 日
