---
title: 浅拷贝(Shallow Copy)&深拷贝(Deep Copy)
header-img: imgs/head.jpg
catalog: true
date: 2021-10-14 20:43:30
subtitle: JS
tags:
  - JS
categories:
  - JS
---

## 浅拷贝(shallow copy)&深拷贝(deep copy)

### 基本概念

> 为了更好理解浅拷贝和深拷贝需要先了解基本概念

#### JS 数据类型

- 基本数据类型：值类型，变量名和值都储存在栈内存中。`number、string、boolean、undefined、null、symbol(ES6)`。
- 引用数据类型：地址类型，变量名储存在栈内存中，值储存在堆内存中，但是堆内存中会提供一个储存在栈内存引用地址指向堆内存中的值。`function、object、array`。

### 什么是浅拷贝和深拷贝

根据上面的基本概念，实现明确一点，深浅拷贝对于基本数据类型是没有意义的。因为，基本类型赋值时，赋的是数据。而引用类型赋值时，赋的值地址(就是引用类型变量在内存中保存的内容)。

#### 浅拷贝(shallow copy)

复制指向某个对象的指针，而不复制对象本身，新旧对象共享同一块内存。

#### 深拷贝(deep copy)

另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会同时修改原对象。

### 具体说明

为了更好地解释深浅拷贝，引入赋值这一概念。

#### 赋值(copy)

- 基本数据类型：赋值，赋值之后两个变量互不影响。
- 引用数据类型：赋址，两个变量具有相同的引用，指向同一个对象，相互之间有影响。

```js
var a = {
  name: "whiskey",
  data: { num: 1 },
};
var b = {};
b = a;
b.name = "zcj";
console.log(a.name); // "zcj", a 中 name 属性也改变了
```

通常我们在开发中并不希望改变变量 a 之后会影响到变量 b，这时就需要用到浅拷贝和深拷贝。

#### 浅拷贝 (shallow copy)

1. `Object.assign(target,source)`
   ES6 中新增的对象方法，将所有可枚举属性的值从一个或多个源对象复制到目标对象,并返回目标对象。`Object.assign()`拷贝的是对象的属性的引用，而不是对象本身。当 object 只有一层的时候，是深拷贝。

```js
var a = {
  name: "whiskey",
  data: { num: 1 },
};
var b = Object.assign({}, a);
b.name = "zcj";
b.data.num = 0;
console.log(a.name); // "whiskey"
console.log(a.data.num); // 0, 两层后同样会变化
```

2. `…扩展操作符(ES6)`

```js
var a = {
  name: "whiskey",
  data: { num: 1 },
};
var b = { ...a };
b.name = "zcj";
b.data.num = 0;
console.log(a.name); // "whiskey"
console.log(a.data.num); // 0, 两层后同样会变化
```

3. `Array.prototype.slice()`

```js
var a = [0, "1", [2, 3]];
var b = a.slice(0, 3); // [0, "1", [2, 3]]
b[0] = "1";
b[2][0] = 3;
console.log(a[0]); // 0
console.log(a[2][0]); // 3, 两层后同样会变化
```

4. `Array.prototype.concat()`

```js
var a = [0, "1", [2, 3]];
var b = a.concat(); // [0, "1", [2, 3]]
b[0] = 1;
b[2][0] = 3;
console.log(a[0]); // 0
console.log(a[2][0]); // 3, 两层后同样会变化
```

#### 深拷贝 (deep copy)

1. `JSON.parse(JSON.stringify())`
   JSON.stringify()将对象转成 JSON 字符串，JSON.parse()把字符串解析成对象，一去一来，新的对象产生了，并开辟了新的栈，实现深拷贝。需要注意的是，这个方法不能深拷贝函数，原因是 JSON.stringify()不能接受函数，同时会有如下问题：
   - 会忽略 undefined
   - 会忽略 symbol(ES6 基本类型)
   - 不能序列化函数
   - Infinity 值会被置为 null
   - 循环引用(对象的对象引用了他们自身)会出错
   - Date, Set, Map 会转换为字符串，使得转换结果不一致
   - 不能处理正则

```js
var a = [0, "1", [2, 3]];
var b = JSON.parse(JSON.stringify(a)); // [0, "1", [2, 3]]
b[0] = 1;
b[2][0] = 3;
console.log(a[0]); // 0
console.log(a[2][0]); // 2, 两层后不会发生变化
```

2.  `递归赋值`

```js
var a = {
  name: "whiskey",
  data: { num: 1 },
};
var b = {};
function deepCopy(obj) {
  var clone = {};
  for (var i in obj) {
    if (obj[i] != null && typeof obj[i] == "object")
      clone[i] = deepCopy(obj[i]);
    else clone[i] = obj[i];
  }
  return clone;
}
b = deepCopy(a);
b.data.num = 0;
console.log(a.data.num); //1，a 属性值没有改变
```

3.  `深拷贝现成函数库`
如 `lodash` 函数库的`\_.cloneDeep`这里不具体展开讲。

### 总结

|        | 和原数据指向同一对象 | 第一层数据为基本数据类型 |    原数据中包含子对象    |
| :----: | :------------------: | :----------------------: | :----------------------: |
|  赋值  |          是          |  改变会使原数据一同改变  |  改变会使原数据一同改变  |
| 浅拷贝 |          否          | 改变不会使原数据一同改变 |  改变会使原数据一同改变  |
| 深拷贝 |          否          | 改变不会使原数据一同改变 | 改变不会使原数据一同改变 |
