/**
 * Module dependencies.
 */
var balanced = require("balanced-match")
var colorFn = require("css-color-function")
var helpers = require("postcss-message-helpers")

/**
 * PostCSS plugin to transform color()
 */
module.exports = function plugin() {
  return function(style) {
    style.eachDecl(function transformDecl(decl) {
      if (!decl.value || decl.value.indexOf("color(") === -1) {
        return
      }

      decl.value = helpers.try(function transformColorValue() {
        return transformColor(decl.value, decl.source)
      }, decl.source)
    })
  }
}

/**
 * Transform color() to rgb()
 *
 * @param  {String} string declaration value
 * @return {String}        converted declaration value to rgba()
 */
function transformColor(string, source) {
  var index = string.indexOf("color(")
  if (index == -1) {
    return string
  }

  var fn = string.slice(index)
  var balancedMatches = balanced("(", ")", fn)
  if (!balancedMatches) {
    throw new Error("Missing closing parentheses in '" + string + "'", source)
  }

  return string.slice(0, index) + colorFn.convert("color(" + balancedMatches.body + ")") + transformColor(balancedMatches.post)
}
