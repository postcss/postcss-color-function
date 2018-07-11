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
module.exports = postcss.plugin("postcss-color-function", function(opts) {
  const options = Object.assign({
    mediaQueries: false
  }, opts);  
  
  return function(style, result) {
    style.walk(function transformDecl(node) {
      const { type } = node;
      let prop;

      if (type === 'decl') prop = "value";
      if (type === 'atrule' && options.mediaQueries) prop = "params";
      
      if (!prop) return;
      
      const value = node[prop];
      if (!value || value.indexOf("color(") === -1) {
        return
      }

      if (value.indexOf("var(") !== -1) {
        result.messages.push({
          plugin: "postcss-color-function",
          type: "skipped-color-function-with-custom-property",
          word: value,
          message:
            "Skipped color function with custom property `" +
            value +
            "`",
        })
        return
      }

      try {
        node[prop] = helpers.try(function transformColorValue() {
          return transformColor(value)
        }, node.source)
      }
      catch (error) {
        node.warn(result, error.message, {
          word: value,
          index: node.index,
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
