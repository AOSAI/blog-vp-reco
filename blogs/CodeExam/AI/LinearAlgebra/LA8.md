---
title: LA8.将向量转换为对角矩阵
date: 2025/09/28
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

实现一个函数，将一维向量转换为对角矩阵。对角矩阵是一个方阵，其主对角线上的元素来自输入向量，而其他位置的元素都为 0。

- **输入描述**：第一行输入一个一维向量，长度为 n。
- **输出描述**：返回一个二维 numpy 数组（方阵）：
  1. 维度为 n x n，其中 n 是输入向量的长度
  2. 对角线上的元素来自输入向量
  3. 其他位置的元素都为 0
  4. 元素类型不需要手动修改，让它为默认的即可。

:::: code-group
::: code-group-item 代码框架

```py
import numpy as np

def make_diagonal(x):
    pass

if __name__ == "__main__":
    x = np.array(eval(input()))
    print(make_diagonal(x))
```

:::

::: code-group-item 示例 1

```py
# 输入：
[1, 2, 3]

# 输出：
[[1. 0. 0.]
 [0. 2. 0.]
 [0. 0. 3.]]
```

:::
::::

---

#### 解题思路 1：Numpy 数组处理

Numpy 中的 ==np.diag()== 函数专门用来，将一维向量转化为对角矩阵。

```py
import numpy as np

def make_diagonal(x):
    return np.diag(np.array(x, dtype=np.float32))
```

另一种思路是使用 ==np.identity()== 函数生成一个单位矩阵，然后利用广播直接相乘，亦或者使用一个循环乘法，将对角线的元素变成向量元素。

```py
import numpy as np

def make_diagonal(x):
    return np.identity(np.size(x)) * x
```

#### 解题思路 2：Python 数组手搓

手搓的思路其实和 Numpy 差不多，难点在于输出的格式，要和 Numpy 一致。这里手写了 format_print_numpy_style 函数，用于控制输出风格。

```py
def format_print_numpy_style(A, decimals=8):
    lines = []
    for row in A:
        row_str = []
        for v in row:
            # 四舍五入到指定小数位
            v_rounded = round(v, decimals)
            # 如果是整数，显示 1. 而不是 1
            if v_rounded == int(v_rounded):
                s = f"{int(v_rounded)}."
            else:
                s = f"{v_rounded}"
            row_str.append(s)
        lines.append(" ".join(row_str))

    # 每行用换行分开，并加上外层列表括号
    return "[" + "\n ".join("[" + line + "]" for line in lines) + "]"

def make_diagonal(x):
    n = len(x)
    new_x = [[0.0]*n for _ in range(n)]

    for i in range(n):
        new_x[i][i] = float(x[i])

    return format_print_numpy_style(new_x)


if __name__ == "__main__":
    x = eval(input())
    print(make_diagonal(x))
```
