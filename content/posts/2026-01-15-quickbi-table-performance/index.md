---
title: "前端性能优化篇—QuickBI多维表格底座性能提升一个数量级（百万单元格）"
header-img: imgs/cover-ai.jpg
catalog: true
date: 2026-01-15 10:00:00
subtitle: "Quick BI 多维表格底座性能优化实践"
tags:
  - Performance
  - Table
categories:
  - Frontend
---
# 前端性能优化篇—QuickBI多维表格底座性能提升一个数量级（百万单元格）

关于**Quick BI**多维表格的介绍可以看我的另一篇文章，这里就不过多介绍了：

[复杂表格组件（React）的实现与思考](/blog/2025-01-14-react-complex-table)

# 背景

## 承载业务的数据量级

做需求前需要明晰具体业务场景，目前我们产品在图表数据量方面的规格限制如下：

1.  取数（“行”）上限：目前Quick BI产品在公共云上限**一万**，部分独立部署客户最高放开到**十万**。
    
2.  列数上限：默认列维度值组合数不能超过**五百**。
    
3.  单元格上限：默认行列组合不能超过**百万**。
    

因此表格组件承载的最大数据量在百万。综合以上，本次优化数据量目标是**百万单元格**。

## 现状表现

在处理十万级单元格场景下会比较卡，到百万级单元格场景下会表现为不可用状态（非常卡顿或崩溃）。

客户答疑咨询表格组件性能相关问题或者页面崩溃问题较多，崩溃如下图所示：

![image.png](imgs/image-001.png)

## 当前解决方案

当前我们提供的解决方案是让客户调整，如增加查询调整、增加分页器、减少分页条数或者减少合并单元格等方法来绕过表格的大数据量渲染和计算。虽然这样确实能解决客户问题，但是部分客户的需求场景就是一次性返回大量数据以便对数据进行快速分析。因此，这并不是直接解决问题的方案。

那换个思路，是否可以直接在表格底座上改造，以支持百万数据量级渲染？于是我开始一步步调研、梳理和优化产品表格底座的计算和渲染性能问题。

## 面临的挑战

**一、改造表格底座直接影响面很大：**

1.  表格作为仪表板最常用图表之一，被用户使用数量超过一百万，任何细微的改动都有客诉风险。![image.png](imgs/image-002.png)
    
2.  项目里有10+直接调用和50+间接表格底座组件的地方。
    

**二、表格底座本身足够复杂且涵盖的功能场景很多，如：**

行高/列宽计算、合并单元格渲染和计算、行/列冻结、圈选...

所以整体改造必须奠定在“涵盖和保证表格各类功能使用和体验”的背景下进行。

# 最终效果

先说最终性能优化效果

## 测试基准

:::
**测试环境：**QBI 6.1版本 vs QBI 6.0.3版本

**对比报表：**[百万数据量-日常环境](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=2b6162a6-8e93-47af-b031-a521816743c6&accessTicket=f0b8c706-5596-4f4c-83c8-545eeefd3168&dd_orientation=auto)和[十万数据量-日常环境](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=42c4dc4a-68e8-4784-a11c-c0a6c01aca0d&accessTicket=dfde05ea-4c7f-4410-bd47-9c606816f9c9&dd_orientation=auto)

**设备：**M2 MacBook Pro MacOS 15.1.1

**屏幕尺寸：**1920\*1080

**指标依据：**

首屏测试：使用内部采集的组件性能诊断数据（指标为当表格计算完行高列宽并渲染完成时机）

运行时测试：匀速间隔性纵向滚动表格约至200行
:::

## 百万单元格量级（10w行\*10列）

报表链接：[百万数据量-日常环境](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=2b6162a6-8e93-47af-b031-a521816743c6&accessTicket=f0b8c706-5596-4f4c-83c8-545eeefd3168&dd_orientation=auto)

### 优化前

#### 首屏指标（13s）

![image.png](imgs/image-003.png)

#### 运行时指标（300ms，有阻塞任务）

滚动事件执行任务300ms，基本为长任务，其中有超7s的阻塞性任务，无法继续向下滚动（基本不可用）

![image.png](imgs/image-004.png)

### 优化后

#### 首屏指标（3.4s）

![image.png](imgs/image-005.png)

#### 运行时指标（30ms，无阻塞任务）

滚动事件执行任务30ms，基本无长任务阻塞

![image.png](imgs/image-006.png)

## 十万单元格量级（1w行\*10列）

报表链接：[十万数据量-日常环境](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=42c4dc4a-68e8-4784-a11c-c0a6c01aca0d&accessTicket=dfde05ea-4c7f-4410-bd47-9c606816f9c9&dd_orientation=auto)

### 优化前

#### 首屏指标（1.6s）

![image.png](imgs/image-007.png)

#### 运行时指标（40ms，有阻塞任务）

滚动事件执行任务40ms，中间有1s布局计算长任务阻塞

![image.png](imgs/image-008.png)

### 优化后

#### 首屏指标（1.2s）

![image.png](imgs/image-009.png)

#### 运行时指标（15ms，无阻塞任务）

滚动事件执行任务15ms，基本无长任务阻塞

![image.png](imgs/image-010.png)

# 多维表格性能优化实践

## 性能分析

### 首屏

**performance面板**

![image.png](imgs/image-019.png)

**结论**

从面板和下面的Bottom-up看首屏耗时主要集中在数据处理、构造图表行列数据（buildTable）、构造隐藏行/列（buildHideRow/buildHideColumn）、合并单元格计算（privateGetAllLeafGuids）、图表布局计算和更新（updateTableLayout）上。

### 运行时

**performance面板—持续纵向滚动（未执行updateTableLayout debounce）**

![image.png](imgs/image-020.png)

放大看👇

![image.png](imgs/image-021.png)

**performance面板—间隔性纵向滚动（执行updateTableLayout debounce）**

![image.png](imgs/image-022.png)

**结论**

1.  行合并单元格渲染方法（renderRowSpanMergedCells）、普通单元格渲染方法有性能问题
    
2.  updateTableLayout下calculateAllCellSizes有性能问题
    

### 常见的编码优化

### 总结

1.  更新行高列宽的布局方法updateTableLayout性能问题比较严重（P0）
    
2.  单元格（renderCell）、合并单元格（renderRowSpanMergedCells）渲染方法有性能问题（P1）
    
3.  合并单元格计算方法（joinMergedCell）有性能问题（P1）
    
4.  构造隐藏行（buildHideRow）有性能问题（P1）
    
5.  条件格式计算有性能问题（P1）
    

...

## 优化

### 渲染

#### 普通单元格-封装CellRender组件并调整依赖

从performance面板可以看到普通单元格内部执行了很多重复的计算逻辑

##### 优化前

![image.png](imgs/image-023.png)

##### 优化后

![image.png](imgs/image-024.png)

##### 代码说明

1.  将class组件内部renderCell方法转化为function组件 CellRender
    
![image.png](imgs/image-025.png)![image.png](imgs/image-026.png)
    
![image.png](imgs/image-027.png)
    
2.  调整CellRender内部代码，梳理CellRender组件依赖，并将依赖细粒度化或移除。
    

比如将原先依赖mergedCells的代码移到首屏计算中，原先时间复杂度行\*列\*合并单元格 O(m \* n \* o) 到首屏构建Map查询O(1)。

![image.png](imgs/image-028.png)

![image.png](imgs/image-029.png)

```javascript
// 首屏构建HiddenCellIds
setAllHiddenCellIds(rows: MatrixTableRow[], columns: MatrixTableColumn[], mergedCells: TableMergedCell[]) {
    this.allHiddenCellIds.clear();

    // 预构建合并单元格的索引 Map
    const mergedCellsMap = new Map<string, Set<string>>();

    mergedCells.forEach(mergedCell => {
      mergedCell.rowSpanGuids.forEach(rowGuid => {
        if (!mergedCellsMap.has(rowGuid)) {
          mergedCellsMap.set(rowGuid, new Set());
        }
        mergedCell.columnSpanGuids.forEach(columnGuid => {
          mergedCellsMap.get(rowGuid).add(columnGuid);
        });
      });
    });

    rows.forEach(row => {
      const mergedColumns = mergedCellsMap.get(row.guid);
      if (mergedColumns) {
        columns.forEach(column => {
          if (mergedColumns.has(column.guid)) {
            this.allHiddenCellIds.add(getCellId(row.guid, column.guid));
          }
        });
      }
    });
  }
```

#### 合并单元格-减少渲染代码中的重复计算

##### 优化前

![image.png](imgs/image-030.png)

##### 优化后

![image.png](imgs/image-031.png)

##### 代码说明

1.  封装RowSpanMergedCellRender function组件，并优化其依赖
    
![image.png](imgs/image-032.png)
    
2.  将复杂计算逻辑放在所需要的if条件下，以减少不必要的计算
    

![image.png](imgs/image-033.png)

#### 重渲染

通过ref、debounce等方案减少组件内部状态更新以减少组件重渲染频率

![image.png](imgs/image-034.png)

### 计算

#### 核心布局计算方法updateTableLayout

本次优化最核心的是调整核心布局计算方法updateTableLayout。updateTableLayout是表格底座计算表格布局的方案，经排查性能瓶颈的主要原因是计算方法中维护行高列宽数据的数据结构为数组，在消费行高列宽时会多次对数组进行查询，非常耗时。

梳理了一下，需要替换约150+处地方

![image.png](imgs/image-035.png)

![image.png](imgs/image-036.png)

##### 优化前

![image.png](imgs/image-037.png)

![image.png](imgs/image-038.png)

##### 优化后

![image.png](imgs/image-039.png)

![image.png](imgs/image-040.png)

##### 代码说明

1.  底层数据结构类型转Map，新增行高列宽数组类型用于替代原先的数组操作和遍历，避免在消费处频繁开辟新数组空间（Array.from(map.values()）
    
![image.png](imgs/image-041.png)
    
2.  新增索引index属性项来平替原先数组的findIndex
    

![image.png](imgs/image-042.png)

![image.png](imgs/image-043.png)

#### 合并单元格计算方法

##### 优化前

1.  叶子节点收集
    
![image.png](imgs/image-044.png)
    
2.  树形节点构建
    

![image.png](imgs/image-045.png)

##### 优化后

1.  叶子节点收集
    
![image.png](imgs/image-046.png)
    
2.  树形节点构建
    

![image.png](imgs/image-047.png)

##### 代码说明

1.  叶子节点收集方法：递归方法转递归，时间 O(n²) -> O(n)；空间O(n log n) -> O(n)
    
![image.png](imgs/image-048.png)
    
2.  树形节点构建 Array => Map
    

![image.png](imgs/image-049.png)

#### 构建行方法

##### 优化前

1.  字段类型判断
    
![image.png](imgs/image-050.png)
    
2.  代码逻辑优化
    

![image.png](imgs/image-051.png)

##### 优化后

1.  字段类型判断
    
![image.png](imgs/image-052.png)
    
2.  代码逻辑优化
    

![image.png](imgs/image-053.png)

##### 代码说明

1.  字段类型判断，转Set
    
2.  改for循环、减少对数组的遍历、去除在遍历中重复执行的逻辑
    

#### 构造隐藏行

隐藏行逻辑需要遍历列上所有数据，根据数据内容找到最长内容宽度以撑开列宽

##### 优化前

![image.png](imgs/image-054.png)

##### 优化后

![image.png](imgs/image-055.png)

##### 代码说明

1.  列级别缓存计算宽度表，实现上不缓存所有行列单元格值，而是缓存列单元格值，在列计算完成后clear Map
    
![image.png](imgs/image-056.png)
    
2.  map改for减少一次对大数组的重复遍历
    

![image.png](imgs/image-057.png)

#### 条件格式

##### 代码说明

1.  移除频繁浅拷贝逻辑
    
![image.png](imgs/image-058.png)
    
2.  构建表格时预计算行列meta信息（用于条件格式中的单元格定位），减少内部渲染时大量重复计算
    

![image.png](imgs/image-059.png)

### 其它

#### 巧用Ref以减少重复构建

区别于State，`useRef` 不仅可以用来访问 DOM 元素，还可以保存可变的值而不触发重新渲染。

##### 代码说明

业务场景下仅数据更新才需要重新构建列。

这里使用prevBuildColumnsTime Ref来判断effect是否要重新执行，避免与其它effect重复依赖导致多次构建表格数据

![image.png](imgs/image-060.png)

#### 减少表格容器尺寸变化时重复构建行列

在选中表格、拖拽容器等操作时因为画布的宽度变化会调整表格容器的宽高，此时会重新构建表格行列。

但实际可以避免这一次构建，因为数据并没有变更，仅需要重新更新表格组件的布局。

##### 优化前

![image.png](imgs/image-061.png)

##### 优化后

不执行reBuildTable重新构建行列的耗时方法，改为执行handleUpdateTableLayout

![image.png](imgs/image-062.png)

##### 代码说明

1.  避免重复构建（reBuildTable）
    
![image.png](imgs/image-063.png)
    
2.  更新布局（handleUpdateTableLayout）
    

![image.png](imgs/image-064.png)

#### 避免不必要遍历方法

由于历史背景问题被解决，40多处对象访问方法可以由原先的Object.values + find改为直接访问

![image.png](imgs/image-065.png)

#### 交互式分析

圈选/高亮时多次对行遍历，使用Map替换对行或者列遍历

##### 优化前

1.  圈选
    
![image.png](imgs/image-066.png)
    
2.  高亮
    

![image.png](imgs/image-067.png)

##### 优化后

1.  圈选
    
![image.png](imgs/image-068.png)
    
2.  高亮
    

![image.png](imgs/image-069.png)

# 常见的编码优化

## 性能相关

### 遍历和Map/Set

对大数据量查询是很耗时的，在现代设备内存充足的背景下，性能优先级通常高于内存。因此选择Map更为合适，在选择Map的场景下也要关注对内存占用的影响。

Map相较于Array并不灵活，因此部分实际使用场景下会同时维护Map（用于查询）和Array（用于展示和遍历）

#### 数组遍历

时间复杂度O(n)。

#### Map/Set查找

时间复杂度O(1)，频繁或者大数据量查找场景，耗时显著少于数组遍历。

#### 示例代码

```javascript
const arr = Array.from({length: 1000000}, (_, i) => i);

// 数组遍历
console.time('Array');
for (let i = 0; i < 1000; i++) {
  arr.includes(Math.random() * 10000); // O(n)
}
console.timeEnd('Array');

// Map查找
console.time('Map');
const map = new Map(arr.map(v => [v, true]));
for (let i = 0; i < 1000; i++) {
  map.has(Math.random() * 10000); // O(1)
}
console.timeEnd('Map');
```

![image.png](imgs/image-011.png)

### 减少重复计算/渲染或不必要计算/渲染

#### 重复计算/渲染

1.  防抖、节流
    
```javascript
// 防抖：延迟执行，只执行最后一次
const debouncedSearch = _.debounce((keyword) => {
  console.log('搜索:', keyword);
}, 300);

// 节流：固定时间间隔执行
const throttledScroll = _.throttle(() => {
  console.log('滚动事件');
}, 1000);
```
    
    实践中对表格核心更新布局方法进行debounce避免频繁更新状态导致重渲染
    
![image.png](imgs/image-012.png)
    
2.  计算/渲染耗时逻辑写在遍历中，但实际只需要在外层执行/渲染一次。
    

#### 不必要计算/渲染

如在所有场景都执行了某次计算/渲染，但是在特定场景不需要这次计算/渲染。

### 热点代码段

会频繁执行的代码（如在多层for嵌套下执行的代码或对大数据量遍历执行的代码），需逐行排查内部的执行效率。

### 迭代和递归

大数据量背景下能用迭代解决的方法尽量不要用递归写（迭代性能和内存占用均优于递归），或者改成尾递归。

#### 迭代

通过循环结构（for、while等）重复执行代码块

#### 递归

通过函数调用自身执行来解决问题，可读性强（尤其在树、图等结构上）。

浏览器有最大调用栈限制，可能会造成栈溢出（Maximum call stack size exceeded）

#### 示例代码

```javascript
function generateTree(guidPrefix, depth, breadth) {
  const node = {
    guid: `${guidPrefix}-node`,
    children: []
  };

  if (depth > 1) {
    for (let i = 0; i < breadth; i++) {
      const childGuid = `${guidPrefix}-${i}`;
      node.children.push(generateTree(childGuid, depth - 1, breadth));
    }
  }

  return node;
}

// 创建测试树
const bigTree = generateTree('root', 10, 5);

// 迭代方法
function getAllLeafGuidsIter(root) {
  const stack = [root];
  const leafGuids = [];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.children && node.children.length > 0) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    } else {
      leafGuids.push(node.guid);
    }
  }

  return leafGuids;
}

// 递归方法
function getAllLeafGuidsRec(node) {
  if (!node.children || node.children.length === 0) {
    return [node.guid];
  }

  let results = [];
  for (const child of node.children) {
    results = results.concat(getAllLeafGuidsRec(child));
  }
  return results;
}

console.time('iter')
getAllLeafGuidsIter(bigTree)
console.timeEnd('iter')

console.time('rec')
getAllLeafGuidsRec(bigTree)
console.timeEnd('rec')
```

![image.png](imgs/image-013.png)

### forEach和for

在大数据量且频繁执行代码场景下，优先使用for来进行遍历

#### forEach

函数式写法简洁，但每次迭代调用回调函数，有额外开销。

#### for / for...of / for...in

在V8引擎下有优化，在大数据量场景下for相比forEach稍快。

#### 示例代码

```javascript
const rows = new Array(10000000).fill().map((_, i) => ({ id: i, value: Math.random() }));

// for
console.time('for loop');
for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
}
console.timeEnd('for loop');

// forEach
console.time('forEach');
rows.forEach(item => {
    // 处理逻辑
});
console.timeEnd('forEach');
```

#### 结论

在10w数据量时执行效率基本没有差别，但是到1000w数据量以上时会有比较大的差异（测试代码只是进行简单的遍历，内部无复杂逻辑处理）：

**10w**

![image.png](imgs/image-014.png)

**1000w**

![image.png](imgs/image-015.png)

### Memoize

[Memoize](https://lodash.com/docs/4.17.21#memoize)为lodash缓存函数，实现上是使用Map缓存函数结果，若入参或“Key”不变时命中缓存。

#### 源码实现

![image.png](imgs/image-016.png)

### React Memo or 直接计算/渲染

React Memo本身有开销（浅比较依赖、存储结果等），因此部分场景下使用Memo反而会造成性能的负提升。

#### Memo

适用于Props稳定、计算/渲染开销大（组件树比较大且频繁渲染）的场景

#### 直接计算/渲染

适用于Props经常变化、计算/渲染开销小的场景

### Dom操作

频繁的DOM操作比较耗时，最好根据实际使用场景指定操作范围。如下图一行代码差异在复杂业务场景下执行能快30s以上。

![image.png](imgs/image-017.png)

### requestIdleCallback

在浏览器空闲时（帧渲染完成后）执行非关键的后台任务（即非阻塞渲染的任务，如日志上报、埋点统计等），不会影响用户体验。

```javascript
// 模拟耗时任务
function heavyInitialization() {
  const start = performance.now();
  while (performance.now() - start < 100) {
    // 模拟 100ms 的工作
  }
}

// 使用requestIdleCallback
function scheduleNonCriticalWork() {
  if ('requestIdleCallback' in window) {
    // 浏览器支持 requestIdleCallback
    requestIdleCallback((deadline) => {
      // 检查是否有足够的时间执行任务
      if (deadline.timeRemaining() > 10) {
        heavyInitialization();
      } else {
        requestIdleCallback(scheduleNonCriticalWork);
      }
    }, { timeout: 2000 });
  } else {
    // 降级方案
    setTimeout(heavyInitialization, 0);
  }
}

scheduleNonCriticalWork();
```

### requestAnimationFrame

用于处理动画和视觉更新，会在浏览器下一次重绘之前执行（通常60fps），能够保证流畅的视觉体验。

```javascript
// setTimeout
let position = 0;
function animateWithTimeout() {
  position += 2;
  element.style.transform = `translateX(${position}px)`;
  if (position < 100) {
    setTimeout(animateWithTimeout, 16); // 1000/60 ≈ 16
  }
}

// requestAnimationFrame
let position = 0;
function animateWithRAF() {
  position += 2;
  element.style.transform = `translateX(${position}px)`;
  
  if (position < 100) {
    requestAnimationFrame(animateWithRAF);
  }
}
requestAnimationFrame(animateWithRAF);

```

## 内存占用相关

### 缓存策略—强引用/弱引用

#### 强引用(Map/Set)

可迭代，对键（Map）或元素（Set）持有强引用，会阻止垃圾回收。

#### 弱引用(WeakMap/WeakSet)

不可迭代，对键（WeakMap）或元素（WeakSet）持有弱引用，不会阻止垃圾回收；对键和值有一定要求。

#### 示例代码

```javascript
// Map保持引用（内存不释放）
const map = new Map();
map.set(document.body, 'data'); // 即使body被移除，仍占用内存

// WeakMap自动释放
const weakMap = new WeakMap();
weakMap.set(document.body, 'data'); // body移除后自动GC

```

### Map/For

#### Array.prototype.map

可读性强，每次调用都会创建一个新数组

#### For

可读性弱，能复用原数组空间，无额外函数调用开销（且无Map内部函数调用闭包）

#### 示例代码

```javascript
const numbers = Array.from({ length: 10000 }, (_, i) => i + 1);
const squares = new Map(
  // map开辟了新的数组空间
  numbers.map(n => [n, n * n])
);

const squares = new Map();

// for未开辟新的数组空间
numbers.forEach(n => {
  squares.set(n, n * n);
});

```

### 内联函数 vs 外部定义函数

#### 内联函数

每次组件渲染都会创建新函数对象，其子组件会因 `props` 引用变化而不必要重渲染

```javascript
function MyComponent() {
  return <button onClick={() => console.log('click')}>Click</button>;
}
```

#### 外部定义函数

函数对象只创建一次

```javascript
const handleClick = () => console.log('click');

function MyComponent() {
  return <button onClick={handleClick}>Click</button>;
}

// 或函数组件中使用useCallback
function MyComponent() {
  const handleClick = useCallback(() => console.log('click'), []);
  return <button onClick={handleClick}>Click</button>;
}

```

### 深/浅拷贝

#### 深拷贝

*   结构中所有层级都生成新的对象/数组/字符串等。
    
*   对大对象来说，内存占用重，且克隆本身耗时耗内存。
    

```javascript
const obj = { a: { b: 1 }, c: 2 };
const deep = JSON.parse(JSON.stringify(obj));
// 或使用lodash cloneDeep等
```

#### 浅拷贝

*   新建外层对象，复制第一层的键和值。
    
*   内层对象仍然共用引用，外层有额外开销，但比深拷贝省很多。
    

```c
const obj = { a: { b: 1 }, c: 2 };
const copy = { ...obj }; // 浅拷贝
// copy.a 和 obj.a 指向同一对象
```

注意，频繁执行浅拷贝也比较耗时，如以下代码在5w行的背景下由拓展运算符\[...arrs, arr\]改为Array.prototype.push()形式，执行时间27.9s -> 0.19s

![image.png](imgs/image-018.png)

# 总结

文章主题与大数据量下前端性能优化相关。前文介绍了背景以及多维表格性能优化实践，后文补充常见的编码优化手段，让Qucik BI多维表格性能有较大提升（百万数据量从不可用到可用）。

本文内容只是表格性能优化中的一部分，实践过程中也遇到一些小挫折，比如：改了很多代码但是在最终进行性能测试时发现没有预期中提升大，出于可维护性等原因于是将改动回退。

在实践完成性能优化后的一些感悟：

**发现问题：**发现性能问题很重要，性能优化也往往会伴随性能监控。

**最适合场景：**算法中常有空间换时间，做性能优化也一样。因此性能优化没有最优解，只有最合适当前场景的解，有时一个loading也能够大幅提升用户体验。

**内存影响：**性能优化处理往往会伴随大量缓存，因此需要在优化过程中时刻关注对内存消耗的影响。

**高编码要求：**大数据量场景下对编码要求极高，任何一行代码都可能会导致性能问题。

**循序渐进：**性能优化往往需要持续投入，其永远是循序渐进的过程。在提升方面从100ms到50ms可能比1s到100ms难得多。
