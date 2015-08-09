const serialport = require('serialport')
const assign = require('object-assign')
const emitter = new (require('eventemitter3'))
const debug = require('./debug')('serial')


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
var path
var serial
var time
var ping
var options = {
  baudrate: 9600,
  ping: false,
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
  debug('check')
  serialport.list(function (err, ports) {
    var result = ports
      .filter(function (o) { return /arduino/i.test(o.manufacturer) })
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
    if (!result) setTimeout(check, 100)
  })
}

function onconnect () {
  ping = options.ping

  serial = new serialport.SerialPort(path, {
    baudrate: options.baudrate,
    parser: serialport.parsers.readline('\n')
  })

  serial.on('open', function () {
    setTimeout(function () {
      emitter.emit('open', serial)
      onopen()
    }, 20) // prevents data flood at startup
  })
}

function onopen () {
  debug('onopen')

  if (ping) {
    time = Date.now()
    sendping()
  }

  serial.on('data', function (data) {
    data = data.trim()
    if (ping && /^sketch:/.test(data)) {
      onsketch(data)
    } else {
      if (!options.ping   // no ping requested
      ||  !options.ignore // ping resquested but don't ignore incoming data
      ||  !ping) {        // ping resquested, ignore incoming data before ping and ping done
        emitter.emit('data', data)
      }
    }
  })

  serial.on('error', check)
  serial.on('close', check)
}

function onsketch (data) {
  debug('onsketch', data)
  ping = false
  var sketch = data.substr(7)
  if (options.sketch) {
    if (sketch != options.sketch) {
      serial.pause()
      var err = new Error('sketch `' + sketch + '` insteadof `' + options.sketch + '`')
      err.name = 'SketchError'
      emitter.emit('error', err)
      return
   }
  }
  emitter.emit('ping', sketch)
}

function sendping () {
  if (ping) {
    debug('send ping')
    serial.write('ping')
    if (Date.now() - time > 4000) {
      debug(debug.red('ping timeout error'))
      serial.pause()
      var err = new Error('ping without response')
      err.name = 'TimeoutError'
      emitter.emit('error', err)
    } else {
      setTimeout(sendping, 100)
    }
  }
}
