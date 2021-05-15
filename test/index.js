var fs = require("fs")

var test = require("tape")

var postcss = require("postcss")
var plugin = require("..")

function filename(name) {
  return "test/" + name + ".css"
}

function read(name) {
  return fs.readFileSync(name, "utf8")
}

function compareFixtures(t, name, msg, opts, postcssOpts) {
  postcssOpts = postcssOpts || {}
  postcssOpts.from = filename("fixtures/" + name)
  opts = opts || {}
  var actual = postcss().use(plugin(opts))
    .process(read(postcssOpts.from), postcssOpts).css
  var expected = read(filename("fixtures/" + name + ".expected"))
  fs.writeFileSync(filename("fixtures/" + name + ".actual"), actual)
  t.equal(actual, expected, msg)
}

test("color()", function(t) {
  compareFixtures(t, "color", "should transform color()")
  t.end()
})

test("logs warning when color() value cannot be parsed", function(t) {
  postcss(plugin()).process(read(filename("fixtures/error")), {from: undefined})
    .then(function(result) {
      var warnings = result.warnings()
      t.equals(warnings.length, 1, "expected only 1 warning")

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
        "expected `warning.text` to contain a readable error " +
        "when a color can't be parsed"
      )

      t.end()
    })
})

test("logs message when color() contains var() custom property", function(t) {
  postcss(plugin()).process(
    read(filename("fixtures/color-with-custom-properties")), {from: undefined}
  ).then(function(result) {
    var expectedWords = [
      "color(var(--red))",
      "color(var(--red) tint(50%))",
      "color(var(--red) tint(var(--tintPercent)))",
      "color(rgb(255, 0, 0) tint(var(--tintPercent)))",
    ]

    t.equal(
      result.messages.length,
      expectedWords.length,
      "expected a message every time a color function is skipped"
    )

    result.messages.forEach(function(message, i) {
      t.equal(
        message.type,
        "skipped-color-function-with-custom-property",
        "expected `message.type` to indicate reason for message"
      )

      t.equal(
        message.plugin,
        "postcss-color-function",
        "expected `message.plugin` to match this plugin's name"
      )

      t.equal(
        message.word,
        expectedWords[i],
        "expected `message.word` to contain declaration value"
      )

      t.equal(
        message.message,
        "Skipped color function with custom property " +
        "`" + expectedWords[i] + "`",
        "expected `message.message` to contain reason for message"
      )
    })

    t.end()
  })
})

test(
  "test delete custom properties with option preserveCustomProps `false`", 
  function(t) {
    postcss(plugin({preserveCustomProps : false})).process(
      read(filename("fixtures/delete-custom-properties")),
      {from: undefined}
    ).then(function(result) {
      var expectedDeclaration = [{
        prop: "background-color",
        value: "rgb(255, 128, 128)",
      }]
      // check left rules in body after clear
      var declNodes = result.root.nodes[0].nodes
      t.equal(
        declNodes.length,
        expectedDeclaration.length,
        "expected " + expectedDeclaration.length +
        " declaration length but got " + declNodes.length
      )

      t.equal(
        declNodes[0].prop,
        expectedDeclaration[0].prop,
        "expected declaration with "+ expectedDeclaration[0].prop +
        " property but got " + declNodes[0].prop
      )

      t.equal(
        declNodes[0].value,
        expectedDeclaration[0].value,
        "expected declaration with "+ expectedDeclaration[0].value +
        " value but got " + declNodes[0].value
      )

      t.end()
    })
  }
)
