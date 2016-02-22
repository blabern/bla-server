var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var translate = require('./translate')

var port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Listening on port', port)
})

var socket

app.get('/', (req, res) => {
  res.send('Ok.')
})

app.get('/subtitle', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  var original = req.query.q
  if (socket) socket.emit('subtitle', {original: original})
  res.send({original: original})
})

io.on('connection', (_socket) => {
  socket = _socket
  socket.emit('connected')
  socket.on('translate', (word) => {
    translate(word, (err, tr) => {
      if (err) return console.log(err)
      console.log('Translating', tr)
      socket.emit('translation', tr)
    })
  })
})
