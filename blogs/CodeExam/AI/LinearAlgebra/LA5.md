---
title: LA5.标量的矩阵乘法
date: 2025/09/24
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

实现一个函数，计算矩阵与标量的乘法运算。该函数接收一个二维数组（矩阵）和一个标量值作为输入，返回乘法运算后的新矩阵。

- **输入描述**：输入包含两行：
  1. 第一行为一个二维数组（矩阵），数组中的元素可以是整数或浮点数
  2. 第二行为一个标量值，可以是整数或浮点数
- **输出描述**：返回一个二维数组，表示矩阵与标量相乘的结果。结果矩阵的维度与输入矩阵相同，每个元素都是输入矩阵对应位置的元素与标量的乘积。

:::: code-group
::: code-group-item 代码框架

```py
from typing import List, Union

def scalar_multiply(matrix: List[List[Union[int, float]]], scalar: Union[int, float]) -> List[List[Union[int, float]]]:
    pass

def main():
    matrix = eval(input())
    scalar = float(input())
    result = scalar_multiply(matrix, scalar)
    print(result)

if __name__ == "__main__":
    main()
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[1, 2], [3, 4]]
2.0

# 输出：
[[2.0, 4.0], [6.0, 8.0]]
```

:::

::: code-group-item 示例 2

```py
# 输入：
[[1.5, 2.5], [3.5, 4.5]]
-1.0

# 输出：
[[-1.5, -2.5], [-3.5, -4.5]]
```

:::
::::

---

#### 解题思路 1：Python 数组手搓

非常简单，逐元素相乘。

```py
from typing import List, Union

def scalar_multiply(matrix: List[List[Union[int, float]]], scalar: Union[int, float]) -> List[List[Union[int, float]]]:
    result = []

    for item1 in matrix:
        temp_list = []
        for item2 in item1:
            temp = item2 * scalar
            temp_list.append(temp)
        result.append(temp_list)

    return result
```

#### 解题思路 2：Numpy 数组处理

Numpy 中的 ==标量 \* 矩阵== 最快的方式是用广播机制（内部实现），我们只需要用 \* 号即可，还可以用函数形式，或者手写循环形式：

```py
# k为标量，A为矩阵
B = k * A
B = np.multiply(A, k)
B = np.array([[k * a_ij for a_ij in row] for row in A])
```

```py
from typing import List, Union
import numpy as np

def scalar_multiply(matrix: List[List[Union[int, float]]], scalar: Union[int, float]) -> List[List[Union[int, float]]]:
    A = np.array(matrix)
    return (scalar * A).tolist()
```
