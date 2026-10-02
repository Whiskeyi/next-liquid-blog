---
title: "Shallow Copy & Deep Copy"
header-img: imgs/head.jpg
catalog: true
date: 2021-10-14 20:43:30
subtitle: JS
tags:
  - JS
categories:
  - JS
translation-status: published
---

## Shallow copy & deep copy

### Basic concepts

> First, review the basic concepts to understand shallow and deep copying.

#### JavaScript data types

- Primitive types: value types, with variable names and values stored on the stack. `number, string, boolean, undefined, null, symbol (ES6)`.
- Reference types: address types, with variable names stored on the stack and values on the heap. A reference address stored on the stack points to the heap value. `function, object, array`.

### What are shallow and deep copies?

One point follows from these concepts: the distinction between shallow and deep copying does not apply to primitives. Assigning a primitive copies its value; assigning a reference type copies its address—the reference stored by the variable.

#### Shallow copy

Copy the pointer to an object rather than the object itself. The old and new objects share the same memory.

#### Deep copy

Create a separate, equivalent object. It does not share memory with the original, so modifying it does not also modify the original.

### Detailed explanation

To explain shallow and deep copying, start with assignment.

#### Assignment

- Primitive types: copy the value. The two variables do not affect one another afterward.
- Reference types: copy the address. Both variables reference the same object, so changes through one affect the other.

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

In development, we usually do not want modifying variable a to affect variable b. This is where shallow and deep copying become useful.

#### Shallow copy

1. `Object.assign(target,source)`
   This object method, introduced in ES6, copies the values of all enumerable properties from one or more source objects into a target and returns the target. `Object.assign()` copies property references rather than the referenced objects themselves. For an object with only one level, this has the effect of a deep copy.

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

2. `Spread operator (ES6)`

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

#### Deep copy

1. `JSON.parse(JSON.stringify())`
   JSON.stringify() converts an object into a JSON string, and JSON.parse() parses the string back into an object. This creates a new object and achieves a deep copy. Note that functions cannot be deep-copied this way because JSON.stringify() does not accept them. Other limitations include:
   - undefined is ignored.
   - symbol, an ES6 primitive, is ignored.
   - Functions cannot be serialized.
   - Infinity becomes null.
   - Circular references, where objects refer back to themselves, cause errors.
   - Date, Set, and Map are converted to strings, producing inconsistent results.
   - Regular expressions are not supported.

```js
var a = [0, "1", [2, 3]];
var b = JSON.parse(JSON.stringify(a)); // [0, "1", [2, 3]]
b[0] = 1;
b[2][0] = 3;
console.log(a[0]); // 0
console.log(a[2][0]); // 2, 两层后不会发生变化
```

2. `Recursive assignment`

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

3. `Existing deep-copy libraries`
For example, the `lodash` library provides `\_.cloneDeep`; its implementation is not covered here.

### Summary

|        | References the original object | First-level properties are primitives | The original contains nested objects |
| :----: | :------------------: | :----------------------: | :----------------------: |
| Assignment | Yes | Changes also affect the original | Changes also affect the original |
| Shallow copy | No | Changes do not affect the original | Changes also affect the original |
| Deep copy | No | Changes do not affect the original | Changes do not affect the original |
