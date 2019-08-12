---
title: Why & How to Make the Heaviest Resource in the Web Lighter?
date: 2019-08-12
published: true
cover_image: false
tags: ['JavaScript', 'WebPerf']
description: "JavaScript is one of the heaviest resources on the web. The reason is that your code is not only downloaded by the browser, but it must also be parsed and executed. This is why a 100kBB image isn't equal to a 100kB JavaScript file."
---

JavaScript is one of the heaviest resources on the web. The reason is that your code is not only downloaded by the browser, but it must also be parsed and executed. This is why a 100kBB image isn't equal to a 100kB JavaScript file.

Have you ever visited a website where you were unable to interact for a few seconds even when it was fully displayed? Parsing and executing JavaScript has a cost that can make you lost customers, money, and traffic.

> 53% of users will leave a mobile site if it takes more than 3 secs to load. [[Source](https://gs.statcounter.com/press/mobile-and-tablet-internet-usage-exceeds-desktop-for-first-time-worldwide)]

In this article, you learn how to make your website faster by simply analyzing the JavaScript you sent and reducing the size of it.

We are going to focus ourself on how to keep your "bundle" size reasonable. I'm not going to dive deep into how the JavaScript engine parses and executes your code. If you want to learn more about that, there's a course on FrontendMaster called [Web Performance](https://frontendmasters.com/courses/web-performance) by Steve Kinney and the article [The Cost Of JavaScript In 2019](https://v8.dev/blog/cost-of-javascript-2019) by Addy Osmani.

# Bundling Your Code

It can seem obvious nowadays to "bundle" your JavaScript with a tool like [Webpack](https://webpack.js.org), [Rollup](https://rollupjs.org) or even [Parcel](https://parceljs.org/), but a lot of developers don't know about this practice.

When you bundle your JavaScript code, you are taking all your code and all its dependencies and write them in **one** file.

This could easily create more issue than it solves if you are not using it carefully. Have you ever figured out that you were bundling a whole library of ~1mB for one icon?

This is why you need to analyze your bundle. When you do it, you can easily verify that all third-party packages included are *really* needed for your application.

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)

![An analyzed bundle](https://i.imgur.com/n1CwDiQ.png)

After analyzing your bundle you have multiple possibilities to reduce to the size of it without modifying your code.

## Tree-Shaking

One of the easiest ways to do so is by using the technique called "Tree-Shaking".

It consists of eliminating dead-code. In other words, unused modules will not be included in your final bundle.

We can use the library `lodash` as an example. Quite often, you require this library to use only one, two or maybe three functions of it. But when bundling the code, you are packing the whole package ([24.3
kB minified + gziped](https://bundlephobia.com/result?p=lodash@4.17.15)) while you only use ~1kB of it.

Selecting Tree-Shakable library and activating the Tree-Shaking settings on your bundler can easily make you won hundreds of kB of dead-code.

I actively use [BundlePhobia](https://bundlephobia.com) to verify each dependency I install. I'm also using the plugin [Import Cost for VSCode](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) that gives me the size of my imports.

![Example of Import Cost](https://file-wkbcnlcvbn.now.sh/import-cost.gif)

## Code Splitting

The second action you can do with a bundler to make your bundle lighter is called "Code Splitting".

This works by splitting your actual bundle into multiple bundles that will be loaded on demand by your application. This is useful to control the resource load prioritization.

You may have a WYSIWYG editor on your article creation page. This editor is only useful on that page but people reading your article will still retrieve the code, parse it and execute it if you don't use code splitting.

While on the other side, if you activate code splitting, you will only fetch the WYSIWYG editor code when you visit your article creation page.

Using this technique can drastically improve the first loading time of your application by only requesting critical assets and lazy-loading the other one.

This most common place to do code splitting is on your router. Doing so will let the client only download the code he needs for its current page.

```js
// Example using the VueRouter
[
  {
    path: '/',
    name: 'Dashboard',
    component: () =>
      import(/* webpackChunkName: "dashboard" */ '@/views/DashboardView.vue'),
    meta: {
      middleware: ['auth'],
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "login" */ '@/views/LoginView.vue'),
    meta: {
      middleware: ['guest'],
    },
  },
  ...
]
```

# Search for Lighter Alternative

When reaching for external packages, we often stop our research when we found something that fulfills our needs. But keep in mind that there's probably a dozen of packages that satisfy your needs, and some of them are lighter than the others.

We finally have [Optional Chaining](https://github.com/tc39/proposal-optional-chaining) in the spec but how did you manage to do something similar before?

I personally reached for the `Lodash#get` function ([1.8kB minified + gziped](https://bundlephobia.com/result?p=lodash.get@4.4.2)) back then. Later I discovered the package `dlv` ([191B minified + gziped](https://bundlephobia.com/result?p=dlv@1.1.3)).

In this example I have a small win, but if you multiply those you can easily remove dozen or even hundreds of kB in your bundle.

Have you ever heard of laue ([10.7kB minified + gziped](https://bundlephobia.com/result?p=laue@0.2.1))? It's a great Vue library to make SVG charts. When you compare it to Chart.js ([112.1kB minified + gziped](https://bundlephobia.com/result?p=chart.js@2.8.0)) or ApexCharts ([108.3kB minified + gziped](https://bundlephobia.com/result?p=apexcharts@3.8.4)) you see a real difference.

# Ensure the Library X is needed

Quite often I found myself reaching for a third-party library while I did not need for one.

How many times you wanted to have something which isn't "common" and instead of building yours you decided to search for a library that does it for you?

Take notes that this is perfectly fine for some use-cases but you need to be careful about the impact that this third-party library will have on your code and your bundle size.

Lately, on one of my application, I wanted to have a fuzzy search system. The first thing I did was looking for a package that can do it for me. This is where I encounter `fuse.js` ([3.9 kb minified + gziped](https://bundlephobia.com/result?p=fuse.js@3.4.5)) and installed it without thinking about the size of it.

In fact, `fuse.js` is great, but it also handles many use-cases that I'll never need. I ended up using a custom code (stolen on [StackOverflow](https://stackoverflow.com/a/15252131/3380679)) that can handle **my** use case and is way lighter.

```js
function fuzzy (text, search) {
  let hay = text.toLowerCase(),
    i = 0,
    n = -1,
    l;

  const s = search.toLowerCase();
  while ((l = s[i++])) if (!~(n = hay.indexOf(l, n + 1))) return false;
  return true;
}
```

Another example is the library you use for AJAX request. I regularly see people using `axios` ([4.3 kB minified + gziped](https://bundlephobia.com/result?p=axios@0.19.0)). The thing is, they could simply use the built-in [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) because they don't need the extra features that `axios` brings.

# Conclusion

It can be very easy to send megabytes of JavaScript to your clients if you're not careful. Remember that you are testing your website on your developer machine with a good Internet connection while your client may have a poor smartphone with a 2G connection.

> 71% of mobile connections occur via 2G and 3G in 2018. [[Source](https://www.gsma.com/r/mobileeconomy/)]

Ensure that your website works on those devices by testing it with services like [web.dev](https://web.dev/) or [WebPageTest](http://webpagetest.org/).

Those sites can give you a pretty good recommendation to increase the speed of your application and make the overall user experience better.

![web.dev Report](https://i.imgur.com/NhQidkm.png)

# Further reading
- [Web Performance](https://frontendmasters.com/courses/web-performance)
- [Progressive Web Applications and Offline](https://frontendmasters.com/courses/progressive-web-apps/)
- [The Cost Of JavaScript](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e)
- [The Cost Of JavaScript In 2018](https://medium.com/@addyosmani/the-cost-of-javascript-in-2018-7d8950fbb5d4)
- [The Cost Of JavaScript In 2019](https://v8.dev/blog/cost-of-javascript-2019)
- [Can You Afford It?: Real-world Web Performance Budgets](https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/)
- [Performance budgets 101](https://web.dev/performance-budgets-101/)
- [Remove unused code](https://web.dev/remove-unused-code/)

# Credits
- Header Photo by Allef Vinicius on Unsplash
