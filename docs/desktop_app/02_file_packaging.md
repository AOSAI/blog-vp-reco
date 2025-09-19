---
title: Python文件打包exe方法 # 文章标题
# cover: /assets/images/cover1.jpg  # 自定义封面图片
# icon: file  # 页面的图标，在title的左侧
order: 2 # 侧边栏的顺序
author: AOSAI # 设置作者
date: 2023-08-30 # 设置写作时间
# 一个页面可以有多个分类
category:
  - 软件打包
# 一个页面可以有多个标签
tag:
  - Python
  - Pyinstaller
  - Nuitka
  - Mingw64

sticky: false # 此页面会在文章列表置顶
star: false # 此页面会出现在文章收藏中
footer: 等我攒够六便士，就去寻找月亮 # 自定义页脚
copyright: AOSAI # 你可以自定义版权信息
---

## 为什么要打包

众所周知，Python 文件不能在没有安装 Python 环境的机器上运行，所以需要通过打包这样的方式，让其可以在任何电脑上直接使用。打包方式应该会很多，但我目前查到的，有两种用的较多的打包方式，Nuitka 和 Pyinstaller。

## Pyinstaller 打包

### 打包单个文件

```
pip install pyinstaller     # 下载安装命令

# 打包命令的常用基础操作
Pyinstaller -F xxx.py   # 打包exe
Pyinstaller -F -w xxx.py    # 不带控制台打包
Pyinstaller -F -w -i xxx.ico xxx.py    # 指定exe图标打包
```

### 设置虚拟环境

这样打包简单是简单了，但是打包过程极慢，而且 exe 文件的体积也是巨大。有知乎大佬说，是因为 Anaconda 内置了很多库，打包的时候打包了很多不必要的模块进去，所以需要纯净的 Python 来打包。

我们可以模拟一个新的环境，其中只安装本次打包所需要的模块即可。Anaconda 本身就可以做到，conda 安装的虚拟环境，会将目录生成在 anaconda 安装目录的 env 目录下。

```
conda create -n folder_name python==x.x     # 创建虚拟环境
conda activate folder_name      # 激活虚拟环境
conda deactivate        # 退出虚拟环境

conda info --envs       # 查看conda环境下的所有虚拟环境
conda list          # 在激活虚拟环境后，此命令可以查看已经安装的库
conda remove -n folder_name/all     # 删除指定/全部虚拟环境
```

### 打包多个文件

我们通过修改 .spec 文件实现多个文件、资源打包。

```
pyi-makespec -w main.py   # 生成 main.spec文件
```

打开 .spec 文件，将其余的 py 文件按相同格式添加到 main.py 后面，把文件夹类的添加到 binaries 中，spec 中还有很多参数，具体请查阅相关资料。

```
pyinstaller main.spec  # 打包操作
```

## Nuitka 打包指南（windows）

### 安装 C 编译器

首先要安装 C 语言/C++的编译器，[Mingw64 下载网址](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/mingw-w64-release/)，这里我也踩了个坑，我下的 8.x 的版本，但是打包的时候用了 --mingw64，告诉我要 11 版本的，最后查阅文档才发现 win 系统要求必须基于 gcc11.2 或者更高，macOS 需要用 clang 编译器。报错给我的新的文件下载路径是[Mingw64_11](https://github.com/brechtsanders/winlibs_mingw/releases/download/11.3.0-14.0.3-10.0.0-msvcrt-r3/winlibs-x86_64-posix-seh-gcc-11.3.0-llvm-14.0.3-mingw-w64msvcrt-10.0.0-r3.zip)

下载完解压之后不要忘记配置环境变量（windows11）：
系统 -> 系统信息 -> 高级系统设置 -> 环境变量 -> 系统变量 -> Path
-> 新建路径为 Mingw64 的 bin 目录文件路径。例如我的：D:\Mingw64\mingw64\bin

命令行界面中通过 gcc -v，测试环境配置是否成功。

### Nuitka 基本操作

网上现有的教程，都还停留在 0.6 版本、1.0 版本，很多的方法在迭代的过程中已经被更替了，这就导致我花费了很长的时间，去查阅相关文档。这个官方文档找它也是费了我一番功夫，在我之前的经验里，搜索引擎直接搜索，是会有合适的正确的文档在内的，但是这个它只有最老版本的中文文档显示，所以我找到了 Github 里去，终于找到了最新的。

同时这里贴两篇知乎大佬的博文，以及附上官方的文档。虽然知乎大佬写的文章，有些关于--plugin-enable 的内容已经不适用了，但是如果按照它的版本去做，也还是能行的。官方的文档里有每次升级，做的整改的记录，有利于我们对比学习。

[知乎：Python 打包 exe 的王炸-Nuitka](https://zhuanlan.zhihu.com/p/133303836)
[知乎：Nuitka 之让天下的 Python 都可以打包](https://zhuanlan.zhihu.com/p/137785388)
[Nuitka 官方文档](https://nuitka.net/index.html)

```
# 下载Nuitka模块，目前下载的稳定版本是1.8
pip install Nuitka
# 如果要下载指定版本，用 =x.x.x 连接
pip install Nuitka=x.x.x
# 查看Nuitka的版本等信息
pip show Nuitka

# 简单打包单个文件
python -m nuitka --follow-imports main.py
```

以上就是基本的操作，大体框架是没有变动的，变动的是类似 --plugin-enable=numpy 这样的参数。
使用 nuitka --help 命令可以查看所有参数。本次我用到的命令有这些：

```
python -m nuitka --mingw64 --windows-disable-console --nofollow-imports --standalone --plugin-enable=no-qt CompressPhotos.py

python -m nuitka --mingw64 --windows-disable-console --nofollow-imports --standalone --plugin-enable=no-qt Main.py

# --output-dir：设置输出的目标文件夹
# --follow-imports：将 mian.py 中 import 的所有文件或模块一同打包
# --standalone：让生成的 exe 文件脱离 python 环境
# --show-progress：cmd 中可以显示 nuitka 的打包过程
# --windows-disable-console：去掉 CMD 控制窗口
# --plugin-enable=tk-inker：打包 tkinter 模块的刚需
```

1.0 版本的时候，像 numpy、pandas、matplotlib 这样的第三方模块，是以 --plugin-enable=numpy 的形式出现的，现在已经不这么写了，像 PIL 模块，以及 Numpy 模块都已经放在了 anti-bloat 里了，而 anti-bloat 它是默认自动使用的，所以我们可以直接不用写进去。

## Pyinstaller 与 Nuitka 打包的对比

第一：经过试验呢，Python 的第三方库的多少，对于两者的 的打包大小都是有影响的，所以如果用的 Anaconda 环境的朋友，一定要用 conda 配置新的虚拟环境，以减少第三方库的不必要导入。

Pyinstaller 原始环境打包后：300 多 MB；虚拟环境打包后：180 多 MB
Nuitka 原始环境打包后：800 多 MB；虚拟环境打包后：190MB

第二：现阶段，两者打包后的结构非常的相似，在默认输出文件夹 dist 里面，像 Pillow、CV2 这种第三方模块，都是使用的 .dll 托管模式。Nuitka 的打包命令十分复杂，而 Pyinstaller 很简单，并且打包速度更快，UPX 压缩在目前版本里，也是自动开启的。所以我个人觉得 Pyinstaller 更好用一些。
