---
title: Design Principles and Design Patterns
header-img: imgs/head.jpg
catalog: true
date: 2022-07-23 16:45:06
subtitle: JS
tags:
  - JS
categories:
  - JS
translation-status: published
---

## Design Principles and Design Patterns

### Introduction

Since starting my frontend internship at NetEase in June, I have become increasingly aware of the importance of design principles and patterns. One of software design's greatest challenges is changing requirements, yet those changes are unpredictable. Preparing for them means investing in maintainable, extensible, readable, and compatible code. This may be one of the main differences between how newcomers and experienced developers write code. My university courses covered these topics, but I did not feel I understood them deeply. This article revisits and organizes those ideas.

### Six Design Principles

Before discussing patterns, let's introduce six design principles.

They are:

- Single Responsibility Principle
- Open–Closed Principle
- Liskov Substitution Principle
- Law of Demeter, also called the principle of least knowledge
- Interface Segregation Principle
- Dependency Inversion Principle

Their initials form SOLID, using one L for the two L principles listed here. Together, they guide stable, flexible, and robust designs.

#### Single Responsibility Principle

A class or interface should have one responsibility, with only one reason to change.

Benefits:

1. Lower class complexity, with clearly defined responsibilities.

2. Lower complexity improves readability.

3. Better readability improves maintainability.

4. Lower change risk. A well-focused interface limits the impact of its changes to the corresponding implementations, helping extensibility and maintenance.

#### Open–Closed Principle

Open for extension, closed for modification: implement changes through extension rather than by changing existing code.

This foundational principle improves reuse and maintainability.

#### Liskov Substitution Principle

A subclass can replace its parent wherever the parent is used, without introducing errors or exceptions.

When inheriting a class, pay attention to overriding its methods, especially protected methods. Avoid exposing additional public subclass methods unnecessarily.

Four guidelines:

1. Subclasses must fully implement the parent class's methods.

2. Subclasses may add their own methods.

3. Subclasses may overload parent methods, but should not undermine their behavior; input acceptance may be broadened.

4. When implementing abstract methods, return values may be subtypes of the parent's return type.

#### Law of Demeter

Minimize associations between objects to reduce coupling between classes.

The central idea is decoupling: loosely coupled classes are easier to reuse.

#### Interface Segregation Principle

Dependencies between classes should rely on the smallest relevant interfaces. Avoid exposing meaningless functionality or creating bloated interfaces; several focused interfaces are better than one all-purpose interface.

#### Dependency Inversion Principle

Program to interfaces and depend on abstractions rather than concrete classes.

High-level modules should depend on abstractions rather than low-level modules. Abstractions should not depend on details; details should depend on abstractions.

1. Dependencies between modules occur through abstractions, interfaces, or abstract classes, rather than directly between implementations.

2. Interfaces and abstract classes do not depend on implementation classes.

3. Implementation classes depend on interfaces or abstract classes.

This reduces coupling, improves stability, lowers risks in parallel development, and makes code more readable and maintainable.

### The 23 Design Patterns

#### Categories of Design Patterns

Design patterns are solutions to recurring problems in software design.

They fall into three categories:

**Creational patterns:**

Describe how objects are created, separating their creation from their use.

Five patterns: Factory Method, Abstract Factory, Singleton, Builder, and Prototype.

**Structural patterns:**

Describe how classes and objects are assembled into larger structures.

Seven patterns: Adapter, Decorator, Proxy, Facade, Bridge, Composite, and Flyweight.

**Behavioral patterns:**

Identify common ways objects communicate and allocate responsibilities.

Eleven patterns: Strategy, Template Method, Observer, Iterator, Chain of Responsibility, Command, Memento, State, Visitor, Mediator, and Interpreter.

#### Creational Patterns

Creational patterns concern how objects are created. Their shared goal is not merely reducing `new` expressions, but separating creation from business logic so code can be replaced, extended, and reused as requirements change.

##### Singleton

**Definition:** ensure a class has only one instance and provide a global access point.

**Use cases:**

1. Global state management, such as configuration, authentication state, and stores
2. Unique global resources, such as dialog managers, analytics instances, and WebSocket connections
3. Expensive objects that do not need to be created repeatedly

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

Singletons avoid repeated instantiation and centralize shared resource management. However, they can introduce global state and implicit dependencies. In frontend projects, pay special attention to test isolation and state resets.

##### Factory Method

**Definition:** encapsulate creation in a factory method so callers depend on the result rather than concrete classes.

For example, rendering different buttons by business type with scattered `if/else` checks means adding a type changes many places. A factory method concentrates that variation in the creation layer.

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

The point is to isolate what gets created. Callers need neither class names nor initialization details, only the business type. Adding a button type then mainly changes the factory mapping.

##### Abstract Factory

**Definition:** provide an interface for creating families of related objects without specifying their concrete classes.

Factory methods generally create one kind of object; abstract factories create a related set with a consistent style. A theme factory might create buttons, inputs, and dialogs belonging to the same theme.

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

Abstract factories suit product families. They ensure consistency across objects, but adding a new kind of product to the family requires updating all factories.

##### Builder

**Definition:** separate the construction of a complex object from its representation so the same process can create different representations.

When an object has many optional settings, constructor parameters become difficult to maintain. A builder describes the object step by step, often through chained calls.

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

Builders commonly support complex configuration objects, form schemas, chart settings, and query conditions. They clarify construction and allow centralized validation at the `build` stage.

##### Prototype

**Definition:** create objects by copying an existing object rather than instantiating them from scratch.

This pattern is natural in JavaScript because the language is prototype-based. In business code, a common application is generating objects from a template.

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

Prototypes suit expensive creation processes or similar object structures. Understand shallow versus deep copies to avoid unintended shared mutable references.

#### Structural Patterns

Structural patterns concern how objects compose. They generally preserve existing responsibilities while using wrapping, adaptation, or aggregation to create more useful and stable structures.

##### Adapter: Class and Object Adapters

**Definition:** convert an interface into the one a caller expects so incompatible objects can work together.

Adapters suit changing API fields, inconsistent third-party APIs, and integration between old and new modules.

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

They centralize compatibility logic rather than scattering field conversions throughout pages, especially during backend API migrations.

##### Proxy

**Definition:** provide a substitute object that controls access to the original object.

Proxies support caching, access control, lazy loading, and logging. ES6's `Proxy` offers direct support for this capability.

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

The proxy and real object usually expose the same or similar interfaces, hiding added caching, validation, or deferred execution from callers.

##### Decorator

**Definition:** dynamically add functionality without changing the original object's structure.

Decorators emphasize enhancement rather than replacement. They resemble proxies, but proxies focus on controlling access while decorators focus on adding capabilities.

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

React higher-order components, function composition, and middleware enhancement functions all show this pattern.

##### Facade

**Definition:** provide a unified, high-level interface to a complex subsystem, making it easier to use.

Page initialization might require user details, permissions, menus, and configuration. Manually combining these requests on every page creates duplication; a facade provides a simple entry point.

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

Facades reduce calling complexity, but a constantly expanding facade can become a new big ball of mud. Limit it to stable, commonly used combinations.

##### Bridge

**Definition:** separate abstraction from implementation so both can vary independently.

When two dimensions vary, combining them through inheritance can cause an explosion of classes. Bridges separate the dimensions and connect them through composition.

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

Shape types and rendering methods are independent dimensions. A bridge allows adding a shape or renderer without changing the other side.

##### Composite

**Definition:** compose objects into tree structures so callers treat individual and composite objects consistently.

DOM trees, component trees, menus, and file directory trees are typical examples.

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

A unified interface is essential: higher-level code can call leaves and containers in the same way.

##### Flyweight

**Definition:** reduce memory usage by sharing common parts of many fine-grained objects.

Flyweights distinguish intrinsic state, which can be shared, from extrinsic state supplied by the caller.

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

For many similar objects—map markers, icons, table cells, or virtual list nodes—flyweights can reduce repeated object creation.

#### Behavioral Patterns

Behavioral patterns concern communication and responsibility allocation. They organize workflows, state, and collaboration so complex business logic does not accumulate in one function.

##### Iterator

**Definition:** access elements of an aggregate sequentially without exposing its internal structure.

JavaScript's `Iterator` and `for...of` already embody this idea. Arrays, Maps, and Sets can be traversed consistently.

```js
const users = ["Tom", "Jack", "Lucy"];

const iterator = users[Symbol.iterator]();

console.log(iterator.next()); // { value: 'Tom', done: false }
console.log(iterator.next()); // { value: 'Jack', done: false }
console.log(iterator.next()); // { value: 'Lucy', done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

Callers need not know whether the underlying data is an array, linked list, or tree; they obtain the next element through a common protocol.

##### Template Method

**Definition:** define an algorithm's skeleton in a parent class, leaving some steps to subclasses.

This suits stable workflows with varying details. Different pages might all fetch data, transform it, and render, while implementing each step differently.

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

Template methods reuse stable workflows, but deep inheritance reduces flexibility. Functional code can achieve a similar result through a fixed workflow function with callback parameters.

##### Strategy

**Definition:** define a family of algorithms, encapsulate each one, and make them interchangeable.

Strategies often remove complex conditional branches. For example, membership levels may use different discount rules:

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

Strategies follow the open–closed principle. Adding a rule generally means adding a strategy rather than modifying a large `if/else` block.

##### Chain of Responsibility

**Definition:** give several objects the opportunity to handle a request, decoupling its sender from its receiver. Pass the request along a chain until it is handled or the chain ends.

Common uses include form validation, permission checks, request interceptors, event bubbling, and middleware.

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

Each handler focuses on its own responsibility, and handlers can be added, removed, or reordered flexibly.

##### Observer

**Definition:** when an object's state changes, dependent objects are notified and update automatically.

The pattern consists of subjects and observers. Event listeners, publish/subscribe, and reactive updates are closely related frontend concepts.

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

Observers reduce coupling between state producers and consumers, but complex subscriptions can obscure update paths. Manage subscription lifecycles carefully in large projects.

##### Command

**Definition:** encapsulate a request as an object, decoupling the sender from the executor.

Commands record what to do before deciding when to execute, undo, or replay it. Editor undo/redo is a typical example.

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

Commands suit operation histories, task queues, macros, and keyboard shortcuts.

##### Memento

**Definition:** save an object's state at a particular moment and restore it later without breaking encapsulation.

Mementos often support drafts, undo restoration, and form snapshots.

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

The core is a state snapshot. Both commands and mementos support undo, but commands store operations while mementos store state.

##### State

**Definition:** let an object change its behavior when its internal state changes, as though its class had changed.

When behavior branches heavily across states, encapsulate each state in a separate object.

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

State objects reduce conditional checks and centralize transitions. Complex workflows can go further with state machines describing states and events.

##### Visitor

**Definition:** add operations to elements of an object structure without changing that structure.

Visitors suit stable object structures with frequently changing operations. AST node types may remain stable while formatting, validation, and compilation operations vary.

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

Babel and ESLint use visitors extensively for AST processing. Adding operations is easy, but adding node types requires updating visitors.

##### Mediator

**Definition:** encapsulate interactions among objects in a mediator so they need not reference one another explicitly.

Modules that call and influence one another can form a tangled dependency network. A mediator concentrates those interactions in one coordinator.

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

Mediators reduce direct dependencies, but may become complex themselves. Use them where interaction relationships are truly complex.

##### Interpreter

**Definition:** define a language's grammar representation and an interpreter for its sentences.

Interpreters are less common in ordinary business code but appear in rule engines, template engines, expression parsing, and query DSLs.

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

The example above is only a highly simplified expression interpreter. For complex rules, mature parsers or rule engines usually avoid the maintenance risk of handwritten parsing.

### Conclusion

Design principles provide direction; patterns provide accumulated experience. Principles describe stable code through ideas such as single responsibility, openness to extension, and dependency inversion. Patterns offer proven organizational approaches that apply those principles to concrete situations.

More patterns are not automatically better, and every piece of code does not need a pattern name. First identify what varies: is creation complex, composition disordered, branching excessive, or state transition hard to maintain? A pattern is valuable when it reduces complexity, isolates change, or improves readability.

Many frontend tools and frameworks already embody these patterns. React's component tree reflects Composite; Redux and Zustand reflect Observer ideas; Axios interceptors resemble a Chain of Responsibility; Babel plugins use Visitors extensively. Understanding them helps you decide where to split code and place responsibilities when requirements change, rather than merely making code look more advanced.
