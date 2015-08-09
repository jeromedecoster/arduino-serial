const serial = require('../')
const debug = require('../debug')('test')


// serial.start()
// serial.start({baudrate:50})
serial.start({ping:true})
// serial.start({ping:true, ignore:true})
// serial.start({ping:true, sketch:'ping'})
// serial.start({ping:true, ignore:true, sketch:'ping'})
// serial.start({ping:true, ignore:true, sketch:'wrong'})
// serial.start({ping:true, sketch:'wrong'})


serial.on('connect', function (path) {
  debug('on connect', path)
})

serial.on('error', function (error) {
  debug('on error', debug.red(error))
})

serial.on('disconnect', function() {
  debug('on disconnect')
})

serial.on('open', function (serialport) {
  debug('on open', serialport != undefined)
})

serial.on('ping', function (sketch) {
  debug('on ping', debug.green(sketch))
})

serial.on('data', function (data) {
  debug('on data', data)
})
