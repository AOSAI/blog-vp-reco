---
title: LA7.基向量变换矩阵
date: 2025/09/28
categories:
  - 每日一题
tags:
  - AI题库
  - 线性代数
---

#### 难度：简单

在线性代数中，同一个向量可以在不同的基下表示。给定 $R^3$ 空间中两组基向量 B 和 C，实现一个函数来计算从基 C 到基 B 的变换矩阵 P。

- **输入描述**：函数`transform_basis`接收两个参数：
  1. B：3×3 矩阵，表示第一组基向量（每列是一个基向量）
  2. C：3×3 矩阵，表示第二组基向量（每列是一个基向量）
- **输出描述**：返回一个 3×3 的矩阵 P。

::: tabs
@tab 代码框架

```py
import numpy as np

def transform_basis(B, C):
    pass

if __name__ == "__main__":
    B = np.array(eval(input()))
    C = np.array(eval(input()))
    print(transform_basis(B, C))
```


@tab 示例 1

```py
# 输入：
[[1, 0, 0], [0, 1, 0], [0, 0, 1]]
[[1, 1, 0], [0, 1, 1], [1, 0, 1]]

# 输出：
[[0.5, -0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, 0.5]]
```

:::

---

#### 矩阵的逆矩阵（inverse）

矩阵的转置通常写为 $A^{T}$ 或 $A^{'}$，它只是把行和列做了一个交换。而 ==逆矩阵== 的定义是，自身与逆矩阵相乘必然等于**单位矩阵 I**。

$$
A^{-1}A = AA^{-1} = I
$$

只有当矩阵是 ==正交矩阵（orthogonal matrix）== 的时候，转置是等于逆矩阵的。比如旋转矩阵：

$$
R=
\begin{bmatrix}
\cos{\theta} & -\sin{\theta} \\ \sin{\theta} & \cos{\theta}
\end{bmatrix}
\xrightarrow{\text{正交矩阵的性质}}
R^{-1}=R^{T}
$$

==逆矩阵的计算公式（2×2、3×3、通用公式）：==

1. **2×2 矩阵的逆**：==计算行列式，如果不等于 0 则有逆。== 👉 记忆小技巧：对角线元素交换位置，副对角线取负号，最后除以行列式。

$$
\text{矩阵：}A= \begin{bmatrix} a & b \\ c & d \end{bmatrix} \\[0.5em]
\text{行列式：}det(A)=ad−bc \not = 0 \\[0.5em]
\text{逆矩阵公式：}A^{-1}=\frac{1}{ad-bc} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}
$$

2. **3x3 与通用公式**：矩阵 A 的伴随矩阵 adj 除以矩阵 A 的行列式 det。

$$
\text{通用公式：}A^{-1}=\frac{1}{det(A)}\cdot{adj(A)} \\[0.5em]
$$

伴随矩阵是指每个元素替换成对应的代数余子式，再整体转置。不过实际计算时不会真用这个公式，因为复杂度高，数值稳定性差。现代计算机通常用 **高斯消元法** 或 **LU 分解** 来算逆矩阵。

#### 解题思路 1：Numpy 数组处理

$C\cdot{P}=B$，该公式可以变换为 $P=B\cdot{C^{-1}}$。在 Numpy 中使用 ==np.linalg.inv== 函数计算逆矩阵，核心是 **LU 分解**。它调用了一个高性能线性代数库 **LAPACK**，如果是双精度浮点数：

1. dgetrf：做 LU 分解（把矩阵分解为下三角 L 和上三角 U，带行交换）。
2. dgetri：基于 LU 分解结果，算出逆矩阵。

```py
import numpy as np

def transform_basis(B, C):
    return (np.linalg.inv(C) @ B).tolist()
```

#### 解题思路 2：Python 数组手搓

高斯消元法和 LU 分解本质上是同一回事。高斯消元一步步消元，最后得到上三角矩阵；LU 分解就是把整个消元过程抽象为 A=LU。差别在于实现形式：LU 分解更结构化、可复用（比如解多个方程组）。==LU 分解 = 系统化的高斯消元==。我们在这里手搓一下 LU 分解的内容。

首先是输入要改一下，之前读取之后直接转换为 Numpy 了，这里转换为 list。

```py
def transform_basis(B, C):
    # 全部转换为浮点数
    B = [[float(x) for x in row] for row in B]
    C = [[float(x) for x in row] for row in C]

    L, U = lu_decomposition(C)  # 手写LU分解
    C_inv = inverse_from_lu(L, U)  # 求逆矩阵 --> 解线性方程组
    return mat_mul(C_inv, B)  # 计算矩阵乘法


if __name__ == "__main__":
    import ast
    B = ast.literal_eval(input())  # 取输入1，转换为list
    C = ast.literal_eval(input())  # 取输入2，转换为list
    print(transform_basis(B, C))
```

接下来看 lu_decomposition 函数，手写 LU 分解。Doolittle LU 分解的核心循环：

1. **先把 L 的对角线设置为 1（Doolittle 方法的约定）**
2. **计算上三角矩阵 U**，公式原理：

$$
U[i][j]=A[i][j]-\sum^{i-1}_{k=0}L[i][k]U[k][j]
$$

3. **计算下三角矩阵 L**，公式原理：

$$
L[j][i]=\frac{1}{U[i][i]}(A[j][i]-\sum^{i-1}_{k=0}L[j][k]U[k][i])
$$

```py
def lu_decomposition(A):
    n = len(A)
    L = [[0.0]*n for _ in range(n)]
    U = [[0.0]*n for _ in range(n)]

    for i in range(n):
        L[i][i] = 1.0  # 对角线 L[i][i] = 1

        # 计算 U 的第 i 行
        for j in range(i, n):
            s = sum(L[i][k]*U[k][j] for k in range(i))
            U[i][j] = A[i][j] - s

        # 计算 L 的第 i 列
        for j in range(i+1, n):
            s = sum(L[j][k]*U[k][i] for k in range(i))
            L[j][i] = (A[j][i] - s) / U[i][i]

    return L, U
```

$$
L=
\begin{bmatrix}
1.0 & 0.0 & 0.0 \\ 0.0 & 1.0 & 0.0 \\ 1.0 & -1.0 & 1.0
\end{bmatrix}
U=
\begin{bmatrix}
1.0 & 1.0 & 0.0 \\ 0.0 & 1.0 & 1.0 \\ 0.0 & 0.0 & 2.0
\end{bmatrix}
$$

现在来看 inverse_from_lu 函数，求解多个方程组。先计算**前代（forward）**，再把得到的结果送去**回代（backward）**，循环计算，就得到了转置后的逆矩阵。以一轮循环做一个演示：

1. ==第一个 e 为：$e_{0}=[1.0,0.0,0.0]^{T}$。计算前代 $L_{y}=e_{0}$==：

   - $y[0]=e[0]-sum(Null)=1.0-0.0=1.0$，**range(0,0)为空**
   - $y[1]=e[1]-sum(L[1,0]\cdot{y[0]})=0.0-0.0=0.0$
   - $y[2]=e[2]-sum(L[2,0]\cdot{y[0]}+L[2,1]\cdot{y[1]})=0.0-1.0=-1.0$

2. ==第一个前代结果 y 为：$y_{0}=[1.0,0.0,-1.0]^{T}$。计算后代 $U_{x}=y_{0}$==：

   - $x[2]=(y[2]-sum(Null))/U[2,2]=-1.0/2.0=-0.5$，**range(3,3)为空**
   - $x[1]=(y[1]-sum(U[1,2]\cdot{x[2]}))/U[1,1]=(0.0+0.5)/1.0=0.5$
   - $x[0]=(y[0]-sum(U[0,2]\cdot{x[2]}+U[0,1]\cdot{x[1]}))/U[0,0]=(1.0-0.5)/1.0=0.5$

3. ==得到第一组列向量（逆矩阵）的解==：$[0.5,0.5,-0.5]^{T}$

```py
def forward_sub(L, b):
    n = len(L)
    y = [0.0]*n
    for i in range(n):
        y[i] = b[i] - sum(L[i][j]*y[j] for j in range(i))
    return y

def backward_sub(U, y):
    n = len(U)
    x = [0.0]*n
    for i in reversed(range(n)):
        x[i] = (y[i] - sum(U[i][j]*x[j] for j in range(i+1, n))) / U[i][i]
    return x

def inverse_from_lu(L, U):
    n = len(L)
    invA = []
    for i in range(n):
        e = [0.0]*n
        e[i] = 1.0
        y = forward_sub(L, e)
        x = backward_sub(U, y)
        invA.append(x)
    # 转置一下，因为每个 x 是一列
    return [ [invA[j][i] for j in range(n)] for i in range(n) ]
```

$$
(C^{-1})^{T}=
\begin{bmatrix}
0.5 & 0.5 & -0.5 \\ -0.5 & 0.5 & 0.5 \\ 0.5 & -0.5 & 0.5
\end{bmatrix}
\xrightarrow{\text{转置对应}}
C^{-1}=
\begin{bmatrix}
0.5 & -0.5 & 0.5 \\ 0.5 & 0.5 & -0.5 \\ -0.5 & 0.5 & 0.5
\end{bmatrix}
$$

最后一步就是矩阵乘法，没有什么好说的，只是封装成了函数的形式：

```py
def mat_mul(A, B):
    """手写矩阵乘法 A x B"""
    m, n, p = len(A), len(A[0]), len(B[0])
    C = [[0.0]*p for _ in range(m)]
    for i in range(m):
        for j in range(p):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
    return C
```

但是很遗憾，手写的这个算法，不知道为什么，同样有精度误差问题，导致浮点数过多时计算有误。LA6 中使用 np.cov() 函数时同样出现了这个问题。

```py
# 输入内容
[[1, 0, 0], [0, 1, 0], [0, 0, 1]]
[[1, 2.3, 3], [4.4, 25, 6], [7.4, 8, 9]]

# 预期输出
[[-0.6772268135904498, -0.012626262626262638, 0.23415977961432502],
[-0.01836547291092747, 0.05050505050505051, -0.02754820936639118],
[0.5731558004285277, -0.03451178451178451, -0.0569329660238751]]

# 实际输出
[[-0.6772268135904498, -0.012626262626262638, 0.23415977961432508],
[-0.01836547291092744, 0.050505050505050504, -0.027548209366391185],
[0.5731558004285277, -0.0345117845117845, -0.05693296602387511]]
```
