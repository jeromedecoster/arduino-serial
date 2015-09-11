const serialport = require('serialport')
const assign = require('object-assign')
const emitter = new (require('eventemitter3'))
const debug = require('debug')('serial')


exports.on = function (name, cb) {
  emitter.on(name, cb);
}

exports.once = function (name, cb) {
  emitter.once(name, cb);
}

exports.off = function (name, cb) {
  emitter.off(name, cb);
}


var started
var validated
var closed
var path
var serial
var time
var send
var options = {
  baudrate: 9600,
  close: true,
  ignore: false
}


exports.start = function (opt) {
  if (started) return console.log('arduino-serial already started')
  started = true
  options = assign(options, opt)
  check()
}

/**
 * check if arduino is connected with serial
 */

function check () {
  if (closed) return
  debug('check')
  serialport.list(function (err, ports) {
    var result = ports
      .filter(function (o) {
        return /arduino/i.test(o.manufacturer)
            || /cu\.wchusbserial/i.test(o.comName)
      })
      .map(function (o) { return o.comName })
      .shift() || null

    if (result !== path) {
      if (path) emitter.emit('disconnect')
      path = result
      if (path) {
        emitter.emit('connect', path)
        onconnect()
      }
    }
    if (!result) setTimeout(check, 250)
  })
}

function onconnect () {
  send = options.sketch != undefined

  serial = new serialport.SerialPort(path, {
    baudrate: options.baudrate,
    parser: serialport.parsers.readline('\n')
  })

  serial.on('open', function () {
    // 50 milliseconds timeout to prevents data flood at startup, works good if
    // arduino baudrate is at least 9600
    // arduino loop function starts with a 50 milliseconds delay
    setTimeout(function () {
      emitter.emit('open', serial)
      onopen()
    }, 50)
  })
}

function onopen () {
  debug('onopen')

  if (send) {
    time = Date.now()
    sendsketch()
  }

  serial.on('data', function (data) {
    data = data.trim()

    if (send && /^sketch:/.test(data)) {
      onsketch(data)
    } else {
      if (!options.sketch        // no sketch requested
      ||  !options.ignore        // sketch resquested + don't ignore incoming data before sketch response
      || (!send && validated)) { // sketch resquested + ignore incoming data + validated sketch response received
        emitter.emit('data', data)
      }
    }
  })

  serial.on('error', check)
  serial.on('close', check)
}

function onsketch (data) {
  debug('onsketch', data)
  send = false
  var sketch = data.substr(7)
  emitter.emit('sketch', sketch)
  if (sketch != options.sketch) {
    validated = false
    var err = new Error('sketch `' + sketch + '` insteadof `' + options.sketch + '`')
    err.name = 'SketchError'
    if (options.close) {
      closed = true
      serial.pause()
      serial.close(function() {
        emitter.emit('error', err)
      })
    } else {
      emitter.emit('error', err)
    }
  } else {
    validated = true
  }
}

function sendsketch () {
  if (!serial.isOpen()) return
  if (send) {
    debug('sendsketch')
    serial.write('sketch')
    if (Date.now() - time > 4000) {
      debug.red('sendsketch timeout error')
      var err = new Error('sketch request without response')
      err.name = 'TimeoutError'
      if (options.close) {
        closed = true
        serial.pause()
        serial.close(function() {
          emitter.emit('error', err)
        })
      } else {
        emitter.emit('error', err)
      }
    } else {
      setTimeout(sendsketch, 250)
    }
  }
}
