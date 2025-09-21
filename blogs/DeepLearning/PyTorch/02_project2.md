---
title: 实战1-参考答案
date: 2025-03-03
categories:
  - PyTorch
tags:
  - PyTorch实战
  - 逻辑回归
  - 分类问题
  - 监督学习
---

## 1. 二分类问题 - 其一

UCI Machine Learning Repository 是一个著名的公开数据集仓库，由加州大学欧文分校（University of California, Irvine）维护。它收集了大量用于机器学习研究和教学的数据集，涵盖了分类、回归、聚类、推荐系统等多种任务。

它对数据集的介绍十分的详细，以肿瘤预测数据集为例，先是六个标签，说明了这个数据集是针对医疗健康领域的分类问题，全部特征都是真实的，有 569 个实例，30 个特征。接着是对数据集的一个简要介绍，最下方是这个数据集最初出现的论文链接。右边栏是数据集下载和引用的按钮，以及一些其他信息。

P.S. 为什么说的这么详细，是因为我最初看到这些全是英文的东西，非常的抗拒，总觉得很难，没有一点看下去的欲望，而网页的全文翻译有的时候，并不是那么准确，有可能导致理解起来更为困难。所以，嗯，为了鼓励曾经的我自己，以及像曾经的我一样，难以坚持的小伙伴。

![2.1 公开数据集仓库 - UCI - 1](/pytorch/02_classification/02-01.png =560x)

UCI 仓库对数据集的所有特征列了一个表格，并且对于一些特别需要说明的特征，在下方（Additional Variable Information）中进行了解释。方便我们理解，更好的进行特征工程。

并且它还很贴心的贴出了目前最常被使用的 5 中机器学习算法，对比了它们在数据集上的准确度。可以看出，1 和 3（都是决策树模型）是最佳的解决方案，第 2 个 SVM 的效果甚至不如第 5 个逻辑回归，神经网络的准确度是最差的。

<div class="layout">

![2.2 公开数据集仓库 - UCI - 2](/pytorch/02_classification/02-02.png =360x)

![2.3 公开数据集仓库 - UCI - 3](/pytorch/02_classification/02-03.png =360x)

</div>

### 1.1 数据格式

UCI 数据集通常以文本文件（如 .data、.csv 或 .txt）的形式提供，文件内容可能是纯文本或逗号分隔的表格数据。下载解压完肿瘤分类的数据集，有两个文件 wdbc.data 和 wdbc.names，VS Code 可以直接打开。后者通常包含数据集的详细描述和元数据。这个文件的作用是帮助用户理解数据集的结构、特征的含义以及如何使用数据。

```py
# .csv（Comma-Separated Values）
# 以逗号分隔的表格数据，每行是一个样本，每列是一个特征。通常第一行是特征的名称（列名）。
feature1,feature2,feature3,label
1.0,2.5,3.7,0
2.1,3.4,4.8,1

# .data
# 通常是以空格、制表符或逗号分隔的纯文本文件，格式可能与 CSV 类似。没有特征的名称。
1.0 2.5 3.7 0
2.1 3.4 4.8 1

# .txt
# 纯文本文件，格式可能与 .data 类似，也可能是其他自定义格式。
```

.csv 和 .data 文件格式一般都用 Pandas 读取，.txt 文本文件根据内容选择合适的方法（如 pandas.read_csv() 或 numpy.loadtxt()）。

```py
import pandas as pd

# .csv
# header 属性有三种参数，None 表示没有列名（特征的名称）
# 单个数字表示指定哪一行作为列名，比如0表示第一行，3表示第四行，[0, 1]表示前两行都是列名
# ‘infer’ 与 header=0 相同，自动推断第一行为列名
data1 = pd.read_csv("xxxx.csv", header=None)

# .data
# 根据分割数据的方式，指定分隔符：‘，’逗号分隔，‘ ’空格分隔，‘\t’制表符分隔
data2 = pd.read_csv("xxxx.data", header=None, delimiter=',')

# .txt
# pandas的读取方式和 .data 一致，这里仅写 numpy 函数，该函数没有 header 属性。
# delimiter 的使用方法和 pd 一致。但它是一个更底层的函数，适合读取纯数值数据。
data3 = np.loadtxt('xxxx.txt', delimiter=' ')
```

### 1.2 肿瘤分类

表格中写明了（.name 文件中也写的很清楚），第一个参数（第一列）是 ID number，第二个参数（第二列）是标签，M = malignant 表示恶性肿瘤，转换为数字 1，B = benign 表示良性肿瘤，转换为数字 0。.data 文件中的后三十列的参数才是特征，我们可以进行训练前的数据处理了。

```py
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

# load data
data = pd.read_csv("./bcwd/wdbc.data", header=None)

# extract labels and features
X = data.iloc[:, 2:].values
y = data.iloc[:, 1].values

# transform labels to numbers（M -> 1, B -> 0）
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# split training set and testing set
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42)

# check the results
print("训练集特征形状:", X_train.shape)
print("测试集特征形状:", X_test.shape)
```

fit_transform() 是一个很有意思的函数。fit 用于拟合数据，transform 用于转换数据，应用拟合后的规则，fit_transform 是将两者结合起来，一次行完整拟合和转换。像上方代码中的标签数字化和数据标准化，如果分开写是这样的：

```py
label_encoder = LabelEncoder()  # 初始化 标签数值转换器
label_encoder.fit(y)            # 拟合规则，按照字母顺序排序，b在前为0，m在后为1
y = label_encoder.transform(y)  # 转化数据

scaler = StandardScaler()       # 初始化 标准化函数
scaler.fit(X)                   # 拟合数据，计算均值和标准差
X_scaled = scaler.transform(X)  # 转换数据
```

接下来就是使用模型，进行计算和评估了。我们使用 UCI 统计过的，最佳的两种决策树模型，随机森林 和 xgboost：

```py
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
# from xgboost import XGBClassifier

# 初始化随机森林模型，XGBoost 模型
model1 = RandomForestClassifier(n_estimators=100, random_state=42)
# model2 = XGBClassifier(n_estimators=100, random_state=42)

# 随机森林 训练、预测、评估
model1.fit(X_train, y_train)
y_pred1 = model1.predict(X_test)
accuracy1 = accuracy_score(y_test, y_pred1)
print("random forest 模型准确率：", accuracy1)
conf_matrix1 = confusion_matrix(y_test, y_pred1)
print("random forest 的混淆矩阵：\n", conf_matrix1)
class_report1 = classification_report(y_test, y_pred1, target_names=["良性 (B)", "恶性 (M)"])
print("random forest 的分类报告：\n", class_report1)
```

96.5%的准确率，其实还不错。但是我们观察 UCI 中的模型性能表现，gxboost 的准确率均值在 97.2，而随机森林高达 97.9，它是怎么做到的呢？

```py
random forest 模型准确率： 0.9649122807017544
random forest 的混淆矩阵：
 [[70  1]
 [ 3 40]]
random forest 的分类报告：
               precision    recall  f1-score   support

      良性 (B)       0.96      0.99      0.97        71
      恶性 (M)       0.98      0.93      0.95        43

    accuracy                           0.96       114
   macro avg       0.97      0.96      0.96       114
weighted avg       0.97      0.96      0.96       114
```

### 1.3 决策树优化

想要提高随机森林的准确率，可以从以下几个方面入手：

1. 调整超参数：使用网格搜索找到最佳参数组合
2. 特征工程：选择重要特征，或构造新特征
3. 数据增强：处理类别不平衡问题
4. 集成学习：结合多个模型提高性能

（1）随机森林中的超参数

```py
from sklearn.model_selection import GridSearchCV

# 定义网格参数，参数需要自己慢慢微调
param_grid1 = {
    # 树的数量
    'n_estimators': [50, 100, 200],
    # 树的最大深度。控制每棵树的复杂度，设置太小会欠拟合，太大会过拟合
    'max_depth': [None, 10, 20, 30],
    # 节点分裂的最小样本数。较大的值可以防止过拟合。
    'min_samples_split': [2, 5, 10],
    # 叶子节点的最小样本数。较大的值可以防止过拟合。
    'min_samples_leaf': [1, 2, 4],
    # 每次分裂时考虑的最大特征数量。较小的值可以防止过拟合。
    'max_features': ['sqrt', 'log2', 0.5, 0.8]
}

# 初始化随机森林模型
model1 = RandomForestClassifier(n_estimators=100, random_state=42)

# 初始化网格搜索, 执行网格搜索
grid_search = GridSearchCV(estimator=model1, param_grid=param_grid1, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

# 输出最佳参数和准确率
print("最佳参数:", grid_search.best_params_)
print("最佳准确率:", grid_search.best_score_)

# 结果：96.7%，比原先提高了约 0.2%，还不错
最佳参数: {'max_depth': None, 'max_features': 'log2', 'min_samples_leaf': 1, 'min_samples_split': 5, 'n_estimators': 50}
最佳准确率: 0.9670329670329669
```

（2）特征工程（特征选择、特征构造）

特征构造需要对这些特征的含义有一定的理解，比如：肿瘤半径和周长之间可以有比值、肿瘤面积和纹理之间可以有乘积等等。这些需要一定的专业领域知识和经验。

所以此处就记录两种特征选择的方法：SelectFromModel 和 RFE。SelectFromModel 的结果反而比原始方法的准确率还要低一些，RFE 方法的准确率和原始方法持平。

```py
from sklearn.feature_selection import SelectFromModel
from sklearn.feature_selection import RFE

model = RandomForestClassifier(n_estimators=100, random_state=42)

# # 选择重要性高于平均值、中值的特征
# selector = SelectFromModel(model, threshold='mean')
# selector = SelectFromModel(model, threshold='median')
# X_train_selected = selector.fit_transform(X_train, y_train)
# X_test_selected = selector.transform(X_test)

# 使用 RFE 递归的剔除一些不重要的特征
selector = RFE(model, n_features_to_select=15)  # 选择 15 个特征
X_train_selected = selector.fit_transform(X_train, y_train)
X_test_selected = selector.transform(X_test)

# 重新训练模型
model_selected = RandomForestClassifier(n_estimators=20, random_state=42)
model_selected.fit(X_train_selected, y_train)

# 评估模型
y_pred_selected = model_selected.predict(X_test_selected)
print("筛选特征后的准确率:", accuracy_score(y_test, y_pred_selected))
```

（3）数据增强（SMOTE）

类别不平衡问题是指，在分类问题中，如果某一类的样本数量远少于其他类，模型可能会偏向多数类，导致少数类的分类性能较差。

对于少数类中的每个样本，SMOTE 会找到它的 k 个最近邻（默认值是 5 个）。然后，随机选择一个最近邻，并在两者之间的连线上生成一个新的合成样本。新样本的特征值是原始样本和最近邻样本的线性组合。

```py
from imblearn.over_sampling import SMOTE

# 初始化 SMOTE
smote = SMOTE(random_state=42)

# 生成增强数据
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

# 重新训练模型
model_resampled = RandomForestClassifier(n_estimators=100, random_state=42)
model_resampled.fit(X_train_resampled, y_train_resampled)

# 评估模型
y_pred_resampled = model_resampled.predict(X_test)
print("数据增强后的准确率:", accuracy_score(y_test, y_pred_resampled))

# 结果：97.4%，比原始模型提高了 0.9%
数据增强后的准确率: 0.9736842105263158
```

可以看出，在数据集相对较小，且类别分别不均衡的情况下，数据增强的效果非常好。我们尝试进一步优化 SMOTE 的参数，将其 k-近邻 的值调整后对比准确度：

```py
# 我发现当 k_neighbors 为 4 或 6 的时候，效果最佳。
smote = SMOTE(k_neighbors=4, random_state=42)

# 结果：98.3%，比原始模型提高了 1.8%，已经超过了 UCI 中随机森林的均值准确度
数据增强后的准确率: 0.9824561403508771
```

（4）集成学习

因为在数据增强那块，我已经让结果达到了我的预期，所以我并没有在集成学习这里尝试很多种方式，仅仅使用了投票表决（Voting）模型作为一个测试。==如果有兴趣，可以尝试将不同的优化方式组合起来，也许准确度能到 100%呢？==

将多个模型结合在一起的方式也有很多种：

- Voting 是结合多个模型的预测结果，通过投票决定最终预测。
- Stacking 是将多个模型的预测结果作为新特征，训练一个元模型。

```py
from sklearn.ensemble import VotingClassifier
from xgboost import XGBClassifier

# 初始化多个模型
model_rf = RandomForestClassifier(n_estimators=100, random_state=42)
model_xgb = XGBClassifier(n_estimators=100, random_state=42)

# 初始化 VotingClassifier
voting_model = VotingClassifier(estimators=[
    ('rf', model_rf),
    ('xgb', model_xgb)
], voting='soft')

# 训练集成模型
voting_model.fit(X_train, y_train)

# 评估模型
y_pred_voting = voting_model.predict(X_test)
print("集成模型的准确率:", accuracy_score(y_test, y_pred_voting))
```

## 2. 二分类问题 - 其二

《泰坦尼克号幸存者预测》项目是 Kaggle 平台上的一个竞赛挑战，以该项目为例，记录一下我们打开项目页面后需要注意的内容。每个竞赛项目打开后，名称下方都有一行标签页：

- Overview：项目概况介绍，也说明了提交项目结果的流程和方法
- Data：数据集的介绍，以及下载链接
- Code：别人分享的代码，虽然说是代码，我看了一下有很多都是把解题思路写的很详细的
- Models：可能是不同类别的模型解题的记录（大概如此）
- Discussion：讨论平台
- Leaderboard：提交后评分的排名（现在基本都是 100%的正确率）
- Rules：规则说明（比如下载一个项目的数据集后，默认你接受了这个竞赛挑战，未提交答案的情况下，是不允许你下载其它项目的数据集的）

![2.4 Kaggle平台 - 泰坦尼克号幸存者分类](/pytorch/02_classification/02-04.png =560x)

一般来说，我们只用看 Overview 和 data 两个部分，前者是为了让我们了解，项目想让我们做什么（目标），后者是为了获取数据集，以及让我们快速了解特征的构成。

当然了，如果找不到解题思路，可以借鉴一下别人的思路和代码，从模仿中学；独立做出来了，有兴趣的话也可以去代码区或者讨论区，学习别人的经验，或者帮别人解惑，讨论一些内容。

如图所示，该项目的数据集有三个文件，一个训练集，一个测试集，还有一个提交 csv 的模版文件。

### 2.1 Pandas 数据检查方法

不论是机器学习的算法（线性回归、SVM、决策树等），还是神经网络的算法，都依赖数学计算，如距离计算、矩阵计算等等，这都计算都需要数值的输入。==数值数据是算法处理的通用格式，无论是分类、回归还是聚类任务。==

在我大致扫了一眼的情况下，发现有很多特征都是字符串形式的，比如名字（Name），船票编号（Ticket），登船港口（Embarked）等，船舱号（cabin）甚至还有缺失值（没有数据）出现。所以，首先先查看一下数据集的基本信息：

```py
import pandas as pd

data = pd.read_csv("titanic/train.csv", header=0)
print(data.info())

# 结果显示
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 891 entries, 0 to 890
Data columns (total 12 columns):
 #   Column       Non-Null Count  Dtype
---  ------       --------------  -----
 0   PassengerId  891 non-null    int64
 1   Survived     891 non-null    int64
 2   Pclass       891 non-null    int64
 3   Name         891 non-null    object
 4   Sex          891 non-null    object
 5   Age          714 non-null    float64
 6   SibSp        891 non-null    int64
 7   Parch        891 non-null    int64
 8   Ticket       891 non-null    object
 9   Fare         891 non-null    float64
 10  Cabin        204 non-null    object
 11  Embarked     889 non-null    object
dtypes: float64(2), int64(5), object(5)
memory usage: 83.7+ KB
None
```

通过 info() 的基本信息显示，我们发现有 5 种特征的数据类型是不对的，要从 object 转换成数值类型。另外，年龄（Age），船舱号（Cabin），登船港口（Embarked）这三种特征的数量不是 891 满的状态，说明它们都有缺失值（NaN）出现。通常遇到缺值的情况，我们会有几种常见的处理方式：

1. 如果缺值的样本占总数比例极高，我们可能就直接舍弃了，作为特征加入的话，可能反倒带入 noise，影响最后的结果了
2. 如果缺值的样本比例适中，而该属性非连续值特征属性(比如说类目属性)，那就把 NaN 作为一个新类别，加到类别特征中
3. 如果缺值的样本比例适中，而该属性为连续值特征属性，有时候我们会考虑给定一个 step 线性拟合填补空缺，或者根据已有的值填补。

知道了问题所在，就要开始解决问题了：

- 名字（Name）处理起来比较复杂，先删了试试，万一这个特征对预测没有帮助呢
- 性别（Sex）只有两个值，可以使用 LabelEncoder 或 OneHotEncoder 转换为数值
- 年龄（Age）本身就是数值类型，通过 describe() 函数查看一下统计信息，没有数字敏感度的人可以选择将统计信息可视化。这里就用年龄的平均值填充一下空缺

- 船票（Ticket）属于混合格式的数据，处理起来也比较复杂，先删了
- 船舱号（Cabin）缺失值占比太高，删除
- 登船港口（Embarked）是单独的一个字母代表不同的港口，只有三个港口（S，C，Q），最多的港口为 S，占比很大，缺失值就只有 2 个，就拿 ‘S’ 填充好了，然后用 LabelEncoder 转换即可

```py
import pandas as pd
from sklearn.preprocessing import LabelEncoder

data = pd.read_csv("titanic/train.csv", header=0)

# drop 是 Pandas 中的函数，用于删除行或列。参数 1：列名；参数 axis：1表示列，0表示行；
# 参数 inplace：是否直接在原数据（对象 data）上修改，True直接修改
# False 会返回一个新数据集，需要赋值给一个新对象，比如 data_new = xxx
data.drop('Name', axis=1, inplace=True)
data.drop('Ticket', axis=1, inplace=True)
data.drop('Cabin', axis=1, inplace=True)

# 数值转换：性别（Sex），船舱号（Cabin），登船港口（Embarked）
# 缺失值填补：年龄（Age），船舱号（Cabin），登船港口（Embarked）
# fillna 函数是 Pandas 中用于处理缺失值的方法，将缺失值 NaN 替换为自定义的值
data['Sex'] = data['Sex'].map({'male': 1,'female': 0})
data['Age'] = data['Age'].fillna(data['Age'].mean())
data['Embarked'] = data['Embarked'].fillna("S")
data['Embarked'] = LabelEncoder().fit_transform(data['Embarked'])

print(data.info())
```

经过这一波操作，我们可以知道 Pandas 的数据检查方法，对我们训练的前的数据处理非常有帮助，因此做一个整理记录：

1. 数据查看方法

   - data.head(4): 查看表格数据 前 4 行
   - data.tail(5): 查看表格数据 后 5 行
   - data.sample(6): 查看表格数据 随机 6 行

2. 数据统计方法

   - data.describe(): 查看==数值类型特征==的统计信息（总数、均值、标准差、最小值、最大值等）
   - data['Sex'].value_counts(): 用于统计==某列==中每个唯一值的出现次数，常用参数有 normalize（返回类别比例）、ascending（升序排列）、dropna（是否忽略缺失值），参数都是布尔值

3. 数据信息获取

   - data.info(): 查看数据集的基本信息（如列名、非空值数量、数据类型等）
   - data.columns(): 查看数据集的列名
   - data.shape(): 查看数据集的行数和列数
   - data.dtypes(): 查看每列的数据类型

4. 数据 缺失值 / 唯一值 检查

   - data.isnull(): 返回一个布尔 DataFrame，表示每个值是否为缺失值
   - data.isnull().sum(): 统计每列的缺失值数量
   - data.nunique(): 统计每列的唯一值数量
   - data['Sex'].unique(): 返回某列的唯一值列表

### 2.2 幸存者预测

```py
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# 训练集数据和标签分割
X_train = data.iloc[:, 2:].values
y_train = data.iloc[:, 1].values

# 标准化数据
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)

# 定义模型，训练
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)

# 测试集数据预处理
data1 = pd.read_csv("titanic/test.csv", header=0)
data1.drop('Name', axis=1, inplace=True)
data1.drop('Ticket', axis=1, inplace=True)
data.drop('Cabin', axis=1, inplace=True)

data1['Sex'] = data1['Sex'].map({'male': 1,'female': 0})
data1['Age'] = data1['Age'].fillna(data['Age'].mean())
data1['Fare'] = data1['Fare'].fillna(data['Fare'].mean())
data1['Embarked'] = LabelEncoder().fit_transform(data1['Embarked'])

# 分割特征，预测幸存率
X_test = data1.iloc[:, 1:].values
y_pred = model.predict(X_test)

# 将乘客 ID 和预测结果组合成一个 DataFrame
results = pd.DataFrame({
    'PassengerId': data1['PassengerId'],
    'Survived': y_pred
})

# 按照格式要求保存为 CSV 文件
results.to_csv('./titanic/pred_aosai_1.csv', index=False)
```

紧接着刚才训练集的数据处理，上方这段代码就是我第一次尝试解题的结果。但是很遗憾，计算出来的结果，我一看就知道肯定不对，因为生成的 CSV 文件中，预测结果全是 0，即全都不能幸存。提交后的结果为：准确率 62.2%。

### 2.3 尝试改进（失败）

首先是，我们需要对训练的好坏有一个认知，最基本的方法就是从训练集中拆分出来一部分，作为验证集，来验证模型训练的好坏，方法就是 train_test_split 函数。要注意的是，该方法默认不会保持标签类别比例，如果标签类别数量不均衡，需要用 stratify 参数。

```py
# 使用 stratify 参数保持标签的类别比例
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
```

另一种评估模型性能的方法是交叉验证，其核心思想是：

1. 将数据集划分为 K 个子集（称为 K 折）。
2. 轮流使用其中一个子集作为验证集，其余 K-1 个子集作为训练集。
3. 在每一轮中训练模型并评估性能。
4. 最终返回模型在 K 个验证集上的平均性能。

```py
model = RandomForestClassifier(n_estimators=50, random_state=42)

# cross_val_score 的参数为 模型对象，特征数据，标签数据，交叉验证的折数，评估指标
# 评估指标有很多，常见的有：accuracy、f1、roc_auc 等
scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
print("交叉验证准确率：", scores)
print("交叉验证的平均准确率：", scores.mean())

# 结果
交叉验证准确率： [0.75977654 0.78089888 0.84269663 0.76966292 0.84269663]
交叉验证的平均准确率： 0.799146318498525
```

1000 个数据以内的数据集通常被认为是小数据集。对于小数据集，交叉验证 是更推荐的方法，因为它可以更充分地利用数据，提供更可靠的模型评估。

评估模型性能的办法有了，然后就是使用 1.3 小节，决策树优化的各种方式，来尝试提高预测的准确率。需要注意的是：==数据增强仅能用于训练集，如果用于验证集或者测试集，会导致数据泄漏，从而影响模型的评估性能==。

所以 cross_val_score 函数直接搭配 SMOTE 是不可行的，但是网格搜索（GridSearchCV）的核心就包括交叉验证，我们可以通过 Pipeline，将数据增强和模型训练步骤整合到一起，并在 GridSearchCV 中实现交叉验证。

```py
# 训练集数据和标签分割
X = data.iloc[:, 2:].values
y = data.iloc[:, 1].values

# 标准化数据
scaler = StandardScaler()
X = scaler.fit_transform(X)

# 划分训练集和验证集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 创建 Pipeline
pipeline = make_pipeline(
    SMOTE(k_neighbors=4, random_state=42),
    RandomForestClassifier(random_state=42)
)

# 定义网格参数
param_grid = {
    'randomforestclassifier__n_estimators': [10, 30, 50],
    'randomforestclassifier__max_depth': [None, 10, 20],
    'randomforestclassifier__min_samples_split': [2, 5, 10],
    'randomforestclassifier__min_samples_leaf': [1, 2, 4],
    'randomforestclassifier__max_features': ['sqrt', 'log2', 0.5]
}

# 使用网格搜索
grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)

# 查看交叉验证结果，输出最佳参数组合
results = pd.DataFrame(grid_search.cv_results_)
print(results[['params', 'mean_test_score', 'std_test_score']])
print("最佳参数：", grid_search.best_params_)

# 测试集数据预处理
data1 = pd.read_csv("titanic/test.csv", header=0)
data1.drop('Name', axis=1, inplace=True)
data1.drop('Ticket', axis=1, inplace=True)
data1.drop('Cabin', axis=1, inplace=True)

data1['Sex'] = data1['Sex'].map({'male': 1,'female': 0})
data1['Age'] = data1['Age'].fillna(data['Age'].mean())
data1['Fare'] = data1['Fare'].fillna(data['Fare'].mean())
data1['Embarked'] = LabelEncoder().fit_transform(data1['Embarked'])

# 分割特征，使用模型的最佳参数进行预测
X_test = data1.iloc[:, 1:].values
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)

# 将乘客 ID 和预测结果组合成一个 DataFrame
results = pd.DataFrame({
    'PassengerId': data1['PassengerId'],
    'Survived': y_pred
})

# 按照格式要求保存为 CSV 文件
results.to_csv('./titanic/pred_aosai_2.csv', index=False)
```

很遗憾，并没有什么提升，但是这个挑战题目已经公开有些年了，网络上有很多大佬们的博客，推荐大家看一看。这里贴两个我看过的：[CSDN - Titanic](https://blog.csdn.net/weixin_45508265/article/details/112703541)，[知乎 - Titanic](https://zhuanlan.zhihu.com/p/176952225)

这两篇博文对我来说最大的收获就是，在实际解决问题的过程中，数据分析真的很重要，只有做好了数据分析，我们才能对当前情况的特征做出合理的处理。在之前的练习中，我确实忽略了这一点（野外散修疯狂向宗门天骄学习）。

## 3. 多分类问题

### 3.1 鸢尾花分类

```py
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import torch
from torch.utils.data import DataLoader, TensorDataset
from torch import nn, optim
import random
import numpy as np

# 固定随机数种子
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)

# 加载数据，定义列名
data = pd.read_csv("./iris/iris.data", header=None)
data.columns = ['sepal_len', 'sepal_width', 'petal_len', 'petal_width', 'class_name']

# 将分类标签转化为数字
name_map = {'Iris-setosa': 0, 'Iris-versicolor': 1, 'Iris-virginica': 2}
data['class_name'] = data['class_name'].map(name_map)

# 提取特征和标签
X = data.iloc[:,:-1].values
y = data['class_name'].values

# 标准化数据，拆分训练集和测试集
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 转化为张量，创建 DataLoader
train_loader = DataLoader(TensorDataset(torch.tensor(X_train, dtype=torch.float32),
                                        torch.tensor(y_train, dtype=torch.long)),
                                        batch_size=8, shuffle=True)
test_loader = DataLoader(TensorDataset(torch.tensor(X_test, dtype=torch.float32),
                                       torch.tensor(y_test, dtype=torch.long)),
                                       batch_size=8, shuffle=False)

# 定义 Softmax 神经网络模型
class SoftmaxNN(nn.Module):
    def __init__(self):
        super(SoftmaxNN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(4, 10),
            nn.ReLU(),
            nn.Linear(10, 3)
        )
    def forward(self, x):
        return self.net(x)

# 实例化模型、损失函数、优化器
model = SoftmaxNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 训练模型
epochs = 20
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in train_loader:
        outputs = model(inputs)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_loss = running_loss / len(train_loader)
    train_accuracy = correct / total

    if epoch % 5 == 4:
        print(f"Epoch {epoch+1}/{epochs}, Loss: {train_loss:.4f}, Accuracy: {train_accuracy*100:.2f}")

# 测试模型
model.eval()
correct = 0
total = 0

with torch.no_grad():
    for inputs, labels in test_loader:
        outputs = model(inputs)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

test_accuracy = correct / total
print(f"Test Accuracy: {test_accuracy*100:.2f}")
```

在机器学习和深度学习中，很多操作是随机的，例如：数据划分（如 train_test_split）；数据划分（如 train_test_split）；数据加载时的打乱顺序（如 DataLoader 的 shuffle=True）等等。

固定随机种子可以确保每次运行代码时，这些随机操作的结果一致，从而使实验结果可重复。但是不同的库，都有自己的随机数生成器，所以需要都统一固定。

```py
# Mac 仅用前三个就足够；英伟达显卡 cuda 需要全部六个。

random.seed(42)  # 固定 Python 随机种子
np.random.seed(42)  # 固定 NumPy 随机种子
torch.manual_seed(42)  # 固定 PyTorch 随机种子（Mac 的 CPU MPS 都包含）

torch.cuda.manual_seed(42)  # 固定 GPU 随机种子（如果使用 GPU）
torch.backends.cudnn.deterministic = True  # 确保 CuDNN 确定性
torch.backends.cudnn.benchmark = False  # 禁用 CuDNN 自动优化
```

其次是创建 DataLoader 那里，该函数已经在上一章节讲过，要说明的是里面嵌套的两个，torch.tensor 和 TensorDataset：

```py
# torch.tensor 将数据（如 NumPy 数组或 Python 列表）转换为 PyTorch 张量。
tensor_data = torch.tensor([1, 2, 3], dtype=torch.float32)
tensor_label = torch.tensor([1, 2, 3], dtype=torch.long)

# TensorDataset 将输入特征和标签打包成一个数据集对象，方便通过索引访问。
dataset = TensorDataset(tensor_data, tensor_label)
```

另一个要说的就是新的模型方法 Sequential。nn.Sequential 是 PyTorch 中的一个容器（Container），用于按顺序组合多个层。它可以将多个层（如 Linear、Conv2d、ReLU 等）打包成一个模块，避免重复写 forward 函数，简化模型定义。其余的内容我在别的地方都有提到过，就不重复了，最后贴一下结果吧：

```py
Epoch 5/20, Loss: 0.2541, Accuracy: 91.67
Epoch 10/20, Loss: 0.1040, Accuracy: 95.83
Epoch 15/20, Loss: 0.0744, Accuracy: 96.67
Epoch 20/20, Loss: 0.0659, Accuracy: 95.83
Test Accuracy: 100.00
```

### 3.2 猫狗图像区分

该项目我使用了预训练模型 ResNet-18，它是一个非常常见的卷积神经网络（CNN）架构，它被设计用来在计算机视觉任务中提取图像特征。使用预训练模型的好处是，可以避免从头开始训练模型，这样会大大减少训练时间和计算资源，所以它们（ResNet，VGG，AlexNet 等等）常常被拿来做迁移学习。

这些预训练模型大都是通过 ImageNet 的数据集做的训练，因此相关参数设置为 ImageNet 对应值，训练的效果会更好，比如图像标准化时对应 RGB 通道的均值和标准差。其余涉及到的新函数我会写在下一小节（3.3），和鸢尾花分类一样，还是代码全部贴上。

```py
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# 设置训练和测试数据集路径
train_dir = "./archive/training_set/training_set/"
test_dir = "./archive/test_set/test_set/"

transform = transforms.Compose([
    # ResNet 预训练模型的标准输入尺寸为 224x224
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # 基于 ImageNet 的 RGB 三通道的均值和标准差分别如下
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 加载训练数据和测试数据
train_data = datasets.ImageFolder(root=train_dir, transform=transform)
test_data = datasets.ImageFolder(root=test_dir, transform=transform)

# 创建数据加载器
batch_size = 32
train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False)

# 使用预训练的 ResNet18 作为基础模型
model = models.resnet18(weights='IMAGENET1K_V1')
# 替换最后一层，适应我们猫狗分类的任务（2个类）
model.fc = nn.Linear(model.fc.in_features, 2)

# 选择 GPU 或 CPU，定义损失函数和优化器
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model = model.to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 训练模型
num_epochs = 5
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        # 前向传播
        outputs = model(inputs)
        loss = criterion(outputs, labels)

        # 清除之前的梯度，反向传播并优化
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # 计算准确率
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)

        running_loss += loss.item()

    epoch_loss = running_loss / len(train_loader)
    epoch_accuracy = correct / total * 100
    print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {epoch_loss:.4f}, Accuracy: {epoch_accuracy:.2f}%")

# 测试模型
model.eval()
correct = 0
total = 0
with torch.no_grad():
    for inputs, labels in test_loader:
        inputs, labels = inputs.to(device), labels.to(device)
        outputs = model(inputs)
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)

test_accuracy = correct / total * 100
print(f"Test Accuracy: {test_accuracy:.2f}%")

# 保存模型
torch.save(model.state_dict(), "./archive/cat_dog_classifier.pth")
```

### 3.3 猫狗分类笔记

（1）ImageFolder

它是 PyTorch 中 torchvision.datasets 模块提供的一个非常实用的类，用于加载图像数据集。它的主要作用是从给定的目录中读取图像，并根据图像所在的子文件夹来自动为每个图像分配标签。ImageFolder 假设数据集的目录结构如下：

- root: 根目录，指向数据集文件夹。
- class_a, class_b, …: 每个子文件夹代表一个类别，子文件夹的名字就是该类别的标签。

```py
root/
    class_a/
        image1.jpg
        image2.jpg
        ...
    class_b/
        image1.jpg
        image2.jpg
        ...
    ...
```

ImageFolder 的关键参数有四个：

1. root：数据集的根目录路径。
2. transform：可选函数，用于对图像进行预处理（例如缩放、裁剪等）。返回的是张量 Tensor。
3. target_transform：可选函数，用于处理标签的转换（例如标签的数字编码转化为 one-hot 编码等）。
4. loader：可选的自定义图像加载函数，默认使用 PIL.Image.open 来加载图像。如果图像格式不同，可以通过这个参数自定义加载方法。

要注意的是，我将该数据集下载下来后，每个子文件夹（dogs，cats）中存在一个非图像文件，该文件不是必要文件，所以直接删除即可。如果是必要文件，可以用 PIL 库或者 OpenCV 库去过滤掉非图像文件。

（2）resnet18

ResNet 有很多个模型，18 号只是其中一个，模型的参数 weights 表示权重，IMAGENET1K_V1 是标准权重，即在 ImageNet 的数据集上训练出来的。预训练的权重意味着这个网络已经学到了如何识别一些通用的图像特征（例如边缘、纹理、形状等），它可以快速迁移到别的识别任务中去。

```py
model = models.resnet18(weights='IMAGENET1K_V1')
model.fc = nn.Linear(model.fc.in_features, 2)
```

model.fc 表示 ResNet18 的最后一层（全连接层），它是用来分类 1000 个类别的，所以我们需要将其转换为猫狗识别的 2 类，使用新的全连接层 nn.Linear 替换原本的。

model.fc.in_features 获取了最后一层全连接层的输入特征数（即之前网络提取到的特征的数量）。

（3）调参及结果

```py
Epoch [1/5], Loss: 0.2004, Accuracy: 91.86%
Epoch [2/5], Loss: 0.1295, Accuracy: 95.12%
Epoch [3/5], Loss: 0.1561, Accuracy: 93.68%
Epoch [4/5], Loss: 0.0820, Accuracy: 96.78%
Epoch [5/5], Loss: 0.0701, Accuracy: 97.21%
Test Accuracy: 94.22%
```

我的 Mac M3 Air 跑这个项目倒是也能跑，就是跑的太慢了，算力一般还发热，所以我试过几次之后就不想继续了，这里做一个记录和改进的思路。

Batch_size 对于内存的占用没有我想象的高，224\*224 的图像，我从 16 调到了 64，只增加了 1GB 多的内存使用。学习率我试过 0.01 为初始值，效果没有 0.001 好，并且我也尝试过学习率衰退函数（写在优化器的后面）：

```py
# 参数为举例：每训练 10 个 epoch 就把学习率减小 10 倍
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)
```

因为算力不够，运行时间太长，我就两步一跳，结果过拟合了感觉，训练集的准确率上来了，测试集反而下降了。之后我就没有再尝试了，直接采用了第一次的参数，如上一小节代码所示。

（4）另一个优化思路

该数据集总共有 1 万张图像，训练集中猫狗各 4000 张，测试集中猫狗各 1000 张，从数量的角度来看算是中小型数据集。我们使用的方法是基于 CNN 的 ResNet，CNN 的特点是要所有图像固定统一的尺寸。

对于==长宽比差别较小==的图像而言，直接 resize 成正方形是简单有效的办法，因为即使图像有形变，但是对主体的特征学习而言，是可以被机器辨别和接受的。

对于==长宽比差别较大==的图像（1:2 甚至 1:3），可以使用 Padding 填充短的那边。如果直接用 0（黑色像素）或者 256（白色像素）填充，可能会引入很多噪声，建议使用均值，以及将图像主体放在中央的形式，减少填充后噪声带来的影响。

对于==重要信息在边缘==的情况，可以尝试裁剪，或者考虑多尺度训练。

我用代码统计过，训练集中长宽比超过 1:2 的图像数量为 75 个，测试集中长宽比超过 1:2 图像数量为 12 个，数量很少，可以考虑直接删除训练集中的 75 个数据，或者对其做 Padding。训练集也是一样的思路，可以对比 3 次，删除这 12 个数据，不处理直接用，对这 12 个数据做 Padding，然后看看结果。
