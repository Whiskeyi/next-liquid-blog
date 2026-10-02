---
title: "Understanding Promises in Greater Depth"
header-img: imgs/head.jpg
catalog: true
date: 2022-05-02 23:54:11
subtitle: JS
tags:
  - JS
categories:
  - JS
translation-status: published
---

## Understanding Promises in greater depth

### Introduction to Promise

Promises offer a more structured approach to asynchronous programming than traditional callbacks and events, helping avoid callback hell. Initially proposed and implemented by the community, they became part of ES6, which standardized their usage and added native Promise objects.

A Promise is a container for the eventual result of an operation, usually asynchronous. Syntactically, it is an object through which the result can be obtained. Its unified API lets different asynchronous operations be handled in the same way.

Promises have **two main characteristics**:

1. **Their state is determined by the operation's outcome.** A Promise represents an asynchronous operation with three states: pending, fulfilled, and rejected. The operation's outcome determines its eventual state. The name expresses a promise that the outcome will be fixed.
2. **Once settled, the state does not change again.** A Promise can transition from pending to fulfilled or from pending to rejected. Once this happens, the result remains available. Adding callbacks after settlement still allows that result to be observed.

### Basic usage

ES6 defines Promise as a constructor for creating Promise instances.
The following code creates an instance:

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

The constructor accepts a function with two parameters, `resolve` and `reject`.

- `resolve` completes the Promise successfully, changing it from pending toward fulfillment and passing the operation's result to subsequent handlers.
- `reject` completes the Promise unsuccessfully, changing it from pending to rejected and passing the error to subsequent handlers.

After creating an instance, use then to register handlers for successful and rejected outcomes.

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

then accepts **two callback functions**:

- The first runs when the Promise is fulfilled.
- The second runs when it is rejected. Both are optional and receive the value or error supplied by the Promise.

**Points to remember:**

1. The Promise executor runs immediately. Promise reactions after resolution are scheduled through the event loop's microtask queue.
2. .then and .catch expect functions; non-function arguments are ignored and values pass through.
3. then can be called repeatedly and chained.
4. then returns a new Promise.

### Promise methods

#### Promise.prototype.then()

Promise instances have a then method defined on Promise.prototype. It registers handlers for state changes: the first handles fulfillment and the second rejection. Both are optional.

#### Promise.prototype.catch()

Promise.prototype.catch() is an alias for .then(null, rejection) or .then(undefined, rejection), and registers an error handler.

```js
const promise = new Promise(function (resolve, reject) {
  throw new Error("test");
});
promise.catch(function (error) {
  console.log(error);
});
```

In the example above, catch() handles the error thrown by the Promise. A try/catch can also handle errors in appropriate contexts.

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

Promise errors propagate down the chain until they are caught. An error is handled by the next suitable catch. For this reason, prefer catch over defining a rejection handler as the second argument to then().

#### Promise.prototype.finally()

finally() registers an operation that runs regardless of the Promise's eventual outcome.
It avoids duplicating an operation in both success and failure handlers.

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

#### Promise.all()

Promise.all() combines several Promise instances into one new Promise.

```js
const p = Promise.all([p1, p2, p3]);
```

Here, Promise.all() accepts an array containing p1, p2, and p3. Values that are not Promises are normalized through Promise.resolve. More generally, the argument can be any iterable whose members are processed this way.

The state of p depends on p1, p2, and p3 in two ways:

- p fulfills only when all three fulfill. Their results form an array passed to p's fulfillment handler.
- If any of them rejects, p rejects with the first rejection reason.

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

Promise.race() also combines several Promises into a new Promise.

```js
const p = Promise.race([p1, p2, p3]);
```

Whichever instance settles first—`whether successfully or unsuccessfully`—determines p's outcome. Its value or error is passed to p's corresponding handler.

As with Promise.all(), non-Promise values supplied to Promise.race() are normalized with Promise.resolve().

Note that Promise.race() does not cancel the other operations; they continue running.

#### Promise.allSettle()

Sometimes the next step should wait until every asynchronous operation has finished, regardless of success or failure. ES2020 introduced Promise.allSettled() for this purpose. Settled includes both fulfilled and rejected outcomes.

Promise.allSettled() accepts an array of Promises and returns a new Promise that settles only after all input Promises have settled, whether fulfilled or rejected.

#### Promise.any()

ES2021 introduced Promise.any(). It returns a Promise that fulfills when any input fulfills, or rejects when all inputs reject.

Unlike Promise.race(), Promise.any() does not stop at an individual rejection; it rejects only when every input has rejected.

#### Promise.resolve()

Promise.resolve() converts an existing value into a Promise.

```js
Promise.resolve("foo");
// 等价于
new Promise((resolve) => resolve("foo"));
```

There are four cases:

1. The argument is a Promise instance. Promise.resolve returns that instance unchanged when it belongs to the same constructor.
2. The argument is a thenable, an object with a then method. Promise.resolve creates a Promise that adopts the thenable's outcome.
3. The argument is a primitive or an object without then(). Promise.resolve returns a fulfilled Promise carrying that value, which is passed to its fulfillment handler.
4. No argument is supplied. Promise.resolve returns a fulfilled Promise.

#### Promise.reject()

Promise.reject(reason) returns a new rejected Promise carrying the supplied reason.

```js
const p = Promise.reject("出错了");
// 等同于
const p = new Promise((resolve, reject) => reject("出错了"));

p.then(null, function (s) {
  console.log(s);
});
// 出错了
```

### Implementing Promises by hand

#### PromiseAll(Promise.all())

**Points to remember:**

1. PromiseAll returns a Promise.

2. PromiseAll results must preserve input order even when operations finish out of order. Use `res[i] = value` instead of `rz.push()`.

3. Track completion with a counter rather than array length. Because arrays can be sparse, assigning only index 6, as in `let res[6] = 1`, can make `res.length === 7` true without seven results having completed.

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

**Points to remember:**

1. PromiseRace also returns a Promise.

2. Its outcome is determined by whichever operation finishes first.

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

#### Implementing a Promise

**Steps:**

1. Initialize the class.
2. Define the three state types.
3. Set the initial state.
4. resolve / reject。
5. Implement .then and the constructor's executor, which receives resolve and reject. Invoke it when constructing the Promise, and reject any error it throws.
6. Observe status changes through getters and setters.
7. Continue implementing .then.
8. Implement resolvePromise.
9. Implement .catch.
10. Implement the static resolve and reject methods.

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
