---
title: GSAP学习
header-img: img/greensock/head.jpg
catalog: true
date: 2022-9-18 21:23:39
subtitle: 了解“地球最强”的动画“框架”
tags:
  - CSS
categories:
  - CSS
---

## 技术调研：GSAP

### 前言

前段时间，原神3.1版本更新，上线看了下有个领原石的活动页
进入页面挺好奇是怎么实现的，于是调研、分享一下～
...

### 效果

（h5）
 [绘忆星辰](https://webstatic.mihoyo.com/ys/event/e20220928review_data/index.html?game_biz=hk4e_cn&mhy_presentation_style=fullscreen&mhy_auth_required=true&mhy_landscape=true&mhy_hide_status_bar=true&utm_source=mkt&utm_medium=weibo&utm_campaign=arti)

![effect](../img/greensock/effect.jpg)

### 分析

简单了解一下抓包看了下，这个活动包括了很多图片素材和骨骼等参数，除了固定动画用了`spine`，其余效果在动画库中有一个叫`GSAP (GreenSock Animation Platform)`可以大致实现这样的效果

### 介绍

动画领域有一个比较知名的CSS库：`Animate.css`，它提供了60多种动画，满足一般网页的需求，比如淡入淡出、闪现等等一系列日常动画，不过虽然它能满足日常需求，但是一些复杂的场景就需要靠JS手动去操作，比如界面滚动到某个元素才开始播放动画，比如拖拽、比如滚动界面时，动态调整元素。

如果自己要手动实现这个需求，其实也不难，只需要监听页面滚动，当要滚动到该元素时，动态添加已经设置好动画的`CSS`类名，或者直接使用JS动态添加动画。
但自己实现会存在一些响应式界面造成元素高度不一致带来的兼容性问题，所以这个时候使用已经成熟的第三方动画框架就是最好的选择。

#### 简介

**GSAP**
链接：[https://greensock.com](https://greensock.com/docs/)
`GreenSock`动画平台（GSAP）是一个业界知名的工具套件，用于1100多万个网站，其中超过50%的获奖网站。在任何框架中，你都可以使用`GSAP`来动画化`JavaScript`可以触及的任何东西。无论你想动画`UI`，`SVG`，`Three.js`或`React`组件
[yotube简介-74S](https://www.youtube.com/watch?v=RYuau0NeR1U)
特点：

1. 小的`javascript`文件
2. 消除了所有主要浏览器的兼容性问题
3. 相较于`css`动画，更易于使用
4. 自称地球上最强大动画库
5. 高性能，适用范围广

我觉得它可以称为一个动画框架，因为它的生态实在是太健全了，从简单动画，到拖拽，到滚动触发，应有尽有，几乎你能想象到的网页动画在它这里都可以实现，并且只需要使用它一个框架。

但是不知道为什么，这么厉害的东西，在国内很少有关于它的资料。我觉得它不火的原因可能是因为功能太多太复杂，往往一个界面不需要这么多动画，使用简单的Animate.css库就可以满足日常开发的需求。

#### 核心库介绍

核心库包含创建快速、跨浏览器友好的动画所需的一切
核心库的简单入门介绍：[https://greensock.com/get-started/](https://greensock.com/get-started/)

1. 方法 + 目标 + 变量组合
![example](../img/greensock/example.png)

2. 驼峰式类似`react`中的`style`（【-】 => 减号, 【20%】 => 模运算符）
3. 更精简的写法
4. 支持`css`属性，`svg`属性，对象（数组、颜色）

#### 滚动动画介绍

除了核心，还有各种插件。比如基于滚动的动画、可拖动的交互、变形等

这里主要介绍基于滚动的动画
[https://greensock.com/scrolltrigger](https://greensock.com/scrolltrigger)
VIDEO：
[https://www.youtube.com/watch?v=X7IBa7vZjmo&t=452s](https://www.youtube.com/watch?v=X7IBa7vZjmo&t=452s)

`**scrolltrigger**`

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./index.css" />
  <title>gasp</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/ScrollTrigger.min.js"></script>
</head>

<body>
  <div class="container">
    <div class="box a">a</div>
    <div class="box b">b</div>
    <div class="box c">c</div>
  </div>
  <script src="./index.js"></script>
</body>

</html>
```

```css
.container {
  display: flex;
  flex-direction: column;
  row-gap: 100vh;
}

.box {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}

.a {
  background-color: bisque;
}

.b {
  background-color: cadetblue;
}

.c {
  background-color: yellowgreen;
}
```

```javascript
// step1
// gsap.to(".a", {
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// step2: finished
// gsap.to(".c", {
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// step3: so,register pulgin scrollTrigger to top level
// gsap.registerPlugin(ScrollTrigger)
// gsap.to(".c", {
//   scrollTrigger: ".c",
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// but back it's still work down

// step4: let me talk about toggle actions
// toggleAction key words can be (play, pause, resume, reverse, restart, reset, complete, none)

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "play none none none"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "restart none none none"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "restart pause none none"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "restart pause resume none"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "restart pause reverse none"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     toggleActions: "restart pause reverse pause"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// start, markers

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",

//     // trigger element, and screen position(ex: top, center, bottom, px)
//     start: "top center",

//     // show: markers
//     markers: true,

//     // end, just like start
//     // end: "bottom 100px",

//     // relative to start
//     // end: "+=300",

//     // support a function return
//     // end: () => "+=" + document.querySelector(".b").offsetWidth,
//     toggleActions: "restart pause reverse pause"
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })

// step5: scrub

// gsap.to(".b", {
//   scrollTrigger: {
//     trigger: ".b",
//     start: "top center",
//     end: "top 100px",
//     scrub: true,
//     markers: true
//   },
//   x: 400,
//   rotation: 360,
//   duration: 3
// })
```

##### Demo

WebGL：[https://codepen.io/motionharvest/pen/WNQYJyM](https://codepen.io/motionharvest/pen/WNQYJyM)
DragSVG：[https://codepen.io/creativeocean/pen/zYrPrgd](https://codepen.io/creativeocean/pen/zYrPrgd)

### 总结

1. 通过对`GSAP`的简单学习，让我对前端的动画领域有了更进步一的认识
2. `GSAP`是一款优秀的动画库，虽然只是浅浅人门，但也能够感受出它的"强大"
3. 类似的效果展现给我的感觉比较好，不知道是否可以尝试结合我们的活动开发
