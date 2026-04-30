---
title: 01-排序算法
date: 2026/04/16
categories:
  - 数据结构与算法
tags:
  - 排序算法
  - c++
---

所谓排序，就是使一串记录，按照其中的某个或某些关键字的大小，递增或递减的排列起来的操作。排序算法，就是如何使得记录按照要求排列的方法。排序算法在很多领域得到相当地重视，尤其是在大量数据的处理方面。一个优秀的算法可以节省大量的资源。

![1.1 排序算法总览](/dataFoundry/dataStructure/01_sort_algorithm/sort.png =560x)

## 1. 比较类排序

| 算法名称 | 平均时间复杂度 | 最好情况     | 最坏情况     | 空间复杂度  | 稳定性   | 排序方式   |
| :------- | :------------- | :----------- | :----------- | :---------- | :------- | :--------- |
| 冒泡排序 | $O(n^2)$       | $O(n)$       | $O(n^2)$     | $O(1)$      | **稳定** | 内排序     |
| 选择排序 | $O(n^2)$       | $O(n^2)$     | $O(n^2)$     | $O(1)$      | 不稳定   | 内排序     |
| 插入排序 | $O(n^2)$       | $O(n)$       | $O(n^2)$     | $O(1)$      | **稳定** | 内排序     |
| 希尔排序 | $O(n^{1.3})$   | $O(n)$       | $O(n^2)$     | $O(1)$      | 不稳定   | 内排序     |
| 快速排序 | $O(n\log n)$   | $O(n\log n)$ | $O(n^2)$     | $O(\log n)$ | 不稳定   | 内排序     |
| 归并排序 | $O(n\log n)$   | $O(n\log n)$ | $O(n\log n)$ | $O(n)$      | **稳定** | **外排序** |
| 堆排序   | $O(n\log n)$   | $O(n\log n)$ | $O(n\log n)$ | $O(1)$      | 不稳定   | 内排序     |

### 1.1 冒泡排序（Bubble Sort）

**通过相邻比较交换，像气泡一样把最大的数浮上去**。简单、稳定，但效率较低。适合的场景为：

- **小规模数据**：当数据量很小（例如 n<50 或 100 ）时，冒泡排序的简单性使其成为一个不错的选择，性能差异不明显。
- **数据基本有序**：如果数据已经接近排好序的状态，冒泡排序的效率会非常高。特别是经过优化的版本（加入提前终止判断），在最好情况下（数据已完全有序）时间复杂度可以达到 O(n) 。

:::: code-group
::: code-group-item 原始冒泡排序

```cpp
#include <iostream>
#include <vector>

// 冒泡排序
void bubbleSort(std::vector<int>& arr) {
    // 外层循环控制排序的轮数，内层循环进行相邻元素的比较和交换
    // 每轮结束后，最大的元素会“冒泡”到末尾，所以比较次数为 n - i - 1
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    std::vector<int> data = {64, 34, 25, 12, 22, 11, 90};

    std::cout << "排序前: ";
    for (int num : data) { std::cout << num << " "; }
    std::cout << std::endl;

    bubbleSort(data);

    std::cout << "排序后: ";
    for (int num : data) { std::cout << num << " "; }
    std::cout << std::endl;

    return 0;
}
```

:::
::: code-group-item 优化终止判断

````cpp
// 优化版冒泡排序
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();

    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false; // 标志位，用于检测本轮是否发生了交换

        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true; // 发生了交换，标记为true
            }
        }

        // 如果本轮没有发生任何交换，说明数组已经完全有序，提前终止
        if (!swapped) break;
    }
}
:::
::::

### 1.2 快速排序（Quick Sort）

采用 ==分治策略==，**通过选取基准值将数据分割为独立的两部分（左边比基准小，右边比基准大），递归进行排序**。它是冒泡排序的改进版，属于交换排序，平均速度极快，但不稳定。适合的场景为：

- **大规模数据排序**：这是快速排序最主要的应用场景。在处理海量数据时，其平均时间复杂度为 $O(nlogn)$，且常数因子很小，是目前基于比较的内部排序中公认最快的算法之一。
- **对平均性能要求高**：在大多数随机分布的数据场景下，快速排序的表现优于归并排序和堆排序。虽然最坏情况下（如数据已完全有序且未优化基准选择）时间复杂度会退化为 $O(n^2)$ ，但通过“三数取中”或“随机选取基准”等优化手段，可以极大概率避免这种情况。

```cpp
int partition(std::vector<int>& arr, int low, int high) {
    // 1. 选取基准值（通常选第一个元素）
    int pivot = arr[low];

    // 2. 左右指针向中间逼近
    while (low < high) {
        // 从右向左找：找到第一个小于 pivot 的数。把这个小数填到左边的坑里。
        while (low < high && arr[high] >= pivot) {
            high--;
        }
        arr[low] = arr[high];

        // 从左向右找：找到第一个大于 pivot 的数，把这个大数填到右边的坑里
        while (low < high && arr[low] <= pivot) {
            low++;
        }
        arr[high] = arr[low];
    }

    // 3. 此时 low == high，这就是基准值（pivot）的正确位置
    arr[low] = pivot;
    return low;
}

// 快速排序主函数
void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high); // 获取基准值的最终位置
        quickSort(arr, low, pi - 1); // 递归排序左半部分
        quickSort(arr, pi + 1, high); // 递归排序右半部分
    }
}
````

### 1.3 插入排序（Insertion Sort）

**通过构建有序序列，将新元素插入到前面已排序数据的合适位置，像整理扑克牌一样**。简单、稳定，且在小规模或基本有序数据上表现优异。适合的场景为：

- **小规模数据**：与冒泡排序类似，插入排序的代码简单，常数项小，在处理少量数据时效率很高。
- **数据基本有序**：这是插入排序的“高光时刻”。如果数据已经接近排好序，它只需要进行很少的比较和移动操作。在最好情况下（数据已完全有序），其时间复杂度可以达到 O(n)，性能远超冒泡和选择排序。
- **在线排序**：插入排序是一种“在线”算法，意味着它可以在接收数据的同时进行排序，==非常适合处理实时数据流==。

```cpp
void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++){
        int key = arr[i];
        int j = i - 1;

        // 将符合条件的元素向右移动一位，为 key 腾出正确的位置
        while (j >= 0 && arr[j] > key){
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

### 1.4 希尔排序（Shell Sort）

**通过分组插入排序，先大步调整消除长距离逆序，再小步微调**。高效、不稳定，是插入排序的“倍速版”。适合的场景为：

- **中等规模数据**：对于几千到几万条数据，希尔排序比插入排序快得多，且不需要像快速排序那样复杂的递归实现，代码相对紧凑。
- **对稳定性无要求**：由于希尔排序是跳跃式移动元素，相同元素的相对位置可能会改变（不稳定），因此适用于不要求稳定排序的场景。
- **嵌入式或内存受限环境**：它是原地排序算法（空间复杂度 O(1)），且实现简单，适合资源受限的系统。

我们假设有一组数据是完全逆序的，比如 [8,7,6,5,4,3,2,1]，如果直接使用插入排序，需要做 7 次，并且后移赋值操作，要做 35 次。但如果用希尔排序：

1. 假设我们的增量序列为 [n/2,n/4,...,1]，那么刚开始分组的间隔（gap）为 n/2=4
2. [8,4]，[7,3]，[6,2]，[5,1] --> [4,8]，[3,7]，[2,6]，[1,5] --> [4,3,2,1,8,7,6,5]
3. 第二次 gap 为 n/4=2，[4,3,2,1]，[8,7,6,5] --> [1,2,3,4]，[5,6,7,8]
4. 第三次 gap 为 n/8=1，直接使用插入排序（这里已经正序了，不做计算，所以插入排序使用 6 次，后移复制操作 26 次）

```cpp
void shellSort(std::vector<int>& arr){
    int n = arr.size();
    int gap = n / 2;

    while(gap > 0){
        for (int i = gap; i < n; i++){
            int current = arr[i];
            int preIndex = i - gap;
            // 插入排序的过程
            while (preIndex >= 0 && arr[preIndex] > current){
                arr[preIndex + gap] = arr[preIndex];
                preIndex -= gap;
            }
            arr[preIndex + gap] = current;
        }
        gap = gap / 2;
    }
}
```

### 1.5 选择排序（Selection Sort）

**通过不断选择剩余元素中的最大值，依次放到已排序序列的末尾**。简单、不稳定，但交换次数极少。适合的场景为：

- **小规模的无序数据**：当数据量较小（如 n<50）且对性能要求不高时，选择排序的简单性使其易于实现和理解，代码逻辑非常直观。
- **交换操作成本极高的场景**：选择排序每轮仅进行一次交换（将最大值与当前位置交换），总交换次数为 O(n)，远少于冒泡排序。当数据元素较大（如结构体或对象）且移动成本高时，选择排序能显著减少数据移动开销。

```cpp
void selectionSort(std::vector<int>& arr){
    int n = arr.size();

    for (int i = n - 1; i > 0; i--){
        int max_index = i;
        int max_value = arr[i];
        for (int j = 0; j < i; j++){
            if (arr[j] > max_value) {
                max_index = j;
                max_value = arr[j];
            }
        }
        if (max_index != i) {
            std::swap(arr[i], arr[max_index]);
        }
    }
}
```

### 1.6 堆排序（Heap Sort）

**利用堆这种完全二叉树结构，通过构建最大堆（或最小堆）并反复提取堆顶元素实现排序**。高效、不稳定，适合大规模数据。适合的场景为：

- **大规模数据的稳定高效排序**：堆排序的时间复杂度始终为 O(n log n)，不受输入数据分布影响（与快速排序的最坏情况 O(n²) 相比更稳定），适合对性能稳定性要求高的场景。
- **内存受限的在线排序**：作为原地排序算法（空间复杂度 O(1)），堆排序不需要额外内存空间，且能在数据流中动态维护堆结构，==适合嵌入式系统或实时数据处理==。
- **优先队列的实现基础**：堆结构天然支持优先队列操作（如获取最大值/最小值），堆排序可直接用于实现 ==任务调度、Top K 问题等需要频繁访问极值== 的场景。

:::: code-group
::: code-group-item 堆排序接口

```cpp
#include <algorithm>

void heapSort(std::vector<int>& arr){
    // 调用 STL 的堆排序接口
    std::sort_heap(arr.begin(), arr.end());
}
```

:::
::: code-group-item 建堆与交换接口

```cpp
#include <algorithm>

void heapSort(std::vector<int>& arr){
    // 1. 建堆：构建大顶堆
    std::make_heap(arr.begin(), arr.end());

    // 2. 排序：不断把堆顶（最大值）移到末尾，并缩小堆的范围
    // 并且 pop 函数会自动进行 下沉操作(重新建堆)，保持堆的性质
    for (int i = arr.size(); i > 0; i--){
        std::pop_heap(arr.begin(), arr.begin() + i);
    }
}
```

:::
::: code-group-item 手写堆排序

```cpp
// 1. 【核心地基】堆化函数 (Heapify)
// 作用：假设当前节点的左右子树已经是堆了，我只负责把当前节点“下沉”到正确位置
// 参数：arr是数组，n是堆的有效长度，i是当前要调整的节点索引
void heapify(std::vector<int>& arr, int n, int i){
    int largest = i;          // 假设当前节点是最大的
    int left = 2 * i + 1;     // 左孩子索引
    int right = 2 * i + 2;    // 右孩子索引

    // 如果左孩子比“最大值”还大，更新最大值索引
    if (left < n && arr[left] > arr[largest])
        largest = left;

    // 如果右孩子比“最大值”还大，更新最大值索引
    if (right < n && arr[right] > arr[largest])
        largest = right;

    // 如果最大值不是当前节点，说明需要交换
    if (largest != i) {
        std::swap(arr[i], arr[largest]); // 交换
        heapify(arr, n, largest); // 递归：我们需要继续检查它是否还需要往下沉
    }
}

// 2. 【排序主函数】
void heapSort(std::vector<int>& arr) {
    int n = arr.size();

    // 第一步：建堆。从最后一个 非叶子节点(索引是 n/2 - 1) 开始，逐个调用 heapify
    for (int i = n / 2 - 1; i >= 0; --i) {
        heapify(arr, n, i);
    }

    // 第二步：排序。此时 arr[0] 是最大值
    // 我们把它和末尾元素交换，然后缩小堆的范围，再重新堆化
    for (int i = n - 1; i > 0; --i) {
        std::swap(arr[0], arr[i]);  // 把堆顶最大值扔到数组末尾
        heapify(arr, i, 0);  // 对剩下的 i 个元素重新堆化（从根节点 0 开始）
    }
}
```

:::
::::

### 1.7 归并排序（Merge Sort）

采用==分治策略==，**将数组递归拆分为子序列并合并有序子序列**。稳定、高效，但需要额外内存。适合的场景为：

- **需要稳定排序的场景**：归并排序是稳定排序算法（相同元素的相对位置不变），适合对排序稳定性有要求的场景，如多关键字排序（先按成绩排序，再按姓名排序）。
- **大规模数据的外部排序**：归并排序的时间复杂度始终为 O(n log n)，且适合处理无法全部加载到内存的大规模数据（如文件排序），通过分块归并可高效利用磁盘 I/O。
- **链表结构的排序**：归并排序对链表的排序效率极高（无需额外空间，合并操作仅需调整指针），是链表排序的首选算法，时间复杂度 O(n log n) 且空间复杂度 O(1)。

:::: code-group
::: code-group-item 简单粗暴接口

```cpp
// 全能的大管家（stable_sort）:把这堆乱七八糟的数据给我排好序！
void mergeSort(std::vector<int>& arr) {
    std::stable_sort(arr.begin(), arr.end());
}
```

:::
::: code-group-item 高性能严苛接口

```cpp
// 挑剔的特种兵（inplace_merge）：把这两段已经排好序的队伍合并成一段！
void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);

        // 极其严格，[first, mid) 和 [mid, last) 必须各自有序
        // 必须有 mid（它不知道哪里是分界线），mid 为右区间的起始位置，所以是 mid + 1
        std::inplace_merge(arr.begin() + left,
            arr.begin() + mid + 1, arr.begin() + right + 1);
    }
}
```

:::
::: code-group-item 手写归并排序

```cpp
void merge(std::vector<int>& arr, int left, int mid, int right) {
    int i = left;    // 左子数组的起始索引
    int j = mid + 1; // 右子数组的起始索引
    std::vector<int> temp; // 临时数组

    // 合并两个子数组
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i]);
            i++;
        } else {
            temp.push_back(arr[j]);
            j++;
        }
    }

    // 复制剩余元素
    while (i <= mid) {
        temp.push_back(arr[i]);
        i++;
    }
    while (j <= right) {
        temp.push_back(arr[j]);
        j++;
    }

    // 将临时数组复制回原数组
    for (int k = left; k <= right; k++) {
        arr[k] = temp[k - left];
    }
}

void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
```

:::
::::

## 2. 非比较类排序

| 算法名称 | 平均时间复杂度 | 最好情况    | 最坏情况    | 空间复杂度 | 稳定性   | 排序方式   |
| :------- | :------------- | :---------- | :---------- | :--------- | :------- | :--------- |
| 计数排序 | $O(n+k)$       | $O(n+k)$    | $O(n+k)$    | $O(k)$     | **稳定** | 内排序     |
| 桶排序   | $O(n+k)$       | $O(n)$      | $O(n^2)$    | $O(n+k)$   | **稳定** | **外排序** |
| 基数排序 | $O(d(n+k))$    | $O(d(n+k))$ | $O(d(n+k))$ | $O(n+k)$   | **稳定** | 内排序     |

### 2.1 计数排序（Counting Sort）

**统计频次，用空间换时间。不开辟额外的排序空间，而是开辟一个数组来记录每个数值出现的次数，最后直接根据次数还原有序序列**。速度极快，但非常“吃”内存。适合的场景为：

- **数据范围较小且密集**：例如对 [1, 100] 范围内的 10000 个整数排序。如果最大值 k 远小于 n，它是所有排序算法中最快的。
- **重复数据多**：因为它是基于计数而非交换，重复元素越多，它的优势越明显（不需要反复移动元素）。

虽然默认操作是通过寻找最大值与最小值，开辟一个固定长度的数组来进行计数。但是如果数据范围稀疏，也可以转化为字典，也就是哈希表的方式来统计频率，比起开辟数组更为高效。

:::: code-group
::: code-group-item 标准计数排序

```cpp
#include <algorithm>  // min_element, max_element

void countingSortDefault(std::vector<int>& arr) {
    if (arr.empty()) return;

    // 找到最大值和最小值，以确定计数数组的大小
    int maxVal = *std::max_element(arr.begin(), arr.end());
    int minVal = *std::min_element(arr.begin(), arr.end());
    std::vector<int> count(maxVal - minVal + 1, 0);

    // 统计每个元素的出现次数，元素相减是做相对映射。
    for (int num : arr) {
        count[num - minVal]++;
    }

    // 重建排序后的数组
    int index = 0;
    for (int i = 0; i < count.size(); i++) {
        while (count[i] > 0) {
            arr[index++] = i + minVal;
            count[i]--;
        }
    }
}
```

:::
::: code-group-item 字典统计写法

```cpp
#include <unordered_map>
#include <algorithm>

void countingSortHashMap(std::vector<int>& arr) {
    if (arr.empty()) return;

    // 1. 因为哈希表本身是无序的，依然需要找最大最小值，以便最后还原顺序
    int minVal = *std::min_element(arr.begin(), arr.end());
    int maxVal = *std::max_element(arr.begin(), arr.end());

    // 2. 创建哈希表（字典），键(key)是具体的数值，值(value)是出现的次数
    std::unordered_map<int, int> countMap;

    // 3. 统计频率（这里不需要减 minVal 了！）
    for (int num : arr) {
        countMap[num]++; // 直接把数字本身作为键存入
    }

    // 4. 重建数组
    int index = 0;
    // 我们依然需要从 minVal 遍历到 maxVal，这样才能保证填回去的顺序是从小到大的
    for (int num = minVal; num <= maxVal; ++num) {
        // 在哈希表中查找这个数，countMap[num] 如果没找到会自动返回 0
        int frequency = countMap[num];

        while (frequency > 0) {
            arr[index++] = num; // 直接填 num，不需要加 minVal 了
            frequency--;
        }
    }
}
```

:::
::::

### 2.2 桶排序（Bucket Sort）

分而治之，将数据映射到不同的“桶”中。**先根据数值范围将数据分散到有限数量的桶里，再对每个桶单独排序（或用插入排序），最后按顺序合并**。在数据均匀分布时速度极快。适合的场景为：

- **数据分布均匀**：例如对 0~1 之间的随机浮点数排序，或者学生成绩（0-100分）排序。
- **外部排序（海量数据）**：当数据量大到内存装不下时，可以将数据分桶存储到磁盘文件中，分批次处理后再合并。

虽然也是分治法的思想，但是实现略有不同。快速排序的分治，是不断的递归，调用自己继续分区和排序。而这里的分，更多的是分桶，治理可以任意选用排序算法。

```cpp
void bucketSort(std::vector<int>& arr) {
    if (arr.empty()) return;

    // 找到最大值和最小值
    int maxVal = *max_element(arr.begin(), arr.end());
    int minVal = *min_element(arr.begin(), arr.end());

    // 桶的数量
    int bucketCount = (maxVal - minVal) / arr.size() + 1;
    std::vector<std::vector<int>> buckets(bucketCount);

    // 将元素分配到桶中
    for (int num : arr) {
        int bucketIndex = (num - minVal) / arr.size();
        buckets[bucketIndex].push_back(num);
    }

    // 对每个桶进行排序并合并结果
    int index = 0;
    for (auto& bucket : buckets) {
        std::sort(bucket.begin(), bucket.end());
        for (int num : bucket) {
            arr[index++] = num;
        }
    }
}
```

### 2.3 基数排序（Radix Sort）

**按位排序，从低位到高位逐位整理。它不直接比较数值大小，而是先按个位分堆，再按十位分堆，层层递进**。

1. ==确定最大位数==：找到列表中最大数字的位数，确定需要排序的轮数。
2. ==按位排序==：从最低位开始，依次对每一位进行排序（通常使用计数排序或桶排序作为子排序算法）。
3. ==合并结果==：每一轮排序后，更新列表的顺序，直到所有位数排序完成。

稳定且高效，但实现较复杂。适合的场景为：

- **固定长度的整数或字符串**：例如身份证号、电话号码、学号等。因为位数 d 固定且较小，效率极高。
- **数据范围极大但位数少**：当数据最大值很大（例如 $10^9$），导致计数排序无法使用时，基数排序依然能保持 O(n) 级别的线性效率。

```cpp
void radixSort(std::vector<int>& arr) {
    if (arr.empty()) return;

    // 找到最大值以确定排序的位数
    int maxVal = *max_element(arr.begin(), arr.end());

    // 从个位开始，对每一位进行计数排序
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        std::vector<int> output(arr.size());
        int count[10] = {0};

        // 统计每个桶的数量
        for (int num : arr) {
            count[(num / exp) % 10]++;
        }

        // 累加计数
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // 构建输出数组
        for (int i = arr.size() - 1; i >= 0; i--) {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }

        // 将输出数组复制回原数组
        for (size_t i = 0; i < arr.size(); i++) {
            arr[i] = output[i];
        }
    }
}
```
