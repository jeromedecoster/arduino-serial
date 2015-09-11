# Arduino serial

Connect Arduino with serial

## Install

Install with <a href="https://docs.npmjs.com/cli/install" target="_blank">npm</a> directly from the <a href="https://github.com/jeromedecoster/arduino-serial" target="_blank">github repository</a>

```
npm install jeromedecoster/arduino-serial
```

Install from a <a href="https://docs.npmjs.com/files/package.json#github-urls" target="_blank">package.json</a> file

```json
{
  "dependencies": {
    "arduino-serial": "jeromedecoster/arduino-serial"
  }
}
```

## Example

```js
serial.start({sketch:'blink'})

serial.on('connect', function (path) {
  console.log('on connect', path)
  // => on connect /dev/cu.usbmodem1411
})

serial.on('error', function (error) {
  console.log('on error', error)
})

serial.on('disconnect', function () {
  console.log('on disconnect')
})

serial.on('open', function (serialport) {
  console.log('on open', serialport)
})

serial.on('sketch', function (sketch) {
  console.log('on sketch', sketch)
})

serial.on('data', function (data) {
  console.log('on data', data)
})
```

## Events

#### .on('connect', cb(path))

Fired when the Arduino is connected with the USB cable

#### .on('disconnect', cb)

Fired when the USB cable is unplugged

#### .on('open', cb(serialport))

Fired when the <a href="https://github.com/voodootikigod/node-serialport" target="_blank">node-serialport</a> instance is opened

#### .on('sketch', cb(sketch))

Fired when the sketch name is received

#### .on('data', cb(data))

Fired when some data are recevied from the Arduino. Data are already `String.trim()`

#### .on('error', cb(error))

Fired when something goes wrong like

* `TimeoutError` when the sketch request has no response after 4000ms

* `SketchError` when the sketch name returned does not match

## Options

#### {baudrate: value}

Sets the Baud Rate, defaults to 9600

```js
serial.start({ baudrate: 115200 })

serial.on('open', function (serialport) {
  console.log('baudrate', serialport.options.baudRate)
  // => baudrate 115200
})
```

#### {sketch: 'name'}

Checks if the arduino sketch matches

```js
serial.start({ sketch: 'test' })

serial.on('sketch', function (sketch) {
  console.log('on sketch', sketch)
})

serial.on('error', function (error) {
  if (error.name == 'SketchError')  { /* wrong sketch detected */ }
}
```

#### {ignore: true}

Ingore incoming data before ping validation

```js
serial.start({ sketch: 'blink', ignore: true })

serial.on('data', function (data) {
  // nothing here before sketch was validated
}
```

#### {close: false}

Don't close `serialport` connection on `SketchError` or `TimeoutError`

## License

MIT
