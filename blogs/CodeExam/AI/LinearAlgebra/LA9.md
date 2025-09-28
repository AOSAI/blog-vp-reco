---
title: LA9.实现压缩行稀疏矩阵（CSR）格式转换
date: 2025/09/29
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

实现一个函数来将密集矩阵（dense matrix）转换为压缩行稀疏（Compressed Row Sparse, CSR）格式。CSR 是一种高效存储稀疏矩阵的方法，只存储非零元素及其位置信息。

CSR 格式由三个数组组成：

1. values：按行优先顺序存储的非零元素值
2. column_indices：每个非零元素对应的列索引
3. row_pointer：指示每行起始位置的指针数组

- **输入描述**：输入为一个二维列表 dense_matrix，表示待转换的密集矩阵。
- **输出描述**：输出三个列表，分别表示 CSR 格式中的 values、column_indices 和 row_pointer。

:::: code-group
::: code-group-item 代码框架

```py
def compressed_row_sparse_matrix(dense_matrix):
    return vals, col_idx, row_ptr

if __name__ == "__main__":
    dense_matrix = eval(input())
    vals, col_idx, row_ptr = compressed_row_sparse_matrix(dense_matrix)
    print(vals)
    print(col_idx)
    print(row_ptr)
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[1, 0, 0], [2, 3, 0], [0, 4, 5]]

# 输出：
[1, 2, 3, 4, 5]
[0, 0, 1, 1, 2]
[0, 1, 3, 5]
```

:::
::::

---

#### 解题思路 1：Python 数组手搓

难点在于 row_pointer 的理解，它的 length = row + 1，最后一个元素表示 values 的总长度。以示例 1 的输入输出讲解：

1. 第 0 行的起始位置必然是零，因为它是最开始。
2. 第 1 行的起始位置是 1，因为上一行（第 0 行）有 1 个非零元素。0+1=1
3. 第 2 行的起始位置是 3，因为上一行（第 1 行）有 2 个非零元素。1+2=3
4. 最后一个元素表示 values 的总长度，5-3=2，说明第 2 行有 2 个非零元素。

从 values 数组切片提取，并用 column_indices 数组还原的角度来看：

1. 第 0 行元素是 values[0:1]，1 个值，从 column_indices 取 1，还原到 M[0][0]，
2. 第 1 行元素是 values[1:3]，2 个值，从 column_indices 取 2，还原到 M[1][0]，M[1][1]
3. 第 2 行元素是 values[3:5]，2 个值，从 column_indices 取 2，还原到 M[2][1]，M[2][2]

```py
def compressed_row_sparse_matrix(dense_matrix):
    row = len(dense_matrix[0])
    col = len(dense_matrix)
    vals = []
    col_idx = []
    row_ptr = [0]

    temp = 0
    for i in range(row):
        for j in range(col):
            if dense_matrix[i][j] != 0:
                vals.append(dense_matrix[i][j])
                col_idx.append(j)
                temp += 1
        row_ptr.append(temp)

    return vals, col_idx, row_ptr
```

#### 解题思路 2：Numpy + SciPy

NumPy 本身不直接提供 CSR 类型，但是 SciPy 的 sparse 模块 提供了完整的 CSR 支持，而且操作很方便。

```py
import numpy as np
from scipy.sparse import csr_matrix

def compressed_row_sparse_matrix(dense_matrix):
    A = np.array(dense_matrix)
    csr = csr_matrix(A)
    vals = csr.data.tolist()
    col_idx = csr.indices.tolist()
    row_ptr = csr.indptr.tolist()

    return vals, col_idx, row_ptr
```
