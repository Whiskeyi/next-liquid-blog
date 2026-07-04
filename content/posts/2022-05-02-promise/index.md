---
title: 进一步理解Promise对象(Promise)
header-img: imgs/head.jpg
catalog: true
date: 2022-05-02 23:54:11
subtitle: JS
tags:
  - JS
categories:
  - JS
---

## 进一步理解 Promise 对象

### Promise 简介

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大，它能解决回调地狱的问题。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，使原生提供了 Promise 对象。

所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

Promise 有**两个特点**：

1. **对象的状态不受外界影响**。Promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和 rejected（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。
2. **一旦状态改变，就不会再变**，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对 Promise 对象添加回调函数，也会立即得到这个结果。

### Promise 基本用法

ES6 规定，Promise 对象是一个构造函数，用来生成 Promise 实例。
下面代码创造了一个 Promise 实例。

```js
const promise = new Promise(function(resolve, reject) {
  // code
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`。

- `resolve` 函数的作用是，将 Promise 对象的状态从“未完成”变为“成功”（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去。
- `reject` 函数的作用是，将 Promise 对象的状态从“未完成”变为“失败”（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

Promise 例生成以后，可以用 then 方法分别指定 resolved 状态和 rejected 状态的回调函数。

```js
promise.then(
  function (value) {
    // success
  },
  function (error) {
    // failure
  }
);
```

then 方法可以接受**两个回调函数**作为参数。

- 第一个回调函数是 Promise 对象的状态变为 resolved 时调用。
- 第二个回调函数是 Promise 对象的状态变为 rejected 时调用。这两个函数都是可选的，不一定要提供。它们都接受 Promise 对象传出的值作为参数。

**需要注意的几点：**

1. Promise 代码在没有 resolve / reject 之前是立即执行的，在 resolve 后会被推到 event loop 的微任务队列中。
2. .then 或 .catch 的参数期望是函数，传入非函数则会发生值透传。
3. then 方法可以被多次调用及链式调用。
4. then 方法的返回值是一个新的 Promise。

### Promise 方法

#### Promise.prototype.then()

Promise 实例具有 then 方法，也就是说，then 方法是定义在原型对象 Promise.prototype 上的。它的作用是为 Promise 实例添加状态改变时的回调函数。前面说过，then 方法的第一个参数是 resolved 状态的回调函数，第二个参数是 rejected 状态的回调函数，它们都是可选的。

#### Promise.prototype.catch()

Promise.prototype.catch() 方法是 .then(null, rejection) 或 .then(undefined, rejection) 的别名，用于指定发生错误时的回调函数。

```js
const promise = new Promise(function (resolve, reject) {
  throw new Error("test");
});
promise.catch(function (error) {
  console.log(error);
});
```

上面代码中，promise 抛出一个错误，就被 catch() 方法指定的回调函数捕获。同样也可以使用 try 和 catch 捕捉错误。

```js
const promise = new Promise(function (resolve, reject) {
  try {
    throw new Error("test");
  } catch (e) {
    reject(e);
  }
});
promise.catch(function (error) {
  console.log(error);
});
```

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 catch 语句捕获。由此一般来说，不要在 then() 方法里面定义 Reject 状态的回调函数（即 then 的第二个参数），总是使用 catch 方法。

#### Promise.prototype.finally()

finally() 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。
finally 方法的来源是有时候我们需要对成功和失败两种情况执行同样的操作，这就需要我们各写一次。有了 finally 方法，则只需要写一次。

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

#### Promise.all()

Promise.all() 方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.all([p1, p2, p3]);
```

上面代码中，Promise.all() 方法接受一个数组作为参数，p1、p2、p3 都是 Promise 实例，如果不是，就会先调用 Promise.resolve 方法，将参数转为 Promise 实例，再进一步处理。另外，Promise.all() 方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

p 的状态由 p1、p2、p3 决定，分成两种情况。

- 只有 p1、p2、p3 的状态都变成 fulfilled ，p 的状态才会变成 fulfilled ，此时 p1、p2、p3 的返回值组成一个数组，传递给 p 的回调函数。
- 只要 p1、p2、p3 之中有一个被 rejected ，p 的状态就变成 rejected ，此时第一个被 reject 的实例的返回值，会传递给 p 的回调函数。

```js
Promise.all(promises)
  .then(function (posts) {
    // ...
  })
  .catch(function (reason) {
    // ...
  });
```

#### Promise.race()

Promise.race()方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要 p1、p2、p3 之中有一个实例率先(就如同赛跑、竞赛一样，故称 race)改变状态（`不管成功还是失败`），p 的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给 p 的回调函数。

Promise.race() 方法的参数与 Promise.all() 方法一样，如果不是 Promise 实例，就会调用 Promise.resolve() 方法，将参数转为 Promise 实例，再进一步处理。

需要注意的是 Promise.race()方法会将所有实例继续执行，并不是只执行返回的实例。

#### Promise.allSettle()

我们希望等到一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。为了解决这个问题，ES2020 引入了 Promise.allSettled() 方法，用来确定一组异步操作是否都结束了（不管成功或失败）。所以，它的名字叫做 “Settled” ，包含了 fulfilled 和 rejected 两种情况。

Promise.allSettled() 方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是 fulfilled 还是 rejected ），返回的 Promise 对象才会发生状态变更。

#### Promise.any()

ES2021 引入了 Promise.any() 方法。该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。只要参数实例有一个变成 fulfilled 状态，包装实例就会变成 fulfilled 状态；如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态。

Promise.any() 跟 Promise.race() 方法很像，只有一点不同，就是 Promise.any() 不会因为某个 Promise 变成 rejected 状态而结束，必须等到所有参数 Promise 变成 rejected 状态才会结束。

#### Promise.resolve()

有时需要将现有对象转为 Promise 对象，Promise.resolve()方法就起到这个作用。

```js
Promise.resolve("foo");
// 等价于
new Promise((resolve) => resolve("foo"));
```

有四种情况：

1. 参数是一个 Promise 实例。如果参数是 Promise 实例，那么 Promise.resolve 将不做任何修改、原封不动地返回这个实例。
2. 参数是一个 thenable 对象(具有 then 方法的对象)。Promise.resolve() 方法会将这个对象转为 Promise 对象，然后就立即执行 thenable 对象的 then() 方法。
3. 参数不是具有 then() 方法的对象，或根本就不是对象。如果参数是一个原始值，或者是一个不具有 then()方法的对象，则 Promise.resolve()方法返回一个新的 Promise 对象。由于不属于异步操作，返回 Promise 实例的状态从一生成就是 resolved，所以回调函数会立即执行。状态为 resolved。Promise.resolve()方法的参数，会同时传给回调函数。
4. 不带有任何参数。Promise.resolve()方法允许调用时不带参数，直接返回一个 resolved 状态的 Promise 对象。

#### Promise.reject()

Promise.reject(reason)方法会返回一个新的 Promise 实例，该实例的状态为 rejected。

```js
const p = Promise.reject("出错了");
// 等同于
const p = new Promise((resolve, reject) => reject("出错了"));

p.then(null, function (s) {
  console.log(s);
});
// 出错了
```

### 手写 Promise

#### PromiseAll(Promise.all())

**注意的点：**

1. PromiseAll 返回的是一个 Promise 对象。

2. 由于 PromiseAll 返回的结果和入参数组顺序一一对应，可能存在阻塞情况（造成返回数据顺序混乱），因此不能使用`rz.push()`方法，而是采用`res[i] = value`。

3. 必须引入 counter 做记录（不能使用数组的长度 length 来判断），由于 js 内存空间的分配原理，若仅定义`let res[6] = 1`，`res.length === 7`返回的值为 true，这样就会造成结果判断的错误。

```js
function PromiseAll(promiseArray) {
  // promiseArray传入的是可迭代对象，将其转化为数组
  promiseArray = Array.from(promiseArray);
  // 返回 Promise 对象
  return new Promise((resolve, reject) => {
    // 判断传入的是否为数组
    if (!Array.isArray(promiseArray)) {
      return reject(new Error("argument must be a array"));
    }
    // 结果存储
    const res = [];
    const promiseNums = promiseArray.length;
    // 记录 promise fulfilled 的个数
    let counter = 0;
    for (let i = 0; i < promiseNums; i++) {
      Promise.resolve(promiseArray[i]).then((value) => {
        counter++;
        res[i] = value;
        // 如果全部fulfilled ,执行resolve(res)
        if (counter === promiseNums) {
          resolve(res);
        }
      });
    }
  });
}
```

#### PromiseRace(Promise.race())

**注意的点：**

1. PromiseRace 返回的也是一个 Promise 对象。

2. PromiseRace 结果谁快谁先输出。

```js
function PromiseRace(promiseArray) {
  // promiseArray传入的是可迭代对象，将其转化为数组
  promiseArray = Array.from(promiseArray);
  // 返回 promise 对象
  return new Promise((resolve, reject) => {
    // 判断传入的是否为数组
    if (!Array.isArray(promiseArray)) {
      return reject(new Error("argument must be a array"));
    }
    if (promiseArray.length === 0) {
      // 空的可迭代对象，用于pending态
    } else {
      for (let i = 0; i < promiseArray.length; i++) {
        Promise.resolve(promiseArray[i])
          .then((data) => {
            // 谁快谁先输出
            resolve(data);
          })
          .catch((reason) => {
            reject(reason);
          });
      }
    }
  });
}
```

#### 实现一个 Promise

**步骤：**

1. 初始化 class。
2. 定义三种状态类型。
3. 设置初始状态。
4. resolve / reject。
5. .then 方法实现, promise 构造函数的入参(一个函数，函数接受两个参数，resolve， reject。new promise 的时候，就要执行这个函数，并且有任何错误都要被 reject 出去)。
6. 监听 status 改变(getter，setter)。
7. 继续处理 .then 方法。
8. resolvePromise 方法实现。
9. .catch 方法实现。
10. resolve, reject 静态方法实现。

```js
// 定义三种状态类型
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

// 初始化 class
class MPromise {
  // 由于 .then 可以多个并行或者链式调用并且不一定立马调用(setTimeout)，需要定义两个数组用来保存 FULFILLED、REJECTED回调的数组
  FULFILLED_CALLBACK_LIST = [];
  REJECTED_CALLBACK_LIST = [];
  // self 变量存值, 避免死循环
  _status = PENDING;

  constructor(fn) {
    // 初始状态, 实例（不同的实例有不同的状态）
    this.status = PENDING;
    this.value = null;
    this.reason = null;

    // 初始化的时候执行这个函数, 处理报错可能
    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  get status() {
    return this._status;
  }

  set status(newStatus) {
    this._status = newStatus;
    // 处理回调情况
    switch (newStatus) {
      case FULFILLED: {
        this.FULFILLED_CALLBACK_LIST.forEach((callback) => {
          callback(this.value);
        });
        break;
      }
      case REJECTED: {
        this.REJECTED_CALLBACK_LIST.forEach((callback) => {
          callback(this.reason);
        });
        break;
      }
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      // 更新值, 更新 status
      this.value = value;
      this.status = FULFILLED;
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      // 更新值, 更新 status
      this.reason = reason;
      this.status = REJECTED;
    }
  }

  then(onFulfilled, onRejected) {
    // 判断 onFulfilled，onRejected 是否为函数，如果是函数就直接使用，不是则返回value / reason(值透传)
    const realOnFulfilled = this.ifFunction(onFulfilled)
      ? onFulfilled
      : (value) => {
          return value;
        };
    const realOnRejected = this.ifFunction(onRejected)
      ? onRejected
      : (reason) => {
          return reason;
        };
    // 返回 promise
    const promise2 = new MPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        // 微任务队列
        queueMicrotask(() => {
          try {
            const x = realOnFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };
      const rejectedMicrotask = () => {
        // 微任务队列
        queueMicrotask(() => {
          try {
            const x = realOnRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      switch (this.status) {
        case FULFILLED: {
          fulfilledMicrotask();
          break;
        }
        case REJECTED: {
          rejectedMicrotask();
          break;
        }
        case PENDING: {
          this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask);
          this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask);
        }
      }
    });
    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(
        new TypeError("The promise and the return value are the same")
      );
    }
    if (x instanceof MPromise) {
      queueMicrotask(() => {
        x.then((y) => {
          this.resolvePromise(promise2, y, resolve, reject);
        }, reject);
      });
    } else if (typeof x === "object" || this.isFunction(x)) {
      if (x === null) {
        return resolve(x);
      }

      let then = null;

      try {
        then = x.then;
      } catch (error) {
        return reject(error);
      }

      if (this.isFunction(then)) {
        // 只执行一次
        let called = false;
        try {
          then.call(
            x,
            (y) => {
              if (called) {
                return;
              }
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
              if (called) {
                return;
              }
              called = true;
              reject(r);
            }
          );
        } catch (error) {
          if (called) {
            return;
          }
          reject(error);
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }

  // 判断是否为函数
  ifFunction(param) {
    return typeof param === "function";
  }
  // 静态方法
  static resolve(value) {
    if (value instanceof MPromise) {
      return value;
    }

    return new MPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new MPromise((resolve, reject) => {
      reject(reason);
    });
  }
}
```
