var fs = require("fs")

var test = require("tape")

var postcss = require("postcss")
var plugin = require("..")

function filename(name) { return "test/" + name + ".css" }
function read(name) { return fs.readFileSync(name, "utf8") }

function compareFixtures(t, name, msg, opts, postcssOpts) {
  postcssOpts = postcssOpts || {}
  postcssOpts.from = filename("fixtures/" + name)
  opts = opts || {}
  var actual = postcss().use(plugin(opts)).process(read(postcssOpts.from), postcssOpts).css
  var expected = read(filename("fixtures/" + name + ".expected"))
  fs.writeFile(filename("fixtures/" + name + ".actual"), actual)
  t.equal(actual, expected, msg)
}

test("color()", function(t) {
  compareFixtures(t, "color", "should transform color()")
  t.end()
})

test("logs warning when color() value cannot be parsed", function(t) {
  postcss(plugin()).process(read(filename("fixtures/error")))
    .then(function(result) {
      var warnings = result.warnings();
      t.equals(warnings.length, 1, "expected only 1 warning");

      var warning = warnings[0]
      t.equals(
        warning.plugin,
        "postcss-color-function",
        "expected `warning.plugin` to match this plugin's name"
      )

      t.equals(
        warning.word,
        "color(blurp a(+10%))",
        "expected `warning.word` to match color() declaration"
      )

      t.equals(
        warning.text,
        "<css input>:2:3: Unable to parse color from string \"blurp\"",
        "expected `warning.text` to contain a readable error when a color can't be parsed"
      )

      t.end()
    })
})
