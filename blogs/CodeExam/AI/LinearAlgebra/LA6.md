---
title: LA6.计算协方差矩阵
date: 2025/09/26
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

编写一个 Python 函数来计算给定向量集的协方差矩阵。该函数应该采用一个列表列表，其中每个内部列表代表一个特征及其观察结果，并返回一个协方差矩阵。

- **输入描述**：输入给定向量集。
- **输出描述**：输出协方差矩阵。

:::: code-group
::: code-group-item 代码框架

```py
import numpy as np

def calculate_covariance_matrix(vectors):
    pass


# 主程序
if __name__ == "__main__":
    ndarrayA = input()  # 输入

    import ast
    A = ast.literal_eval(ndarrayA)  # 处理输入
    output = calculate_covariance_matrix(A)  # 调用函数计算
    print(output)  # 输出结果
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[7, 8, 9], [10, 11, 12]]

# 输出：
[[1.0, 1.0], [1.0, 1.0]]
```

:::
::::

---

#### 协方差与协方差矩阵

==协方差(Covariance)== 是统计学中用于评估变量与变量之间相关性的一个指标，数学公式如下：

$$
\begin{align*}
Cov(X,Y) &= E([X-E(x)]*[Y-E(Y)]) \\
         &= E([X-\bar{X}]*[Y-\bar{Y}]) \\
         &= \frac{1}{n-1}\sum^n_{i=1}(X_{i}-\bar{X})(Y_{i}-\bar{Y})
\end{align*}
$$

- 协方差为 0，说明两个特征之间没有线性关系。
- 协方差大于 0，两个特征正相关。即一个增大，另一个倾向于增大。
- 协方差小于 0，两个特征负相关，即一个增大，另一个倾向于减小。

==协方差矩阵(Covariance Matrix)== 是指多个变量时，变量间两两之间的协方差系数，组成的矩阵。协方差矩阵是一个**对称矩阵**，因为 $\sigma_{ij} = \sigma_{ji}$。协方差矩阵的对角线元素是每个特征的方差，而非对角线元素则是特征之间的协方差。

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
