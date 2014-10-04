# postcss-color-function [![Build Status](https://travis-ci.org/postcss/postcss-color-function.png)](https://travis-ci.org/postcss/postcss-color-function)

> [PostCSS](https://github.com/postcss/postcss) plugin to transform [W3C CSS color function](http://dev.w3.org/csswg/css-color/#modifying-colors) to more compatible CSS.

## Installation

```bash
$ npm install postcss-color-function
```

## Usage

```js
// dependencies
var fs = require("fs")
var postcss = require("postcss")
var colorFunction = require("postcss-color-function")

// css to be processed
var css = fs.readFileSync("input.css", "utf8")

// process css
var output = postcss()
  .use(colorFunction())
  .process(css)
  .css
```

Using this `input.css`:

```css
body {
  background: color(red a(90%))
}

```

you will get:

```css
body {
  background: rgba(255, 0, 0, 0.9)
}
```

Checkout [tests](test) for more examples.

---

## Contributing

Work on a branch, install dev-dependencies, respect coding style & run tests before submitting a bug fix or a feature.

    $ git clone https://github.com/postcss/postcss-color-function.git
    $ git checkout -b patch-1
    $ npm install
    $ npm test

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
