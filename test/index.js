const serial = require('../')
const debug = require('debug')('test')


serial.start()
// serial.start({baudrate:9600})
// serial.start({sketch:'good'})
// serial.start({sketch:'good', ignore:true})
// serial.start({sketch:'bad'})
// serial.start({sketch:'bad', close:false})
// serial.start({sketch:'bad', close:false, ignore:true})


serial.on('connect', function (path) {
  debug('on connect', path)
})

serial.on('error', function (error) {
  debug.red('on error', error)
})

serial.on('disconnect', function() {
  debug('on disconnect')
})

serial.on('open', function (serialport) {
  debug('on open', serialport != undefined)
})

serial.on('sketch', function (sketch) {
  debug.green('on sketch', sketch)
})

serial.on('data', function (data) {
  debug('on data', data)
})
