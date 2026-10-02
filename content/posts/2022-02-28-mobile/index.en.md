---
title: "Adapting Layouts for Mobile Devices"
header-img: imgs/head.jpg
catalog: true
date: 2022-02-28 16:23:17
subtitle: CSS
tags:
  - CSS
  - JS
categories:
  - CSS
translation-status: published
---

## Adapting layouts for mobile devices

### Introduction

Mobile devices come in many screen sizes and pixel densities, including 1x, 2x, and 3x screens. This challenges frontend layouts across devices. Ideally, elements and text would scale proportionally with the screen and preserve the intended appearance. This article discusses approaches to mobile adaptation.

### Basic concepts

#### Screen size

**The length of the screen's diagonal.** One inch equals 2.54 cm, so a 5-inch phone has a diagonal of `5 X 2.54 = 12.7` cm.

#### Resolution

The **number of pixels** on a screen. A resolution of `320 * 480`, for example, means the screen contains `320 X 480` pixels.

#### px(pixels)

`1px = 1inch * 1/96` at a viewing distance of about one arm's length, or 20 inches. px is a common unit in web development. A physical pixel's size varies with resolution: on screens of equal size, higher resolution means smaller pixels, and lower resolution means larger ones.

#### pt(point)

A standard unit of length: `1pt = 1 / 72 inch`. It is used in iOS development and printing, and corresponds to a physically measurable length.

#### ppi(pixels per inch)

Pixel density: **the number of device pixels per inch**. Higher ppi means higher resolution and more detail. The formula is $\frac{\sqrt{(W^2+H^2)}}{S}$, where W and H are the resolution's width and height and S is the screen's diagonal size.

#### dpi(dot per inch)

Similar to ppi, dpi measures the number of printed dots per inch. A higher value produces finer detail.

#### dip(device independent pixels)

dp means **device-independent pixels**, also called logical or density-independent pixels. This logical unit preserves a consistent logical size regardless of how graphics scale on the screen. Different systems and coordinate spaces define their own device-independent pixels.

#### dpr(devicePixelRatio)

**The ratio of physical device pixels to device-independent pixels:** $dpr =\frac{physical\ pixels}{CSS\ pixels}$. It describes how many physical pixels render one CSS pixel at the ideal layout width. Higher dpr means more device pixels per unit of screen area and finer detail.

### Retrieving these values

1. Screen width in device-independent pixels

```js
const dipWidth = screen.width;
```

2. Screen width in device-independent pixels

```js
const dipHight = screen.height;
```

3. dpr

```js
const dpr = window.devicePixelRatio;
```

4. Width in physical pixels

```js
const physicalWidth = dipWidth \* dpr;
```

In CSS, use `-webkit-device-pixel-ratio`, `-webkit-min-device-pixel-ratio`, and `-webkit-max-device-pixel-ratio` in media queries.

5. Height in physical pixels

```js
const physicalHight = dipHeight * dpr;
```

### Viewports

Mobile layouts involve the **layout viewport, visual viewport, and ideal viewport**.

- **Layout viewport:** used to lay out the page. Think of it as the top-level container above the html element. By default, or when html has width 100%, html fills this container. `document.documentElement.clientWidth` returns its layout width. The max-width and min-width values in media queries also refer to this width. This is the logical viewport used for layout rather than the portion currently visible during zooming or scrolling.

> The layout viewport is not the entire page's content. It is the logical viewport used to adapt content to a phone's screen. Its height is not necessarily the page's full height, and position: fixed is positioned relative to it.

- **Visual viewport:** the currently visible area of content. Scrolling, rotating, and zooming affect this viewport.

> Scrolling moves its coordinates; zooming changes its width and height; rotating changes the relationship between its width and height.

- **Ideal viewport:** the layout viewport best suited to the device, allowing the page to fit without user zooming. The simplest approach sets the layout width to the device width with `<meta name = "viewport" content = "width = device-width, initial-scale = 1.0">`.

### The `<meta>` tag

`<meta>` defines metadata. Setting `<meta name = "viewport">` supplies initial viewport sizing information for mobile devices. Available attributes include:

| Attribute | Value | Description |
| --------------- | ---------------------- | ------------------------------------ |
| `width` | Number / `device-width` | Viewport width |
| `height` | Number / `device-height` | Viewport height |
| `initial-scale` | 0.0 ~ 10.0 | Initial scale between device width and viewport size |
| `maximum-scale` | 0.0 ~ 10.0 | Maximum zoom scale |
| `minimum-scale` | 0.0 ~ 10.0 | Minimum zoom scale |
| `user-scalable` | Boolean | Whether the page can be zoomed; default `yes / 1` |

### Adaptation approaches

#### Media queries: @media

`@media` queries define different styles for different resolutions, especially the large differences between desktop, tablet, and phone screens. They support more than proportional scaling, but accommodating many devices requires substantial work, and abrupt breakpoint changes can affect the experience.

```css
// 屏幕可视窗口尺寸小于 480 像素时 font-size: 16px
@media screen and (max-width: 480px) {
  html {
    font-size: 16px;
  }
}
// 屏幕可视窗口尺寸大于 480 像素时 font-size: 24px;
@media screen and (min-width: 480px) {
  html {
    font-size: 24px;
  }
}
```

#### vw、vh、vmin、vmax

`vw`, `vh`, `vmin`, and `vmax` are viewport-relative units. `vw` means viewport width: 1vw equals 1% of the visible area's width. `vh` means viewport height: 1vh equals 1% of its height. `vmin` is the smaller of vw and vh, and `vmax` is the larger. Elements scale with the viewport using CSS alone, without scripts. Compatibility was limited below Android 4.4 and iOS 8.

#### rem

`rem` is relative to the computed font-size of the root html element. Using rem produces flexible layouts, but implementations that adjust the root font size through JavaScript couple CSS to a script listening for resolution changes. That script must run before the styles. Calculations may also produce fractional pixels, which browsers round for rendering. To manage **fractional pixels**, configure a minimum conversion size and leave very small pixel values unconverted to rem or vw.

```js
document.documentElement.style.fontSize =
  document.documentElement.clientWidth / 750 + "px";
```

> Changing font-size through @media or using vw/vh for it also changes the rem-based lengths described above.

#### Automatically converting px to vw

Designers often provide a 750px-wide mockup. A vw layout requires converting each element's px size to vw, which slows development and complicates maintenance if done manually. The [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport) plugin automates that conversion.

### Common adaptation issues

1. **The 1px issue:** a designer's 1px may mean one physical device pixel. Setting 1px in CSS produces two physical pixels at dpr = 2 and three at dpr = 3. Designs requiring a true one-device-pixel line need special handling.

```css
// 解决方案，使用 transform: scale(0.5) + :before / :after
.calss {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    border-top: 1px solid #666;
    transform: scaleY(0.5);
  }
}
```

2. **High-resolution images:** images intended for standard-density screens can look blurry on high-density screens. Conversely, high-density images shown on standard screens may lose visible detail and waste bandwidth.

```css
/* 解决方案，对不同 dpr 屏幕使用不同 image 图片 */
[data-dpr="1"] .class {
  background-image: url(image@1x.jpg);
}
[data-dpr="2"] .class {
  background-image: url(image@2x.jpg);
}

[data-dpr="3"] .class {
  background-image: url(image@3x.jpg);
}
```
