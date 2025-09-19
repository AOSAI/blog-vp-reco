---
title: LA2.矩阵转置
date: 2025/09/19
---

#### 难度：简单

给定一个 n×m 的矩阵，请将其转置。转置是指将矩阵的行和列互换，即原矩阵中第 i 行第 j 列的元素在转置后变为第 j 行第 i 列的元素。

- **输入描述**：输入为一个二维数组，表示一个 n×m 的矩阵，矩阵中的元素为整数。
- **输出描述**：输出转置后的矩阵，以与输入相同的格式表示。转置后的矩阵大小为 m×n。

:::: code-group
::: code-group-item 代码框架

```py
from typing import List, Union

# 使用 Union 来表示类型可以是 int 或 float
def transpose_matrix(a: List[List[Union[int, float]]]) -> List[List[Union[int, float]]]:
    pass

# 处理输入输出
def main():
    try:
        matrix_str = input().strip()
        # 去掉最外层的方括号，并分割每个子数组
        rows = matrix_str[2:-2].split('],[')
        # 将每个子数组转换为数字列表
        matrix = [list(map(int, row.split(','))) for row in rows]

        # 计算转置矩阵
        result = transpose_matrix(matrix)

        # 格式化输出
        print(str(result).replace(' ', ''))
    except Exception as e:
        print(f"输入格式错误: {e}")

if __name__ == "__main__":
    main()
```

:::

::: code-group-item 示例 1

```py
# 输入：
[[1,3,5],[6,8,10]]

# 输出：
[[1,6],[3,8],[5,10]]

# 说明：
原始矩阵为 2×3 的矩阵：
1  3  5
6  8  10
转置后变为 3×2 的矩阵：
1  6
3  8
5  10
```

:::
::::

---

#### 解题思路 1：Python 数组处理

从图像的视角来看，就是沿着 ==左上角到右下角的对角线== 进行一个镜像翻转。我的循环逻辑是，每次循环把每一列的值取出来（每一行的对应 index 的值）组成新的数组，比如 [0][0], [1][0]，1 和 6 取出来，作为第一个数组，[0][1], [1][1]，2 和 8 取出来作为第二个数组，不断的添加进二维数组的变量中。

```py
from typing import List, Union

def transpose_matrix(a: List[List[Union[int, float]]]) -> List[List[Union[int, float]]]:
    newList = []
    lenRow = len(a[0])

    for index in range(lenRow):
        temp = []
        for item in a:
            temp.append(item[index])
        newList.append(temp)

    return newList
```

#### 解题思路 2：Numpy 数组处理

Numpy 的转置只需要 ==.T== 即可，别忘记先转换成 nparray，然后再转回 list 就行。

```py
import numpy as np
from typing import List, Union

def transpose_matrix(a: List[List[Union[int, float]]]) -> List[List[Union[int, float]]]:
    arr = np.array(a)  # 转为 numpy 数组
    transposed = arr.T  # 转置
    return transposed.tolist()  # 转回 List
```
