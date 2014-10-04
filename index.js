/**
 * Module dependencies.
 */
var balanced = require("balanced-match")
var colorFn = require("css-color-function")

/**
 * PostCSS plugin to transform color()
 */
module.exports = function plugin() {
  return function(style) {
    style.eachDecl(function transformDecl(dec) {
      if (!dec.value) {
        return
      }

      dec.value = transform(dec.value, dec.source)
    })
  }
}

/**
 * Transform colors to rgb() or rgba() on a declaration value
 *
 * @param {String} string
 * @return {String}
 */
function transform(string, source) {
  // order of transformation is important

  try {
    if (string.indexOf("color(") > -1) {
      string = transformColor(string, source)
    }
  }
  catch (e) {
    throw new Error(gnuMessage(e.message, source))
  }

  return string
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
    throw new SyntaxError(gnuMessage("Missing closing parentheses in '" + string + "'", source))
  }

  return string.slice(0, index) + colorFn.convert("color(" + balancedMatches.body + ")") + transformColor(balancedMatches.post)
}


/**
 * return GNU style message
 *
 * @param {String} message
 * @param {Object} source
 */
function gnuMessage(message, source) {
  return (source ? (source.file ? source.file : "<css input>") + ":" + source.start.line + ":" + source.start.column : "") + " " + message
}
