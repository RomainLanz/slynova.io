---
title: 'Create a Simple Cache System'
date: '2019-02-22T10:00:00+0100'
---

One of the simplest optimization you can do to speed up your application is to use a cache to avoid heavy data computation, database queries or API calls.

The term "cache" means "_a temporary storage space or memory that allows fast access to data_" ([dictionary.com](https://www.dictionary.com/browse/cache)). In the other hands, **think about it as simple key/value store**.

There's a bunch of different cache systems. One of the most known is [Redis](https://redis.io/). It's a very good in-memory data structure store but is sometimes overkill for a small to medium size application.

Instead of relying on a third party library, we will learn how to build our own cache system.

Since ES2015, JavaScript has the [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object which is an `Object` on steroid and can easily be used for caching.

## Getting Started with a Cache

As state in the introduction, a cache is a simple key/value store - like a `Map`.

```js
const cache = new Map()
```

Our `Map` start empty, and we will fill it with data time after time.

```js
// Startup of our application...

// We create the cache and fill the key "mykey"
// with the value returned by veryIntensiveCPUFunction()
const cache = new Map()
cache.set('mykey', veryIntensiveCPUFunction())

// ...

const data = cache.has('mykey') ? cache.get('mykey') : veryIntensiveCPUFunction()
```

In this example, we are going to avoid the call to `veryIntensiveCPUFunction()` since we already runned it at the startup of our application and we stored the returned value in the cache (you may also want to take a look to the [memoization technique](https://en.wikipedia.org/wiki/Memoization)).

## Creating a Real Example

Let's get further by creating a Node.js HTTP server:

```js
// index.js
const http = require('http')

http
  .createServer((res, req) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello World')
  })
  .listen(8080)

console.log('Listening on port 8080')
```

When we run the file using `node index.js` you will see `Listening on port 8080` but the code will never exit.

**Node will keep running** and will wait for any request on port 8080. This means **everything we do will be kept in memory**!

Let's add some code to slow down our server.

```js{8-11}
// index.js
const http = require('http')
const { sleep } = require('sleep') // https://www.npmjs.com/package/sleep
const cache = new Map()

http
  .createServer((req, res) => {
    if (!cache.has('alreadyRunned')) {
      sleep(1)
      cache.set('alreadyRunned', true)
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello World')
  })
  .listen(8080)

console.log('Listening on port 8080')
```

Open your browser and hit `localhost:8080` the request will takes ~1 second to display `Hello World`. Then, if you refresh the page it should be instant because we never reach the slow code.

When we decompose this code, here's what happen:

1. We create our cache (`cache`);
2. We create a Node server listening on port 8080;
3. When we hit our server, we check if `alreadyRunned` is in the cache;
   - It's not in the cache: wait 1 second and set `alreadyRunned` to true;
   - It's in the cache: go ahead.

## Moving to an Adonis Application

Now that we saw the basic of an in-memory cache system in Node.js, we are going to optimize an Adonis application.

We are going to use the [Adonis Blog Demo](https://github.com/adonisjs/adonis-blog-demo):

```bash
> npx degit https://github.com/adonisjs/adonis-blog-demo adonis-blog-demo
> cd adonis-blog-demo
> cp .env.example .env
> npm i
> adonis migration:run
> adonis bundle
> adonis serve --dev
```

Let's also add the `sleep` package to slow down our application.

```bash
> npm i sleep
```

Start by creating the file `app/Cache.js` and write the following content:

```js
// app/Cache.js
module.exports = new Map()
```

Then, open the `PostController`, require `sleep` and our `cache`:

```js
'use strict'
// ...
const { sleep } = require('sleep')
const Cache = use('App/Cache')
// ...
```

We are going to cache our posts:

```js
async index ({ view }) {
  if (!Cache.has('posts')) {
    const posts = await Post.all()
    sleep(3) // Faking long running queries
    Cache.set('posts', posts.toJSON())
  }

  return view.render('posts.index', { posts: Cache.get('posts') })
}
```

In this code we are doing exactly the same as in the example.

1. Checking if the key `posts` is polulated in the cache;
2. If not, fecthing the posts and polulating the cache;
3. Send back the cached posts.

The first time you will reach `/` your request will take ~3 seconds to run. All the next request we never be slow.

We speed up our blog but **we also added an undesired behaviour**. Since we aren't clearing the cache when storing a post, the new post will never be displayed on our website.

You can fix this by clearing the cache everytime a new post is written (you will need also to clear the cache in other methods like `update` or `destroy`).

```js{6}
// PostController.js
async store ({ session, request, response }) {
  // ...

  await Post.create(data)
  Cache.delete('posts')

  return response.redirect('/')
}
```

## Using Timestamp to Automate Cache Clearing

In the last example, we decide when the cache should be cleared. We can also automate that using a timestamp and the desired lifetime of our cache.

We used this technique in the [Lausanne-Sport eSports WS](https://github.com/Lausanne-eSports/api.els.team) to avoid querying to much the [Twitch API](https://dev.twitch.tv).

Let's assume we need data from a third party API and we are limited to 60 queries per hour. This means we need to keep in the cache the data for at least one minute between each call.

```js{9}
const got = require('got') // https://www.npmjs.com/package/got
const Cache = use('App/Cache')

// ...

if (!Cache.has('example.users')) {
  const response = await got('https://api.example.com/users')

  Cache.set('example.users', [response.body, Date.now()])
}
```

In this code, we added an array as the value of our cache. It contains the response body and a timestamp for when the cache has been hydrated.

When we will read the cache, we will also check if the lifetime of the cache is more than a minute.

```js{6}
// requires...

if (Cache.has('example.users')) {
  const [users, timestamp] = Cache.get('example.users')

  if ((Date.now() - timestamp) / 1000 <= 60) {
    // Cache is still valid
    return users
  }
}
```

At the line 6, we check if the data has been cached for less than 60 seconds, if that's the case, we can return the cached data.

## Going Further

To make our life easier, we can wrap our cache into an object that will automate things for us.

Let's start by creating a wrapper arround our cache.

```js
// app/Cache.js
const cache = new Map()

module.exports = {
  has(key) {
    return cache.has(key)
  },

  set(key, value) {
    return cache.set(key, [value, Date.now()])
  },

  get(key) {
    return cache.get(key)[0]
  },

  delete(key) {
    return cache.delete(key)
  },

  clear() {
    return cache.clear()
  },
}
```

Now, the cache will automatically add the timestamp to any value set. The last thing we need to do is to create another helper called `isExpired`.

```js
// app/Cache.js
module.exports = {
  // ...
  isExpired(key, seconds) {
    const [_, timestamp] = cache.get(key)

    return (Date.now() - timestamp) / 1000 > seconds
  },
  // ...
}
```

With this code, we can now update our example.

```js
const got = require('got') // https://www.npmjs.com/package/got
const Cache = use('App/Cache')

// ...

if (!Cache.has('example.users') || Cache.isExpired('example.users', 60)) {
  const response = await got('https://api.example.com/users')

  Cache.set('example.users', response.body)
}

return Cache.get('example.users')
```
