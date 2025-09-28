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

==协方差(Covariance)== 是统计学中用于评估变量与变量之间相关性的一个指标，如果 X=Y 就变成了方差，数学公式如下：

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

==协方差矩阵(Covariance Matrix)== 是指多个变量时，变量间两两之间的协方差系数，组成的矩阵。协方差矩阵是一个**对称矩阵**，因为 $\sigma_{ij} = \sigma_{ji}$。协方差矩阵的对角线元素是每个特征的方差，而非对角线元素则是特征之间的协方差。举例说明计算过程：

1. 假设我们有一个矩阵 M，三行两列。
2. 先求列向量的均值，然后对列向量的值做中心化 --> $X-E(x)$。
3. 转置矩阵与自身相乘，得到自己与自己，自己与别人，两两之间的关系。
4. 最后乘以 $\frac{1}{n}$ 总体标准化，或 $\frac{1}{n-1}$ 样本无偏估计。**n 为样本数量**。

$$
M=
\begin{bmatrix}
1 & 2 \\ 2 & 4 \\ 3 & 6
\end{bmatrix}
$$

$$
\tilde{M}=
\begin{bmatrix}
1 - \frac{1+2+3}{3} & 2 - \frac{2+4+6}{3} \\[0.5em]
2 - \frac{1+2+3}{3} & 4 - \frac{2+4+6}{3} \\[0.5em]
3 - \frac{1+2+3}{3} & 6 - \frac{2+4+6}{3}
\end{bmatrix}
=
\begin{bmatrix}
-1 & -2 \\ 0 & 0 \\ 1 & 2
\end{bmatrix}
$$

$$
Cov=\frac{1}{n}*\tilde{M}^{T}*\tilde{M}
=   \frac{1}{3}\begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \end{bmatrix}
    \begin{bmatrix} -1 & -2 \\ 0 & 0 \\ 1 & 2 \end{bmatrix}
=   \frac{1}{3}\begin{bmatrix} 2 & 4 \\ 4 & 8 \end{bmatrix}
=   \begin{bmatrix} 0.67 & 1.33 \\ 1.33 & 2.67 \end{bmatrix}
$$

#### 解题思路 1：Numpy 数组处理

Numpy 中有直接计算协方差矩阵的函数 ==np.cov()==，也可以使用数学公式的思路手写函数计算。==mean()== 函数求均值（LA4），==.T== 计算转置（LA2），==@== 计算矩阵点积（LA1）。

```py
# ---------使用numpy计算协方差矩阵----------
Cp = np.cov(X.T)

# ----------使用公式计算协方差矩阵------------
Xn = X - X.mean(axis = 0)
C = Xn.T@Xn/(X.shape[0]-1)

# ----------如果给的矩阵已经是 X.T 了------------
Cp = np.cov(X)

Xn = X - X.mean(axis = 1, keepdims=True)
C = Xn.T@Xn/(X.shape[1]-1)
```

这里有**一个非常需要注意的点**，就是 numpy 之中的广播机制与 mean 轴降维之间的爱恨情仇。假设我们有一个矩阵 A，它的形状 shape=(3, 2)：==mean(axis=0)== 取列，值为 (2,)；==mean(axis=1)== 取行，值为（3,）。

Numpy 广播中，比较两个数组形状时：

1. 先把维度对齐（右对齐，缺的前面补 1）。它不会随便凑形状，只会在左边补 1。
2. 然后逐维比较，如果两个维度相等，或者其中一个是 1，就兼容；否则报错。

✅ (3,2) - (2,) 能广播，因为 NumPy 会把 (2,) 当作 (1, 2)，然后复制到每一行。还是拿 M 矩阵举例：

$$
\begin{bmatrix}
1 & 2 \\ 2 & 4 \\ 3 & 6
\end{bmatrix}
\xrightarrow{\text{计算列均值}}
\begin{bmatrix}
2 & 4
\end{bmatrix}
\xrightarrow{\text{广播对齐维度}}
\begin{bmatrix}
2 & 4 \\ 2 & 4 \\ 2 & 4
\end{bmatrix}
$$

❌ (3, 2) - (3,) 不能广播，因为 NumPy 只能把 (3,) → (1, 3)，而不是 (3, 1)。

因此 mean 函数中需要 keepdims=True 这个参数，来保持原始的维度不变。它并不是从 (3, 1) 广播成 (3, 2) 的，广播只能从左边走，它是直接让形状保持 (3, 2)，计算好复制到每一列去。

刚开始没有理解这个原理，导致我用了一个循环去解决问题，不过也能通过：

```py
import numpy as np

def calculate_covariance_matrix(vectors):
    X = np.array(vectors)
    row, col = X.shape
    Xn = np.zeros((row, col))

    index = 0
    for vec in X:
        Xn[index] = vec - vec.mean()
        index += 1

    Cov = (Xn@Xn.T)/(col - 1)
    return Cov.tolist()
```

其次需要注意的是直接使用 Numpy 的协方差矩阵计算函数 ==Cp = np.cov(X)==，可以使用，但是我遇到了**浮点数过多时，精度计算有误**的问题，无法解决，建议使用公式计算。

- Cp 正确输出：6.666666666666667
- Cp 实际输出：6.666666666666666

#### 解题思路 2：Python 数组手搓

手搓的思路到中心化都是一致的：

```py
def calculate_covariance_matrix(vectors):
    features = len(vectors)
    samples = len(vectors[0])
    vec1 = []

    for index in range(features):
        mean = sum(vectors[index]) / samples
        vec1.append([(val - mean) for val in vectors[index]])
        print(vec1)
```

矩阵乘法有两个思路：

1. 用 append 动态拼接，写法简单，容易理解。

虽然 append 会有扩容开销，但它是对称矩阵，可以利用它的性质，减少一些计算。

```py
result = []
for index1 in range(features):
    temp3 = []
    for index2 in range(features):
        temp2 = []
        for index3 in range(samples):
            # 减少计算量的核心
            if index1 > index2:
                temp2.append(result[index2][index1]*(samples-1))
                break
            temp1 = vec1[index1][index3] * vec1[index2][index3]
            temp2.append(temp1)
        temp3.append(sum(temp2)/(samples-1))
    result.append(temp3)

return result
```

2. 根据矩阵乘法结果的 shape，先生成一个全 0 的二维数组。然后用双重循环去填数。

这种方法内存一次性分配，避免了反复扩容。每一步只做赋值，没有额外的排序、拼接开销，效率更高。

```py
result = [[0]*features for _ in range(features)]

for index1 in range(features):
    for index2 in range(features):
        temp2 = []
        for index3 in range(samples):
            if index1 > index2:
                result[index1][index2] = result[index2][index1]
                break
            temp1 = vec1[index1][index3] * vec1[index2][index3]
            temp2.append(temp1)
        if index1 <= index2:
            result[index1][index2] = sum(temp2)/(samples-1)

return result
```
