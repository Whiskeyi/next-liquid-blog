---
title: "Frontend Performance Optimization — An Order-of-Magnitude Improvement to Quick BI's Multidimensional Table Engine at One Million Cells"
header-img: imgs/cover-ai.jpg
catalog: true
date: 2026-01-15 10:00:00
subtitle: "Optimizing Quick BI Multidimensional Table Performance"
tags:
  - Performance
  - Table
categories:
  - Frontend
translation-status: published
---
# Frontend Performance Optimization — An Order-of-Magnitude Improvement to Quick BI's Multidimensional Table Engine at One Million Cells

For an introduction to **Quick BI** multidimensional tables, see my other article; I will not repeat it here:

[Implementing Complex React Tables: Design and Lessons Learned](/blog/2025-01-14-react-complex-table)

# Background

## The Volume of Business Data

Before implementing requirements, we need to understand the actual use cases. Our product currently has these limits on chart data:

1. **Rows retrieved:** Quick BI's public-cloud limit is **10,000**; some privately deployed customers are allowed up to **100,000**.

2. **Columns:** combinations of column dimension values cannot exceed **500** by default.

3. **Cells:** row-column combinations cannot exceed **one million** by default.


The table therefore needs to support up to one million cells. This is the target data volume for this optimization.

## Existing Performance

Tables with around 100,000 cells were sluggish. At one million cells they became effectively unusable, with severe jank or crashes.

Many customer support questions concerned table performance and page crashes, as illustrated below:

![image.png](imgs/image-001.png)

## The Existing Workaround

We advised customers to adjust queries, add pagination, reduce page sizes, or reduce merged cells to avoid expensive rendering and computation. These measures helped, but some customers specifically needed large results at once for rapid analysis. The workaround therefore did not address the underlying requirement.

Could we instead modify the table engine to render a million cells directly? I began investigating, organizing, and optimizing its computation and rendering bottlenecks.

## Challenges

**1. Changes to the table engine have a broad impact:**

1. Tables are among the most common dashboard charts, with more than a million uses. Even a small change risks customer complaints. ![Table usage](imgs/image-002.png)

2. More than 10 locations call the engine directly, and over 50 use it indirectly.


**2. The engine is complex and covers many features:**

Row-height and column-width calculation, merged-cell rendering and computation, frozen rows and columns, selection, and more.

The entire refactor therefore had to preserve all table functionality and user experience.

# Final Results

First, the final performance results.

## Benchmark Setup

:::
**Test versions:** QBI 6.1 versus QBI 6.0.3

**Benchmark reports:** [One million cells — daily environment](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=2b6162a6-8e93-47af-b031-a521816743c6&accessTicket=f0b8c706-5596-4f4c-83c8-545eeefd3168&dd_orientation=auto) and [100,000 cells — daily environment](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=42c4dc4a-68e8-4784-a11c-c0a6c01aca0d&accessTicket=dfde05ea-4c7f-4410-bd47-9c606816f9c9&dd_orientation=auto)

**Device:** M2 MacBook Pro, macOS 15.1.1

**Screen resolution:** 1920\*1080

**Measurement basis:**

Initial display: internally collected component diagnostics, measured when row heights and column widths have been calculated and rendering is complete.

Runtime: scroll vertically at a steady pace, with pauses, to approximately row 200.
:::

## One Million Cells: 100,000 Rows × 10 Columns

Report: [One million cells — daily environment](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=2b6162a6-8e93-47af-b031-a521816743c6&accessTicket=f0b8c706-5596-4f4c-83c8-545eeefd3168&dd_orientation=auto)

### Before Optimization

#### Initial Display: 13 s

![image.png](imgs/image-003.png)

#### Runtime: 300 ms, with Blocking Tasks

Scroll-event tasks took about 300 ms and were mostly long tasks. Some blocking tasks exceeded 7 seconds, preventing further scrolling and making the table effectively unusable.

![image.png](imgs/image-004.png)

### After Optimization

#### Initial Display: 3.4 s

![image.png](imgs/image-005.png)

#### Runtime: 30 ms, without Blocking Tasks

Scroll-event tasks took about 30 ms, with almost no long-task blocking.

![image.png](imgs/image-006.png)

## 100,000 Cells: 10,000 Rows × 10 Columns

Report: [100,000 cells — daily environment](https://daily-yunbi-biz.aliyun.test/token3rd/dashboard/view/pc.htm?pageId=42c4dc4a-68e8-4784-a11c-c0a6c01aca0d&accessTicket=dfde05ea-4c7f-4410-bd47-9c606816f9c9&dd_orientation=auto)

### Before Optimization

#### Initial Display: 1.6 s

![image.png](imgs/image-007.png)

#### Runtime: 40 ms, with Blocking Tasks

Scroll-event tasks took about 40 ms, interrupted by a one-second layout-calculation task.

![image.png](imgs/image-008.png)

### After Optimization

#### Initial Display: 1.2 s

![image.png](imgs/image-009.png)

#### Runtime: 15 ms, without Blocking Tasks

Scroll-event tasks took about 15 ms, with almost no long-task blocking.

![image.png](imgs/image-010.png)

# Optimizing Multidimensional Table Performance

## Performance Analysis

### Initial Display

**Performance panel**

![image.png](imgs/image-019.png)

**Findings**

The panel and Bottom-up view show that initial display time mainly comes from data processing, building row and column data (`buildTable`), building hidden rows and columns (`buildHideRow` / `buildHideColumn`), merged-cell computation (`privateGetAllLeafGuids`), and table layout updates (`updateTableLayout`).

### Runtime

**Performance panel: continuous vertical scrolling, without the debounced updateTableLayout call**

![image.png](imgs/image-020.png)

A closer look 👇

![image.png](imgs/image-021.png)

**Performance panel: intermittent vertical scrolling, triggering debounced updateTableLayout**

![image.png](imgs/image-022.png)

**Findings**

1. Merged-row-cell rendering (`renderRowSpanMergedCells`) and ordinary cell rendering have performance problems.

2. `calculateAllCellSizes`, called by `updateTableLayout`, has performance problems.


### Common Code Optimizations

### Summary

1. The row-height and column-width layout update method, `updateTableLayout`, has severe performance issues (P0).

2. Ordinary cell rendering (`renderCell`) and merged-cell rendering (`renderRowSpanMergedCells`) have performance issues (P1).

3. Merged-cell computation (`joinMergedCell`) has performance issues (P1).

4. Hidden-row construction (`buildHideRow`) has performance issues (P1).

5. Conditional formatting computation has performance issues (P1).


...

## Optimizations

### Rendering

#### Ordinary Cells: Extract CellRender and Refine Its Dependencies

The Performance panel shows many repeated calculations inside ordinary cells.

##### Before

![image.png](imgs/image-023.png)

##### After

![image.png](imgs/image-024.png)

##### Code Explanation

1. Convert the class component's `renderCell` method into a `CellRender` function component.

![image.png](imgs/image-025.png)![image.png](imgs/image-026.png)

![image.png](imgs/image-027.png)

2. Review `CellRender`'s internal code and dependencies, making them more granular or removing them.


For example, move work that depends on `mergedCells` into initial computation. Repeated row × column × merged-cell work, `O(m * n * o)`, becomes construction of a Map at initialization followed by `O(1)` lookups.

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

#### Merged Cells: Reduce Repeated Computation During Rendering

##### Before

![image.png](imgs/image-030.png)

##### After

![image.png](imgs/image-031.png)

##### Code Explanation

1. Extract a `RowSpanMergedCellRender` function component and optimize its dependencies.

![image.png](imgs/image-032.png)

2. Place complex calculations inside the relevant `if` branches to avoid unnecessary computation.


![image.png](imgs/image-033.png)

#### Rerendering

Use refs, debouncing, and similar techniques to reduce internal state updates and component rerender frequency.

![image.png](imgs/image-034.png)

### Computation

#### The Core Layout Method: updateTableLayout

The most important optimization was changing `updateTableLayout`, the engine's table layout calculation method. Investigation showed that it stored row heights and column widths in arrays, repeatedly searching them when consuming that data. These lookups were a major bottleneck.

The change affected more than 150 locations.

![image.png](imgs/image-035.png)

![image.png](imgs/image-036.png)

##### Before

![image.png](imgs/image-037.png)

![image.png](imgs/image-038.png)

##### After

![image.png](imgs/image-039.png)

![image.png](imgs/image-040.png)

##### Code Explanation

1. Change the underlying data structure to a Map, while adding row-height and column-width arrays for existing array operations and iteration. This avoids repeatedly allocating arrays at consumption sites with `Array.from(map.values())`.

![image.png](imgs/image-041.png)

2. Add an `index` property to replace previous `findIndex` operations.


![image.png](imgs/image-042.png)

![image.png](imgs/image-043.png)

#### Merged-Cell Computation

##### Before

1. Collect leaf nodes.

![image.png](imgs/image-044.png)

2. Build tree nodes.


![image.png](imgs/image-045.png)

##### After

1. Collect leaf nodes.

![image.png](imgs/image-046.png)

2. Build tree nodes.


![image.png](imgs/image-047.png)

##### Code Explanation

1. Change the leaf-collection method from recursive to iterative traversal: time complexity goes from `O(n²)` to `O(n)`, and space from `O(n log n)` to `O(n)`.

![image.png](imgs/image-048.png)

2. Change tree construction from an Array to a Map.


![image.png](imgs/image-049.png)

#### Row Construction

##### Before

1. Field-type checks

![image.png](imgs/image-050.png)

2. Code logic optimization


![image.png](imgs/image-051.png)

##### After

1. Field-type checks

![image.png](imgs/image-052.png)

2. Code logic optimization


![image.png](imgs/image-053.png)

##### Code Explanation

1. Use a Set for field-type checks.

2. Use `for` loops, reduce array traversals, and remove logic repeatedly executed inside loops.


#### Hidden-Row Construction

Hidden-row logic traverses column data to find the widest content and set the column width accordingly.

##### Before

![image.png](imgs/image-054.png)

##### After

![image.png](imgs/image-055.png)

##### Code Explanation

1. Cache calculated widths at the column level. Instead of retaining values for every cell across all rows and columns, cache one column's cell values and clear the Map after calculating that column.

![image.png](imgs/image-056.png)

2. Replace `map` with `for` to avoid another traversal of a large array.


![image.png](imgs/image-057.png)

#### Conditional Formatting

##### Code Explanation

1. Remove frequent shallow-copy operations.

![image.png](imgs/image-058.png)

2. Precompute row and column metadata during table construction for locating cells in conditional formatting, reducing repeated computation during rendering.


![image.png](imgs/image-059.png)

### Other Improvements

#### Use Refs to Avoid Repeated Construction

Unlike state, `useRef` can store mutable values without triggering rerenders, in addition to accessing DOM elements.

##### Code Explanation

In this use case, columns need rebuilding only when data changes.

Use the `prevBuildColumnsTime` ref to decide whether an effect should run again, avoiding duplicate table construction caused by overlapping dependencies with other effects.

![image.png](imgs/image-060.png)

#### Avoid Rebuilding Rows and Columns on Container Resize

Selecting a table or dragging a container changes canvas width and adjusts the table container's dimensions, previously triggering row and column reconstruction.

That reconstruction is unnecessary because the data is unchanged; only the component layout needs updating.

##### Before

![image.png](imgs/image-061.png)

##### After

Call `handleUpdateTableLayout` instead of the expensive `reBuildTable` row and column reconstruction.

![image.png](imgs/image-062.png)

##### Code Explanation

1. Avoid repeated construction (`reBuildTable`).

![image.png](imgs/image-063.png)

2. Update layout (`handleUpdateTableLayout`).


![image.png](imgs/image-064.png)

#### Avoid Unnecessary Traversal

After resolving legacy constraints, more than 40 object-access locations can replace `Object.values` plus `find` with direct access.

![image.png](imgs/image-065.png)

#### Interactive Analysis

Selection and highlighting repeatedly traverse rows. Replace row or column searches with Map lookups.

##### Before

1. Selection

![image.png](imgs/image-066.png)

2. Highlighting


![image.png](imgs/image-067.png)

##### After

1. Selection

![image.png](imgs/image-068.png)

2. Highlighting


![image.png](imgs/image-069.png)

# Common Code Optimizations

## Performance

### Traversal and Map/Set

Searching large datasets is expensive. With ample memory on modern devices, performance often takes priority, making Maps suitable. Still, monitor their memory impact.

Maps are less flexible than arrays for some operations, so practical implementations may maintain both a Map for lookup and an Array for display and iteration.

#### Array Traversal

Time complexity: `O(n)`.

#### Map/Set Lookup

Time complexity: `O(1)` on average, making frequent lookups or large datasets much faster than array traversal.

#### Example Code

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

### Reduce Repeated or Unnecessary Computation and Rendering

#### Repeated Computation and Rendering

1. Debouncing and throttling

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

    In practice, debounce the table's core layout update method to avoid frequent state updates and rerenders.

![image.png](imgs/image-012.png)

2. Expensive computation or rendering occurs inside a loop when it only needs to run once outside it.


#### Unnecessary Computation and Rendering

For example, work executes in every scenario even though some scenarios do not require it.

### Hot Code Paths

Review frequently executed code line by line, especially nested loops and large-data traversals, for execution efficiency.

### Iteration and Recursion

With large datasets, prefer iteration where practical to improve performance and memory use, or consider tail recursion.

#### Iteration

Repeats code blocks using loops such as `for` and `while`.

#### Recursion

Solves a problem through a function calling itself. It is readable, particularly for trees and graphs.

Browsers impose a maximum call-stack size, so deep recursion can cause `Maximum call stack size exceeded`.

#### Example Code

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

### forEach and for

Prefer `for` for frequently executed traversal over large datasets.

#### forEach

The functional style is concise but invokes a callback on each iteration, adding overhead.

#### for / for...of / for...in

V8 optimizes loops, and `for` can be slightly faster than `forEach` on large datasets.

#### Example Code

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

#### Findings

At 100,000 items, execution efficiency is nearly identical. At 10 million or more, differences become substantial. This test performs only simple traversal without complex inner logic:

**10w**

![image.png](imgs/image-014.png)

**1000w**

![image.png](imgs/image-015.png)

### Memoize

Lodash's [memoize](https://lodash.com/docs/4.17.21#memoize) caches function results using a Map. Calls hit the cache when the argument or resolved key is unchanged.

#### Source Implementation

![image.png](imgs/image-016.png)

### React Memo or Direct Computation/Rendering

React memoization itself has overhead, including shallow dependency comparisons and cached results. In some cases it can therefore reduce performance.

#### Memo

Suitable when props are stable and computation or rendering is expensive, such as a large, frequently rendered component tree.

#### Direct Computation/Rendering

Suitable when props change frequently and computation or rendering is inexpensive.

### DOM Operations

Frequent DOM operations are expensive. Limit their scope to the actual use case. The one-line difference below can save more than 30 seconds in a complex business scenario.

![image.png](imgs/image-017.png)

### requestIdleCallback

Runs noncritical background tasks during browser idle time, after frame rendering. Tasks such as logging and analytics can then avoid blocking rendering or harming the user experience.

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

Handles animation and visual updates before the browser's next repaint, typically at 60 fps, helping maintain smooth visuals.

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

## Memory Usage

### Caching Strategies: Strong and Weak References

#### Strong References: Map/Set

Iterable; holds strong references to keys (Map) or elements (Set), preventing their garbage collection.

#### Weak References: WeakMap/WeakSet

Not iterable; holds weak references to keys (WeakMap) or elements (WeakSet), allowing garbage collection. Keys and values have type constraints.

#### Example Code

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

Readable, but creates a new array on every call.

#### For

Less readable, but reuses the original array without extra function-call overhead or callback closures.

#### Example Code

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

### Inline Functions Versus Externally Defined Functions

#### Inline Functions

Creates a new function object on each component render. Child components may rerender unnecessarily because the `props` reference changes.

```javascript
function MyComponent() {
  return <button onClick={() => console.log('click')}>Click</button>;
}
```

#### Externally Defined Functions

The function object is created once.

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

### Deep and Shallow Copies

#### Deep Copy

*   Creates new objects, arrays, and other values throughout the structure.

*   For large objects, cloning takes significant time and memory.


```javascript
const obj = { a: { b: 1 }, c: 2 };
const deep = JSON.parse(JSON.stringify(obj));
// 或使用lodash cloneDeep等
```

#### Shallow Copy

*   Creates a new outer object and copies its first-level keys and values.

*   Nested objects still share references. The outer layer adds overhead, but much less than deep copying.


```c
const obj = { a: { b: 1 }, c: 2 };
const copy = { ...obj }; // 浅拷贝
// copy.a 和 obj.a 指向同一对象
```

Frequent shallow copying is also expensive. In the example below with 50,000 rows, replacing spread syntax `[...arrs, arr]` with `Array.prototype.push()` reduced execution time from 27.9 s to 0.19 s.

![image.png](imgs/image-018.png)

# Conclusion

This article explores frontend performance with large datasets. The first part describes the context and practical optimization of multidimensional tables; the second adds common coding techniques. Together they substantially improved Quick BI's table performance, making million-cell tables usable.

These changes represent only part of the optimization work. There were setbacks: some extensive changes produced smaller improvements than expected in final testing, so we reverted them for maintainability.

A few lessons from the work:

**Identify problems:** finding bottlenecks matters, and performance optimization often goes hand in hand with monitoring.

**Fit the scenario:** just as algorithms trade space for time, optimization involves tradeoffs. There is no universally optimal solution, only the best fit for the current scenario. Sometimes a loading indicator greatly improves the experience.

**Watch memory:** optimization often introduces extensive caching, so monitor memory consumption throughout.

**Demanding code quality:** at large data volumes, any single line can become a bottleneck.

**Progress gradually:** optimization requires ongoing investment. Going from 100 ms to 50 ms may be much harder than going from one second to 100 ms.
