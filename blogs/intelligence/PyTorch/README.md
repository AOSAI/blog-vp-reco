---
title: PyTorch入门手册
order: 0
author: AOSAI
date: 2024-09-11
category:
  - PyTorch
tag:
  - PyTorch基础
  - PyTorch安装教程
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

PyTorch 和 Tensorflow 都是当下最流行的 AI 框架，我看了一些视频和博客的对比，我觉得选择 PyTorch 的原因可以概述为两点：

1. Tensorflow 的是有一套完整的生产力体系的，很成熟，但是同样也相对来说比较大，比较复杂。对于机器学习入门者或者学校的科研人员而言，PyTorch 更简洁、更简单。

2. 因为 Tensorflow1.x 版本的一些不太友好使用体验，导致 PyTorch 迅速的占据市场。也是因此，过往这些年的大量学术论文，都是基于 PyTorch 写的（有数据统计 2022 年 PyTorch 已经占据顶会 80%的论文）。说句不好听的，现在硕士生做研究，基本上都是站在前人的肩膀上，删删改改，因此硕士生选择 Pytorch 做框架为最优解。

看过我《机器学习》博文的朋友，一定知道吴恩达教授的案例，全都是拿 Tensorflow 写的，对于 PyTorch 我也是从头开始，不过不要慌，它的很多内容和 Numpy 还是很相似的。

配置 PyTorch 的一般流程：

1. 检查显卡是否有 GPU，检查显卡的驱动是否为最新
2. 检查是否安装了 CUDA Toolkit (nvidia)，按照适配版本下载或更新。
3. 安装和配置 Python
4. 安装 Pytorch

## 1. GPU 和 显卡驱动

一般英伟达的显卡都是有 GPU 模块的，我们可以从 **任务管理器 --> 性能** 这里去查看：

![1.1 查看电脑中是否有GPU](/pytorch/01_base/01-01.png)

我现在使用的笔记本是 17 年的买的，显卡为 GTX 1050Ti，已经非常的老旧，从图片中可以看到只有 4G 的显存，大模型肯定是跑不了的。

为什么要更新显卡的驱动？因为简单来说，显卡的驱动决定了 CUDA 版本的上限。我们看两个对比图：

::: tabs

@tab 显卡驱动更新前

![1.2 显卡驱动更新前](/pytorch/01_base/01-02.png)

@tab 显卡驱动更新后

![1.3 显卡驱动更新后](/pytorch/01_base/01-03.png)

:::

这里的 CUDA Version：11.6，或者 12.6，代表着当前显卡驱动下，CUDA 的最高适配版本。因为 CUDA 都是向下兼容的，所以可用版本自然越高越好。

**参考文献&相关链接：**

1. [《英伟达显卡驱动更新教程》](https://blog.csdn.net/qq_44703886/article/details/112859392)
2. [《GeForce® 驱动程序下载地址》](https://www.nvidia.cn/geforce/drivers/)

==Bug 记录==：根据这个更新教程，会安装一个叫做 GeForce Experience 的应用程序。我的电脑虽然重启了，但是并没有直接更新驱动。而是需要在这个程序里（如图所示）：

![1.4 显卡驱动更新补充](/pytorch/01_base/01-04.png)

下载一个叫做 **NVIDIA Studio 驱动程序** 的东西，它就是最新的适配的驱动，更新完之后也需要重启。重启后使用图 1.2 中的命令行代码：

```py
nvidia-smi
```

即可验证是否更新成功。我这 1050Ti 的显卡都能更新到 CUDA Version：12.6，我觉得大家的显卡应该都没问题。

## 2. CUDA Toolkit (nvidia)

CUDA Toolkit (nvidia)： CUDA 完整的工具包，包括了 Nvidia 驱动程序、相关的开发工具包等。具体包括 CUDA 程序的编译器(NVCC)、IDE、调试器等，CUDA 程序所对应的各式库文件以及它们的头文件。

刚才图 1.2 和 1.3 中显示的 CUDA 版本，只表示最高的适配版本，并不代表我们已经下载了 CUDA 的工具包。我们可以在命令行工具中，输入：

```py
nvcc --version
```

来查看是否已经安装过 CUDA 工具包。如果安装过会显示版本信息，如果没安装过会报错。

那么如何选择 CUDA Toolkit 的版本呢？我相信看过一些论坛帖子的朋友，一定对 CUDA 的什么向后兼容、向前兼容这种说辞感到很混乱。我也是历经千辛万苦，才找到了一个讲明白的博客，已经放在了参考文献的链接里，我在这里简单的做一个说明：

<div class="layout">

![1.5 CUDA向后兼容](/pytorch/01_base/01-05.png =360x)

![1.6 CUDA小版本兼容](/pytorch/01_base/01-06.png =360x)

</div>

**向后兼容**很好理解， driver 的版本即使不断升级, 也能够兼容以前的旧的 cuda 和应用。如图 1.5 所示。

**小版本兼容**是从 CUDA11 版本开始提供的功能，即你下载的即使是 11.0，也可以兼容到最新的 11.8，只要在 11 这个大版本里面，都可以成功运行。如图 1.6 所示。

![1.7 CUDA向前兼容](/pytorch/01_base/01-07.png =560x)

**向前兼容**其实就是小版本兼容的 PLUS 版，涉及到跨越大版本的兼容情况，看图 1.7，这个图中的 C 表示兼容，X 表示不兼容，要注意的是它只表示向前兼容的情况。

举个例子，横轴中的第一个 470.57（CUDA 11.4），它显示的虽然是 11-5 到 12-3 都是 C，11-0 到 11-3 都是 X，但是它其实从 11-0 开始到 12-3 是全部兼容的，因为 CUDA 对旧版本是绝对兼容的，这里的 C 只是表示向前兼容的情况。

所以通过这样一个兼容性关系，我们可以知道 CUDA Toolkit (nvidia) 的版本，直接下载最高适配版本就可以了，如果怕出错，可以选择降一个版本下载。

<div class="layout">

![1.8 旧版本CUDA工具包](/pytorch/01_base/01-08.png =360x)

![1.9 新版本CUDA工具包](/pytorch/01_base/01-09.png =360x)

</div>

从运行结果可以看到，我现在的电脑中已经安装过了 11.6 版本的工具包，我需要先删除卸载旧的，再安装新的，具体操作请看参考文献 2。如果没有安装过，首次安装的话，只需把卸载旧版本的那一步跳过就行。

**参考文献&相关链接：**

1. [《cuda 模块关系和版本兼容性》](https://tianzhipeng-git.github.io/2023/11/21/cuda-version.html)
2. [《windows cuda 更新/安装教程》](https://blog.csdn.net/YYDS_WV/article/details/137825313)
3. [《CUDA Toolkit 下载地址》](https://developer.nvidia.com/cuda-toolkit-archive)

## 3. Python 相关

推荐新手使用 Anaconda，因为它不仅集成了 Jupyter Notebook，可以方便我们记笔记，以及非项目的代码运算；还能创建虚拟环境，方便不同 PyTorch 版本的项目运行，当然老手用 venv 等其它的虚拟环境创建工具也行。

Anaconda 安装最新的即可，安装选项，以及环境配置，不懂的可以百度搜索 “Anaconda 安装教程”，有很多博客帖子。

不用担心 Anaconda 中 python 版本和 PyTorch 不兼容的问题，因为一般都是使用虚拟环境，重新安装对应版本的 python 和 pytorch。对应关系如下图所示，更多旧版本信息，请看相关链接 2。

|     torch      |  torchvision   |     Python      |
| :------------: | :------------: | :-------------: |
| main / nightly | main / nightly |  >=3.9, <=3.12  |
|      2.4       |      0.19      |  >=3.8, <=3.12  |
|      2.3       |      0.18      |  >=3.8, <=3.12  |
|      2.2       |      0.17      |  >=3.8, <=3.11  |
|      2.1       |      0.16      |  >=3.8, <=3.11  |
|      2.0       |      0.15      |  >=3.8, <=3.11  |
|      1.13      |      0.14      | >=3.7.2, <=3.10 |
|      1.12      |      0.13      |  >=3.7, <=3.10  |
|      1.11      |      0.12      |  >=3.7, <=3.10  |
|      1.10      |      0.11      |  >=3.6, <=3.9   |

Anaconda 中 conda 虚拟环境相关操作（folder_name 是指你命名的虚拟环境的名字，和文件夹名命名规则一样）：

```py
conda create -n folder_name python==x.x     # 创建虚拟环境
conda activate folder_name      # 激活虚拟环境
conda deactivate        # 退出虚拟环境

conda info --envs       # 查看conda环境下的所有虚拟环境
conda list          # 在激活虚拟环境后，此命令可以查看已经安装的库
conda remove -n folder_name/all     # 删除指定/全部虚拟环境
```

**参考文献&相关链接：**

1. [《Anaconda 下载地址》](https://www.anaconda.com)
2. [《pytorch 的 github 官方文档》](https://github.com/pytorch/vision#installation)

## 4. PyTorch 安装

首先，打开 PyTorch 的官网安装地址：[https://pytorch.org/get-started/locally/](https://pytorch.org/get-started/locally/)。

<div class="layout">

![1.10 PyTorch下载1](/pytorch/01_base/01-10.png =360x)

![1.11 PyTorch下载2](/pytorch/01_base/01-11.png =360x)

</div>

从图 1.10 中，我们可以看到 PyTorch 现在的最新版本 2.4.1，CUDA 版本最低要求为 11.8。经过更新显卡驱动之后，CUDA 11.8、12.1、12.4 的适配需求，无疑都是满足的，根据自己的需求做选择。

根据我学长的建议，最好是多创建几个虚拟环境，配置一些老版本的 PyTorch，因为很多论文中用到的版本都不是很新。

如果我要安装 2.4.1 版本，图 1.10 中的选择就是我需要的，只用复制最下面的命令行指令即可。但是我已经安装了一个 2.0 版本，一个 1.31 版本，所以这次我打算安装一个 1.10 的老版本。

如图 1.11 中蓝色方框所示，因为我用的 conda 虚拟环境，所以就要用 conda 指令进行下载，如果没有使用 Anaconda，请用 pip 下载。类似图 1.11 的老版本下载命令，在图 1.10 中蓝色方框的链接里。

::: tabs

@tab 命令及说明

```py
# win 键 + R 键，输入cmd，回车，打开命令行工具
# 创建一个叫做 pytorch_1.10 的虚拟环境，python版本为 3.7
conda create -n pytorch_1.10 python==3.7

# 查看已经创建的所有虚拟环境
conda info --envs

# 激活 pytorch_1.10 环境
conda activate pytorch_1.10

# 粘贴从 PyTorch 官网复制下来的下载安装命令，回车执行
conda install pytorch==1.10.1 torchvision==0.11.2 torchaudio==0.10.1 cudatoolkit=10.2 -c pytorch

# 在保持 pytorch_1.10 环境激活的状态下
python  # 激活命令行工具中 Python 的使用
import torch  # 如果pytorch安装成功即可导入
print(torch.cuda.is_available())  # 查看CUDA是否可用
print(torch.cuda.device_count())  # 查看可用的CUDA数量
print(torch.version.cuda)  # 查看CUDA的版本号
```

@tab 创建激活虚拟环境 & 下载 PyTorch

![1.12 虚拟环境中PyTorch的安装](/pytorch/01_base/01-12.png =560x)

@tab 验证是否安装成功

![1.13 验证PyTorch是否安装成功](/pytorch/01_base/01-13.png =560x)

:::

## 5. CUDNN（可选）

CUDNN(CUDA Deep Neural Network library)：是 NVIDIA 打造的针对深度神经网络的加速库，是一个用于深层神经网络的 GPU 加速库。

新手可以不用下载，因为深层神经网络一般都是大模型，刚上手的时候完全用不上。

**参考文献&相关链接：**

1. [《CUDNN 下载地址》](https://developer.nvidia.com/rdp/cudnn-archive)
2. [《CUDNN 安装教程》](https://zhuanlan.zhihu.com/p/416712347)
3. [《CUDNN 安装成功验证》](https://developer.nvidia.com/rdp/cudnn-archive)
