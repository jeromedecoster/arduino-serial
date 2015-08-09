// https://github.com/chalk/ansi-regex
const re = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

module.exports = function (namespace) {

  const enabled = process.env.DEBUG &&
    process.env.DEBUG.split(',')
    .filter(function (e) { return e == '*' || e == namespace }).length

  var fn = function () {
    if (!enabled) return
    var d = new Date()
    var t = pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' + pad(d.getMilliseconds(), true)
    t = fn.yellow(t) + ' ' + fn.cyan(namespace)
    var a = Array.prototype.slice.call(arguments).map(function(e, i) {
      // skip color if already has ansi
      if (i == 0 || re.test(e)) return e
      if (i == 1) return fn.pink(e)
      if (i == 2) return fn.blue(e)
      if (i == 3) return fn.green(e)
      if (i == 4) return fn.gray(e)
      return e
    })

    console.log.apply(null, [t].concat(a))
  }

  fn.black   = function (str) { return '\u001b[30m' + strip(str) + '\u001b[39m' }
  fn.red     = function (str) { return '\u001b[31m' + strip(str) + '\u001b[39m' }
  fn.green   = function (str) { return '\u001b[32m' + strip(str) + '\u001b[39m' }
  fn.yellow  = function (str) { return '\u001b[33m' + strip(str) + '\u001b[39m' }
  fn.blue    = function (str) { return '\u001b[34m' + strip(str) + '\u001b[39m' }
  fn.magenta = function (str) { return '\u001b[35m' + strip(str) + '\u001b[39m' }
  fn.cyan    = function (str) { return '\u001b[36m' + strip(str) + '\u001b[39m' }
  fn.white   = function (str) { return '\u001b[37m' + strip(str) + '\u001b[39m' }
  fn.gray    = function (str) { return '\u001b[90m' + strip(str) + '\u001b[39m' }
  fn.pink    = fn.magenta
  fn.grey    = fn.gray

  return fn
}

function pad (value, three) {
  value = String(value)
  var lng = three == true ? 3 : 2
  while (value.length < lng)
    value = '0' + value
  return value
}

function strip (str) {
  return typeof str == 'string' ? str.replace(re, '') : str
}
