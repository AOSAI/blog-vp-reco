---
title: LA1.矩阵和向量的点积
date: 2025/09/19
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

编写一个函数，该函数计算矩阵和向量的点积。如果矩阵无法与向量进行点积，则返回 -1。

- **输入描述**：第一行输入矩阵，第二行输入需要相乘的向量。
- **输出描述**：输出对应的点积，返回结果以 list 形式。
- 备注说明：
  1. Python3 对应的输入、输出已给出，您只用实现核心功能函数即可。
  2. 支持 numpy、scipy、pandas、scikit-learn 库。

:::: code-group
::: code-group-item 代码框架

```py
def matrix_vector_dot_product(matrix, vector):
    # 补全代码


# 主程序
if __name__ == "__main__":
    # 输入矩阵和向量
    matrix_input = input()
    vector_input = input()

    # 处理输入
    import ast
    matrix = ast.literal_eval(matrix_input)
    vector = ast.literal_eval(vector_input)

    # 调用函数计算点积
    output = matrix_vector_dot_product(matrix, vector)

    # 输出结果
    print(output)

```

:::

::: code-group-item 示例 1

```py
# 输入：
[[3, 5, 2], [1, 0, 4], [2, 3, 1]]
[2, 1, 3]

# 输出：
[17, 14, 10]

# 说明：
3∗2+5∗1+2∗3=17，1∗2+0∗1+4∗3=14，2∗2+3∗1+1∗3=10
```

:::

::: code-group-item 示例 2

```py
# 输入：
[[1, 2, 3], [4, 5, 6]]
[1, 2]

# 输出：
-1

# 说明：
矩阵维度（2,3），向量维度（2，1），维度不匹配，返回-1
```

:::
::::

---

#### 解题思路 1：Python 中的数组处理

回顾一下矩阵的定义，有 m 行，每一行都有相同的 n 个数，所以整体是 m×n 的长方形。该题的核心点在于矩阵乘法的口诀：==前行乘后列，两者的元素个数要相同==，满足这个条件即可。

向量是一个一维数组，而矩阵中的每一个数组都代表的行，我们取矩阵的第一行长度和向量的长度做对比，若不相等便没办法点积。对于可以点积的矩阵和向量，通过二层循环，逐元素相乘即可。第一次解题代码为：

```py
def matrix_vector_dot_product(matrix, vector):
    if len(matrix[0]) != len(vector):
        return -1

    result = []
    for item in matrix:
        temp = 0
        for index in range(len(vector)):
            temp += item[index] * vector[index]
        result.append(temp)

    return result
```

运行通过了，但是运行时间和资源消耗的排名在 100 名开外，肯定是有可以优化的地方。我细想了一下，代码中两次用到 len(vector) 这个函数，每一次计算长度都要消耗时间，所以通过赋值的方式，优化了结构，运算时间 27ms，排行 57。

```py
def matrix_vector_dot_product(matrix, vector):
    len1 = len(matrix[0])
    len2 = len(vector)

    if len1 != len2:
        return -1

    result = []
    for item in matrix:
        temp = 0
        for index in range(len2):
            temp += item[index] * vector[index]
        result.append(temp)

    return result
```

#### 解题思路 2：转换为 Numpy 处理

Numpy 的点积乘法是使用 ==@ 运算符== 和 ==np.dot()== 函数，虽然看起来写法更简单了，但是对于题目而言计算反而变得复杂了，不推荐使用，仅供学习参考。

Numpy 数组中的 shape 属性对于向量（一维数组）和矩阵（二维数组）是有区分的。矩阵中 [0] 表示有多少行，[1]表示有多少列，有多少列就说明每一行中有多少个元素。而向量只有 [0]，表示元素的数量。所以判断中才用矩阵的 [1] 和向量的 [0] 做对比。

而且最后要求以 list 形式返回结果，所以还需要 tolist() 函数进行转换，否则就是 [17 14 10] 的形式，会报错。

```py
import numpy as np

def matrix_vector_dot_product(matrix, vector):
    matrix = np.array(matrix)
    vector = np.array(vector)

    if matrix.shape[1] != vector.shape[0]:
        return -1

    result = matrix @ vector
    # result = np.dot(matrix, vector)

    return result.tolist()
```
