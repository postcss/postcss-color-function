/**
 * Module dependencies.
 */
var postcss = require("postcss")
var parser = require("postcss-value-parser")
var colorFn = require("css-color-function")
var helpers = require("postcss-message-helpers")

/**
 * PostCSS plugin to transform color()
 */
module.exports = postcss.plugin("postcss-color-function", function() {
  return function(style, result) {
    style.walkDecls(function transformDecl(decl) {
      if (!decl.value || decl.value.indexOf("color(") === -1) {
        return
      }

      try {
        decl.value = helpers.try(function transformColorValue() {
          return transformColor(decl.value)
        }, decl.source)
      } catch (error) {
        decl.warn(result, error.message, {
          word: decl.value,
          index: decl.index,
        })
      }
    })
  }
})

/**
 * Transform color() to rgb()
 *
 * @param  {String} string declaration value
 * @return {String}        converted declaration value to rgba()
 */
function transformColor(string) {
  return parser(string).walk(function(node) {
    if (node.type !== "function" || node.value !== "color") {
      return
    }

    node.value = colorFn.convert(parser.stringify(node))
    node.type = "word"
  }).toString()
}
