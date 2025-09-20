---
title: LA4.按行或列计算平均值
date: 2025/09/21
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

实现一个函数，用于计算矩阵按行或按列的平均值。该函数接收一个二维数组（矩阵）和计算模式作为输入，返回对应的平均值列表。

- **输入描述**：输入包含两行：
  1. 第一行为一个二维数组（矩阵），数组中的元素可以是整数或浮点数
  2. 第二行为计算模式，字符串类型，值为 "row" 或 "column"
- **输出描述**：返回一个浮点数列表，表示按指定模式计算的平均值：
  1. 如果模式为 "row"，返回每行的平均值
  2. 如果模式为 "column"，返回每列的平均值

:::: code-group
::: code-group-item 代码框架

```py
from typing import List, Union
import numpy as np

def calculate_matrix_mean(matrix: List[List[Union[int, float]]], mode: str) -> List[float]:
    pass

def main():
    matrix = eval(input())
    mode = input()
    result = calculate_matrix_mean(matrix, mode)
    print(result)

if __name__ == "__main__":
    main()
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[1, 2, 3], [4, 5, 6]]
row

# 输出：
[2.0, 5.0]
```

:::

::: code-group-item 示例 2

```py
# 输入：
[[1, 2, 3], [4, 5, 6]]
column

# 输出：
[2.5, 3.5, 4.5]
```

:::
::::

---

#### 解题思路 1：Python 数组手搓

取均值：求和之后除以数量。难点在于 column 的时候，该怎么处理数据。Python 中的 sum() 求和函数可以直接对列表（list）、元组（tuple）这类可迭代对象求和，前提是一维的，并且元素是数值型。

==基础循环写法==，行元素相加可以直接一个循环，然后对取出来的一维数组直接 sum 求和，但是列元素相加就不行了，只能写两个循环：

```py
from typing import List, Union

def calculate_matrix_mean(matrix: List[List[Union[int, float]]], mode: str) -> List[float]:
    len_row = len(matrix)
    len_col = len(matrix[0])
    result = []

    if mode == "row":
        for item in matrix:
            temp = sum(item) / len_col
            result.append(temp)

    if mode == "column":
        for index in range(len_col):
            temp = 0
            for item in matrix:
                temp += item[index]
            result.append(temp / len_row)

    return result
```

==列表推导式写法==，row 和上一个基本是一致的，在列这里，zip(\*matrix)其实是一种 **解包（unpack）** 操作：

1. matrix 是一个二维列表（list of lists）
2. \*A 会把 A 里的每一行，依次作为参数传给 zip()，==解构操作==
3. zip() 会把这些行（不同的一维数组），按列对齐打包成元组，结果就等价于矩阵转置

```py
# 假设有两个列表，执行打包，最后外层套上list
x = [1, 2, 3]
y = ['a', 'b', 'c']
print(list(zip(x, y)))

# 输出结果
[(1, 'a'), (2, 'b'), (3, 'c')]
```

```py
from typing import List, Union
import numpy as np

def calculate_matrix_mean(matrix: List[List[Union[int, float]]], mode: str) -> List[float]:
    len_row = len(matrix)
    len_col = len(matrix[0])

    if mode == "row":
        result = [sum(row)/len_col for row in matrix]
    else:
        result = [sum(col)/len_row for col in zip(*matrix)]

    return result
```

#### 解题思路 2：Numpy 数组处理

Numpy 的操作可真是简洁的一批，==.mean()== 函数用于求均值，其中的参数 ==axis== 表示维度：

1. **axis=0**：沿着 第 0 维 计算（竖着走），也就是 对列操作
2. **axis=1**：沿着 第 1 维 计算（横着走），也就是 对行操作

一定要注意最后转成 Python 的列表格式，不然，有一个极其无语的 bug，跟 Numpy 的设定有关，对于小数点后是 0 的浮点数，==比如 2.0，它会写成 2.==，系统会判别错误。

```py
from typing import List, Union
import numpy as np

def calculate_matrix_mean(matrix: List[List[Union[int, float]]], mode: str) -> List[float]:
    A = np.array(matrix)

    if mode == "row":
        result = np.mean(A, dtype=float, axis=1).tolist()
    else:
        result = np.mean(A, dtype=float, axis=0).tolist()

    return result
```
