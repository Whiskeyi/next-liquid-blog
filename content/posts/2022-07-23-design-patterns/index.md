---
title: 设计原则 & 设计模式
header-img: imgs/head.jpg
catalog: true
date: 2022-07-23 16:45:06
subtitle: JS
tags:
  - JS
categories:
  - JS
---

## 设计原则 & 设计模式

### 前言

从6月入职网易前端实习到现在，在开发过程中越来越感慨设计原则和设计模式的重要性。软件设计最大的难题就是应对需求的变化，但是纷繁复杂的需求变化又是不可预料的，我们要为不可预料的变化做好准备，因此就很有必要在编码的环节做足功夫，保障代码的易维护性、易拓展性、可读性、兼容性等。这可能也就是我们与前辈编写代码时的主要区别。在之前学校课程里也有教过这方面的知识但是自己觉得并没有很深入地去理解它们。于是便想写下这篇文章重新梳理一下设计原则和设计模式知识。

### 六大设计原则

在讲设计模式前首先对六大设计原则进行介绍

六大设计原则主要是指：

- 单一职责原则（Single Responsibility Principle）
- 开闭原则（Open Closed Principle）
- 里氏替换原则（Liskov Substitution Principle）
- 迪米特法则（Law of Demeter），“最少知道法则”
- 接口隔离原则（Interface Segregation Principle）
- 依赖倒置原则（Dependence Inversion Principle）

它们的英文首字母组合形成SOLID——稳定的（其中L字母重复取一个），代表这把这 6 个原则结合使用的好处是建立稳定、灵活、健壮的设计。

#### 单一职责原则

一个类或接口只承担一个职责，有且仅有一个原因引起类的变更

优点：

1. 类的复杂性降低，实现什么职责都有清晰明确的定义

2. 复杂性降低，可读性提高

3. 可读性提高，可维护性提高

4. 变更引起的风险降低。如果接口的单一职责做得好，一个接口修改只对相应的实现类有影响，对其他的接口无影响，这对系统的扩展性、维护性都有很大帮助

#### 开闭原则

对拓展开放，对修改关闭（应该通过扩展来实现变化，而不是通过修改已有的代码来实现变化）

是最基本的一个原则，提高了复用性以及可维护性

#### 里氏替换原则

子类可以替换父类（只要父类能出现的地方，子类就可以出现，而且替换为子类也不会产生任何错误或异常）

在继承类时，务必重写（override）父类中所有的方法，尤其需要注意父类的protected方法（往往需要重写），子类尽量不要暴露自己的public方法供外界调用

四个层次规范：

1. 子类必须完全实现父类的方法

2. 子类中可以增加自己的特有方法

3. 子类可以重载父类方法，但不能覆盖，且入参可以放大

4. 子类实现抽象方法时，返回值可以是父类返回值的子类

#### 迪米特原则

对象与对象之间应该尽可能少关联，减小类之间的耦合

核心观念就是类间解耦，弱耦合，只有弱耦合了以后，类才能够易被复用

#### 接口隔离原则

类间的依赖关系应该建立在最小的接口上，不要对外暴露没有实际意义的接口（一个接口不能过于臃肿，使用多个专一功能的接口比一个总接口好）

#### 依赖倒置原则

面向接口编程，依赖于抽象而不依赖于具体类

高层模块不应该依赖于低层模块，而应该依赖于抽象。抽象不应依赖于细节，细节应依赖于抽象。

1. 模块间的依赖通过抽象发生，实现类之间不直接发生依赖关系，其依赖关系通过接口或抽象类产生的

2. 接口或抽象类不依赖于实现类

3. 实现类依赖接口或抽象类

减少类间的耦合性，提高系统的稳定性，降低并行开发引起的风险，提高代码的可读性和可维护性

### 23 种设计模式

#### 设计模式分类

设计模式是对软件设计中普遍存在（反复出现）的各种问题，所提出的解决方案

设计模式分为三大类：

**创建型模式：**

用来描述 “如何创建对象”，它的主要特点是 “将对象的创建和使用分离”

共五种：工厂方法模式、抽象工厂模式、单例模式、建造者模式、原型模式

**结构型模式：**

用来描述如何将类或对象按照某种布局组成更大的结构

共七种：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式

**行为型模式：**

用来识别对象之间的常用交流模式以及如何分配职责

共十一种：策略模式、模板方法模式、观察者模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式

#### 创建型模式

创建型模式关心的是对象如何被创建。它们的共同目标不是“少写几个 `new`”，而是把对象创建过程从业务逻辑里抽离出来，让代码在需求变化时更容易替换、扩展和复用。

##### 单例模式

**定义：**保证一个类只有一个实例，并提供一个全局访问点。

**适用场景：**

1. 全局状态管理，如配置中心、登录态、store
2. 全局唯一资源，如弹窗管理器、埋点实例、WebSocket 连接
3. 创建成本较高，且不需要重复创建的对象

```js
class Modal {
  constructor() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

const getModal = (() => {
  let instance = null;

  return () => {
    if (!instance) {
      instance = new Modal();
    }
    return instance;
  };
})();

const modalA = getModal();
const modalB = getModal();

console.log(modalA === modalB); // true
```

单例模式的优点是可以避免重复创建实例，统一管理共享资源；缺点是容易引入全局状态，使模块之间产生隐式依赖。前端项目里使用单例时要格外注意测试隔离和状态重置。

##### 工厂方法模式

**定义：**把对象创建逻辑封装到工厂方法中，调用方只关心创建结果，不直接依赖具体类。

比如在业务里需要根据不同类型渲染不同按钮，如果到处都写 `if/else` 去判断具体类，后续新增类型时就会修改很多地方。工厂方法可以把变化集中在创建层。

```js
class PrimaryButton {
  render() {
    return '<button class="primary">提交</button>';
  }
}

class DangerButton {
  render() {
    return '<button class="danger">删除</button>';
  }
}

class ButtonFactory {
  static create(type) {
    const buttonMap = {
      primary: PrimaryButton,
      danger: DangerButton,
    };

    const Button = buttonMap[type] || PrimaryButton;
    return new Button();
  }
}

const button = ButtonFactory.create("danger");
console.log(button.render());
```

工厂方法的重点是隔离“创建什么”。调用方不需要知道类名，也不需要知道初始化细节，只需要传入业务类型。这样新增按钮类型时，主要修改工厂映射即可。

##### 抽象工厂模式

**定义：**提供一个创建一系列相关对象的接口，而不需要指定它们的具体类。

工厂方法通常创建一种对象，抽象工厂则创建一组风格一致、相互关联的对象。例如一个主题工厂可以同时创建按钮、输入框、弹窗等组件，保证它们属于同一套主题。

```js
class LightThemeFactory {
  createButton() {
    return { color: "#1677ff", background: "#ffffff" };
  }

  createInput() {
    return { borderColor: "#d9d9d9", background: "#ffffff" };
  }
}

class DarkThemeFactory {
  createButton() {
    return { color: "#ffffff", background: "#1f1f1f" };
  }

  createInput() {
    return { borderColor: "#444444", background: "#141414" };
  }
}

function renderForm(themeFactory) {
  const buttonStyle = themeFactory.createButton();
  const inputStyle = themeFactory.createInput();

  return {
    buttonStyle,
    inputStyle,
  };
}

console.log(renderForm(new DarkThemeFactory()));
```

抽象工厂适合“产品族”场景。它的优势是能保证一组对象的一致性，缺点是当产品族中新增一种产品时，需要修改所有工厂类。

##### 建造者模式

**定义：**将一个复杂对象的构建过程和表示分离，使同样的构建过程可以创建不同的表示。

当一个对象有很多可选配置时，构造函数参数会很快变得难以维护。建造者模式可以通过链式调用逐步描述对象。

```js
class RequestBuilder {
  constructor(url) {
    this.options = {
      url,
      method: "GET",
      headers: {},
      data: null,
    };
  }

  method(method) {
    this.options.method = method;
    return this;
  }

  header(key, value) {
    this.options.headers[key] = value;
    return this;
  }

  body(data) {
    this.options.data = data;
    return this;
  }

  build() {
    return this.options;
  }
}

const request = new RequestBuilder("/api/user")
  .method("POST")
  .header("Content-Type", "application/json")
  .body({ name: "Tom" })
  .build();

console.log(request);
```

建造者模式常见于复杂配置对象、表单 Schema、图表配置、查询条件生成等场景。它让创建过程更清晰，也能在 `build` 阶段统一做参数校验。

##### 原型模式

**定义：**通过复制已有对象来创建新对象，而不是重新实例化。

在 JavaScript 中，原型模式非常天然，因为 JS 本身就是基于原型的语言。实际业务里更常见的是通过模板对象生成新对象。

```js
const defaultChartConfig = {
  type: "line",
  animation: true,
  axis: {
    x: "date",
    y: "value",
  },
};

function createChartConfig(options) {
  return {
    ...structuredClone(defaultChartConfig),
    ...options,
  };
}

const barChartConfig = createChartConfig({
  type: "bar",
});

console.log(barChartConfig);
```

原型模式适合对象创建成本较高、对象结构相似的场景。使用时要注意深拷贝和浅拷贝的区别，避免多个对象共享可变引用导致互相影响。

#### 结构型模式

结构型模式关心的是对象之间如何组合。它们通常不改变对象本身的职责，而是通过包装、转接、聚合等方式，让已有对象形成更好用、更稳定的结构。

##### 适配器模式（类 / 对象）

**定义：**将一个类或对象的接口转换成调用方期望的另一个接口，使原本接口不兼容的对象可以一起工作。

前端开发里经常遇到接口字段变更、第三方库 API 不一致、老模块接入新模块等问题，这些都适合用适配器处理。

```js
const legacyUser = {
  user_name: "Tom",
  avatar_url: "/avatar.png",
};

function userAdapter(user) {
  return {
    name: user.user_name,
    avatar: user.avatar_url,
  };
}

function renderUser(user) {
  return `<img src="${user.avatar}" alt="${user.name}" />`;
}

renderUser(userAdapter(legacyUser));
```

适配器的意义是把兼容逻辑集中起来，避免新旧字段转换散落在页面各处。它尤其适合处理后端接口迁移期的兼容问题。

##### 代理模式

**定义：**为某个对象提供一个代理对象，由代理对象控制对原对象的访问。

代理模式可以用于缓存、权限控制、延迟加载、日志上报等。ES6 的 `Proxy` 就是非常直接的代理能力。

```js
function createImageLoader() {
  const cache = new Map();

  return {
    load(src) {
      if (cache.has(src)) {
        return cache.get(src);
      }

      const image = new Image();
      image.src = src;
      cache.set(src, image);
      return image;
    },
  };
}

const imageLoader = createImageLoader();

imageLoader.load("/banner.png");
imageLoader.load("/banner.png"); // 第二次直接读取缓存
```

代理对象和真实对象通常暴露相同或相近的接口，因此调用方感知不到内部增加了缓存、校验或延迟执行等能力。

##### 装饰器模式

**定义：**在不改变原对象结构的情况下，动态地给对象增加额外功能。

装饰器强调“增强”，而不是“替换”。它和代理模式有点像，但代理更关注控制访问，装饰器更关注附加能力。

```js
function submitForm(data) {
  console.log("提交表单", data);
}

function withLoading(fn) {
  return async (...args) => {
    console.log("开始 loading");
    try {
      return await fn(...args);
    } finally {
      console.log("结束 loading");
    }
  };
}

const submitWithLoading = withLoading(submitForm);

submitWithLoading({ name: "Tom" });
```

React 中的高阶组件、函数组合、中间件增强函数都可以看到装饰器模式的影子。

##### 外观模式

**定义：**为复杂子系统提供一个统一的高层接口，让调用方更容易使用。

比如一次页面初始化可能要获取用户信息、权限、菜单和配置，如果每个页面都手动组合这些请求，就会产生重复逻辑。可以通过外观模式封装一个简单入口。

```js
async function initPage() {
  const [user, permissions, menus] = await Promise.all([
    fetch("/api/user").then((res) => res.json()),
    fetch("/api/permissions").then((res) => res.json()),
    fetch("/api/menus").then((res) => res.json()),
  ]);

  return {
    user,
    permissions,
    menus,
  };
}

initPage().then((pageData) => {
  console.log(pageData);
});
```

外观模式的好处是降低调用复杂度，缺点是如果外观层持续膨胀，就可能变成新的“大泥球”。因此它应该只封装稳定、常用的组合流程。

##### 桥接模式

**定义：**将抽象部分和实现部分分离，使它们可以独立变化。

当两个维度都可能变化时，如果直接用继承组合，很容易出现类爆炸。桥接模式可以把变化维度拆开，用组合连接它们。

```js
class CanvasRenderer {
  drawCircle(x, y, radius) {
    console.log("canvas circle", x, y, radius);
  }
}

class SvgRenderer {
  drawCircle(x, y, radius) {
    console.log("svg circle", x, y, radius);
  }
}

class Circle {
  constructor(renderer, x, y, radius) {
    this.renderer = renderer;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw() {
    this.renderer.drawCircle(this.x, this.y, this.radius);
  }
}

new Circle(new CanvasRenderer(), 10, 10, 5).draw();
new Circle(new SvgRenderer(), 10, 10, 5).draw();
```

图形类型和渲染方式是两个独立变化的维度。桥接模式让新增图形或新增渲染器时都不需要修改另一侧。

##### 组合模式

**定义：**将对象组合成树形结构，使调用方可以用一致的方式处理单个对象和组合对象。

DOM 树、组件树、菜单树、文件目录树都是组合模式的典型例子。

```js
class MenuItem {
  constructor(name) {
    this.name = name;
  }

  render() {
    return `<li>${this.name}</li>`;
  }
}

class MenuGroup {
  constructor(name) {
    this.name = name;
    this.children = [];
  }

  add(item) {
    this.children.push(item);
  }

  render() {
    const children = this.children.map((child) => child.render()).join("");
    return `<li>${this.name}<ul>${children}</ul></li>`;
  }
}

const root = new MenuGroup("系统管理");
root.add(new MenuItem("用户管理"));
root.add(new MenuItem("角色管理"));

console.log(root.render());
```

组合模式的关键是统一接口。无论是叶子节点还是容器节点，都可以被上层以同样的方式调用。

##### 享元模式

**定义：**通过共享大量细粒度对象的公共部分，减少内存占用。

享元模式会把对象状态拆成内部状态和外部状态。内部状态可以共享，外部状态由调用方传入。

```js
class Icon {
  constructor(type) {
    this.type = type;
  }

  render(position) {
    return `<span class="icon-${this.type}" style="left:${position.x}px;top:${position.y}px"></span>`;
  }
}

class IconFactory {
  constructor() {
    this.cache = new Map();
  }

  getIcon(type) {
    if (!this.cache.has(type)) {
      this.cache.set(type, new Icon(type));
    }
    return this.cache.get(type);
  }
}

const factory = new IconFactory();
const warningIcon = factory.getIcon("warning");

warningIcon.render({ x: 10, y: 20 });
warningIcon.render({ x: 40, y: 80 });
```

当页面中有大量相似对象时，比如地图标记、图标、表格单元格、虚拟列表节点，享元模式可以减少重复对象创建。

#### 行为型模式

行为型模式关心对象之间如何通信、如何分配职责。它们更多是在处理流程、状态和协作关系，让复杂业务逻辑不至于集中在一个函数里。

##### 迭代器模式

**定义：**提供一种方法顺序访问聚合对象中的元素，而不暴露其内部结构。

JavaScript 中的 `Iterator` 和 `for...of` 已经内置了迭代器思想。数组、Map、Set 都可以用统一方式遍历。

```js
const users = ["Tom", "Jack", "Lucy"];

const iterator = users[Symbol.iterator]();

console.log(iterator.next()); // { value: 'Tom', done: false }
console.log(iterator.next()); // { value: 'Jack', done: false }
console.log(iterator.next()); // { value: 'Lucy', done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

迭代器模式让调用方不需要知道数据底层是数组、链表还是树，只需要按照统一协议取下一个元素。

##### 模板方法模式

**定义：**在父类中定义算法骨架，把某些步骤延迟到子类中实现。

它适合流程固定、细节变化的场景。比如不同类型页面的加载流程都包括“获取数据、转换数据、渲染页面”，但每一步的具体实现不同。

```js
class Page {
  async init() {
    const data = await this.fetchData();
    const viewModel = this.formatData(data);
    this.render(viewModel);
  }

  async fetchData() {
    throw new Error("子类需要实现 fetchData");
  }

  formatData(data) {
    return data;
  }

  render(viewModel) {
    console.log("render", viewModel);
  }
}

class UserPage extends Page {
  async fetchData() {
    return { name: "Tom" };
  }

  formatData(data) {
    return {
      title: `用户：${data.name}`,
    };
  }
}

new UserPage().init();
```

模板方法可以复用稳定流程，但继承层级过深会降低灵活性。在函数式代码里，也可以用“固定流程函数 + 回调参数”实现类似效果。

##### 策略模式

**定义：**定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。

策略模式常用来消除复杂的条件分支。比如不同会员等级有不同折扣规则：

```js
const discountStrategies = {
  normal(price) {
    return price;
  },
  vip(price) {
    return price * 0.9;
  },
  svip(price) {
    return price * 0.8;
  },
};

function getFinalPrice(price, userLevel) {
  const strategy = discountStrategies[userLevel] || discountStrategies.normal;
  return strategy(price);
}

console.log(getFinalPrice(100, "vip")); // 90
```

策略模式符合开闭原则。新增一种规则时，通常只需要新增策略，而不是修改一大段 `if/else`。

##### 责任链模式

**定义：**让多个对象都有机会处理请求，从而避免请求发送者和接收者之间的耦合。请求会沿着链条传递，直到被处理或链条结束。

常见场景包括表单校验、权限判断、请求拦截器、事件冒泡、中间件机制。

```js
class Validator {
  constructor(handler) {
    this.handler = handler;
    this.next = null;
  }

  setNext(validator) {
    this.next = validator;
    return validator;
  }

  validate(value) {
    const result = this.handler(value);

    if (result !== true) {
      return result;
    }

    return this.next ? this.next.validate(value) : true;
  }
}

const required = new Validator((value) => value ? true : "请输入内容");
const maxLength = new Validator((value) => value.length <= 10 ? true : "最多输入 10 个字符");

required.setNext(maxLength);

console.log(required.validate("hello"));
```

责任链模式让每个处理节点只关注自己的职责，节点之间可以灵活增删和调整顺序。

##### 观察者模式

**定义：**当一个对象状态发生变化时，所有依赖它的对象都会收到通知并自动更新。

观察者模式由“被观察者”和“观察者”组成。前端里的事件监听、发布订阅、响应式更新都和它关系很近。

```js
class Subject {
  constructor() {
    this.observers = new Set();
  }

  subscribe(observer) {
    this.observers.add(observer);
  }

  unsubscribe(observer) {
    this.observers.delete(observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer(data));
  }
}

const userSubject = new Subject();

userSubject.subscribe((user) => {
  console.log("更新头像", user.avatar);
});

userSubject.subscribe((user) => {
  console.log("更新用户名", user.name);
});

userSubject.notify({
  name: "Tom",
  avatar: "/avatar.png",
});
```

观察者模式可以降低状态生产者和消费者之间的耦合，但如果订阅关系复杂，也容易造成更新链路不清晰。因此在大型项目里要注意订阅的生命周期管理。

##### 命令模式

**定义：**将请求封装成对象，使请求发送者和执行者解耦。

命令模式的特点是可以把“要做什么”先记录下来，再决定什么时候执行、撤销或重放。编辑器里的撤销/重做就是典型场景。

```js
class AddTextCommand {
  constructor(editor, text) {
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.content += this.text;
  }

  undo() {
    this.editor.content = this.editor.content.slice(0, -this.text.length);
  }
}

const editor = {
  content: "",
};

const command = new AddTextCommand(editor, "hello");

command.execute();
console.log(editor.content); // hello

command.undo();
console.log(editor.content); // ''
```

命令模式适合操作历史、任务队列、宏命令、快捷键绑定等场景。

##### 备忘录模式

**定义：**在不破坏对象封装的前提下，保存对象某个时刻的状态，并在需要时恢复。

备忘录模式常用于草稿保存、撤销恢复、表单快照等。

```js
class FormState {
  constructor() {
    this.values = {};
  }

  setValue(key, value) {
    this.values[key] = value;
  }

  save() {
    return structuredClone(this.values);
  }

  restore(snapshot) {
    this.values = structuredClone(snapshot);
  }
}

const form = new FormState();

form.setValue("name", "Tom");
const snapshot = form.save();

form.setValue("name", "Jack");
form.restore(snapshot);

console.log(form.values.name); // Tom
```

备忘录模式的核心是状态快照。它和命令模式都可以用于撤销，但命令模式保存的是操作，备忘录模式保存的是状态。

##### 状态模式

**定义：**允许对象在内部状态改变时改变它的行为，看起来像是修改了对象的类。

当一个对象在不同状态下有大量不同分支时，可以把每种状态封装成独立对象。

```js
const orderStates = {
  pending: {
    cancel(order) {
      order.state = "cancelled";
    },
    pay(order) {
      order.state = "paid";
    },
  },
  paid: {
    cancel() {
      throw new Error("已支付订单不能直接取消");
    },
    ship(order) {
      order.state = "shipped";
    },
  },
  shipped: {
    cancel() {
      throw new Error("已发货订单不能取消");
    },
  },
};

const order = {
  state: "pending",
  pay() {
    orderStates[this.state].pay(this);
  },
  cancel() {
    orderStates[this.state].cancel(this);
  },
};

order.pay();
console.log(order.state); // paid
```

状态模式可以减少大量状态判断，让状态转换更集中。复杂业务里还可以进一步使用状态机来描述状态和事件。

##### 访问者模式

**定义：**在不改变对象结构的前提下，为对象结构中的元素增加新的操作。

访问者模式适合对象结构稳定，但操作经常变化的场景。例如 AST 节点类型相对稳定，但我们可能需要格式化、校验、编译等不同操作。

```js
const ast = {
  type: "BinaryExpression",
  left: { type: "NumberLiteral", value: 1 },
  right: { type: "NumberLiteral", value: 2 },
  operator: "+",
};

const visitor = {
  NumberLiteral(node) {
    return node.value;
  },
  BinaryExpression(node) {
    const left = visit(node.left);
    const right = visit(node.right);
    return `${left} ${node.operator} ${right}`;
  },
};

function visit(node) {
  return visitor[node.type](node);
}

console.log(visit(ast)); // 1 + 2
```

Babel、ESLint 等工具都大量使用访问者模式处理 AST。它的优势是方便新增操作，缺点是新增节点类型时需要同步修改访问者。

##### 中介者模式

**定义：**用一个中介对象封装多个对象之间的交互，使对象之间不需要显式相互引用。

当多个模块互相调用、互相影响时，很容易形成网状依赖。中介者模式可以把这些交互收敛到统一协调者中。

```js
class FormMediator {
  constructor() {
    this.fields = new Map();
  }

  register(name, field) {
    this.fields.set(name, field);
  }

  update(name, value) {
    const field = this.fields.get(name);
    field.value = value;

    if (name === "country") {
      const city = this.fields.get("city");
      city.disabled = value !== "China";
    }
  }
}

const mediator = new FormMediator();

mediator.register("country", { value: "", disabled: false });
mediator.register("city", { value: "", disabled: false });
mediator.update("country", "China");
```

中介者模式可以减少对象之间的直接依赖，但中介者本身可能变得复杂，所以适合用在交互关系确实复杂的模块中。

##### 解释器模式

**定义：**给定一种语言，定义它的语法表示，并定义一个解释器来解释语言中的句子。

解释器模式在业务代码中不算常见，但在规则引擎、模板引擎、表达式解析、查询 DSL 中经常出现。

```js
function interpret(expression, context) {
  const [left, operator, right] = expression.split(" ");
  const leftValue = context[left];
  const rightValue = Number(right);

  if (operator === ">") {
    return leftValue > rightValue;
  }

  if (operator === "<") {
    return leftValue < rightValue;
  }

  if (operator === "===") {
    return leftValue === rightValue;
  }

  throw new Error(`不支持的操作符：${operator}`);
}

const visible = interpret("age > 18", {
  age: 20,
});

console.log(visible); // true
```

上面的例子只是一个非常简化的表达式解释器。真实项目中如果规则复杂，通常会用成熟的解析器或规则引擎，避免手写解析逻辑带来维护风险。

### 总结

设计原则是方向，设计模式是经验。原则告诉我们什么样的代码更稳定，比如单一职责、开闭原则、依赖倒置；模式则提供了一些经过验证的组织方式，帮助我们在具体场景里落地这些原则。

但设计模式并不是越多越好，也不是每段代码都要套一个名字。真正重要的是先识别变化点：对象创建是否复杂、模块组合是否混乱、流程分支是否膨胀、状态转换是否难以维护。只有当模式能降低复杂度、隔离变化、提升可读性时，它才是有价值的。

在前端开发中，很多模式其实已经融入日常工具和框架里：React 的组件树体现组合模式，Redux / Zustand 里能看到观察者思想，Axios 拦截器像责任链，Babel 插件大量使用访问者模式。理解这些模式不是为了写出更“高级”的代码，而是为了在面对变化时，能更清楚地知道代码应该往哪里拆、职责应该放在哪里。
