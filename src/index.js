var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var translate = require('./translate')

var port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Listening on port', port)
})

app.get('/', (req, res) => {
  res.send('Ok.')
})

app.get('/subtitle/:subtitle', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  var subtitle = req.params.subtitle

  io.sockets.emit('subtitle', {original: subtitle})
  res.send({original: subtitle})
})

app.get('/translation/:original', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  var original = req.params.original
  console.log('Translating', original)
  translate(original, (err, tr) => {
    if (err) {
      console.error(err)
      return res.status(400).send({error: err.message})
    }
    res.send(tr)
  })
})

io.on('connection', (socket) => {
  socket.emit('connected')
})
