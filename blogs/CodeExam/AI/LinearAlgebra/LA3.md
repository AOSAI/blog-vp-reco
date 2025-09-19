---
title: LA3.重塑矩阵
date: 2025/09/19
---

#### 难度：简单

在机器学习中，我们经常需要对矩阵进行重塑（reshape）操作。给定一个矩阵，将其重塑为一个新的矩阵，但保持其原始数据。如果重塑前后的元素总数不相同，返回 -1。重塑操作应当满足：

1. 新矩阵的元素总数必须与原矩阵相同
2. 原矩阵中的元素在新矩阵中的相对顺序不变

- **输入描述**：第一行输入要重塑的矩阵。第二行输入目标矩阵的行数和列数。
- **输出描述**：输出重塑后的矩阵，返回形式以 list 形式。

:::: code-group
::: code-group-item 代码框架

```py
from typing import List, Tuple, Union
import numpy as np

def reshape_matrix(a: List[List[Union[int, float]]], new_shape: Tuple[int, int]) -> List[List[Union[int, float]]]:
    pass

def main():
    try:
        a = eval(input())
        new_shape = eval(input())
        result = reshape_matrix(a, new_shape)
        print(result)
    except Exception as e:
        print(f"输入格式错误: {e}")

if __name__ == "__main__":
    main()
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[1, 2], [3, 4]]
(1, 4)

# 输出：
[[1, 2, 3, 4]]
```

:::

::: code-group-item 示例 2

```py
# 输入：
[[1, 2, 3]]
(5, 1)

# 输出：
-1

# 说明：
重塑前后元素总数不相等，返回-1
```

:::
::::

---

#### 解题思路 1：Python 数组手搓

在 LA1 中提到过 Numpy 的 shape 属性，这里也是一样的。

给我们的提示 1 说到元素总数要相等，那就是行列数量相乘，即为元素总数（m×n），在这里就是 shape 的 [0] 和 [1] 相乘。至于矩阵中计算元素方式很多，这里提两种：

```py
num_rows = len(a)  # 行数
num_cols = len(a[0])  # 列数（矩阵每列必定一致）
num_total = num_rows * num_cols
```

```py
# 使用 sum 求和函数
total_elements = sum(len(row) for row in a)
```

提示 2 表明，重塑的过程中，元素的相对顺序要保持不变。因为实际的矩阵，行列数量可能各不相同，所以我的思路是，将其展平成一维数组，然后通过循环切片的方式重构形状。

从写法上来讲，用了 Python 的==列表推导式==，第一个推导式是双层循环，取出二维数组中的每一个值，赋值给新的一维数组；第二个推导式用了切片的方式，新的 shape 有多少行就循环多少次，每次切对应的列数出来，就重塑了数组的形状。

```py
from typing import List, Tuple, Union

def reshape_matrix(a: List[List[Union[int, float]]], new_shape: Tuple[int, int]) -> List[List[Union[int, float]]]:
    num_rows = len(a)
    num_cols = len(a[0])
    num_total = num_rows * num_cols
    new_rows = new_shape[0]
    new_cols = new_shape[1]
    new_total = new_rows * new_cols

    if num_total != new_total:
        return -1

    dim_1_arr = [x for row in a for x in row]
    reshaped = [dim_1_arr[i*new_cols:(i+1)*new_cols] for i in range(new_rows)]

    return reshaped
```

#### 解题思路 2：Numpy 数组处理

Numpy 中直接用 ==.shape== 获取行列，用 ==.reshape== 进行重塑即可，实现上比较便捷：

```py
from typing import List, Tuple, Union
import numpy as np

def reshape_matrix(a: List[List[Union[int, float]]], new_shape: Tuple[int, int]) -> List[List[Union[int, float]]]:
    arr = np.array(a)
    orig_row, orig_col = arr.shape

    if orig_row * orig_col != new_shape[0] * new_shape[1]:
        return -1

    return arr.reshape(new_shape).tolist()
```
