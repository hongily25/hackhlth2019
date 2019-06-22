const express = require('express')
const open = require('open')
let coinbase = require('coinbase');

const app = express()
const port = 5000

function allowCrossDomain (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

app.use(allowCrossDomain)
app.use('/', express.static(`${__dirname}/public`))

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

app.get('/em', function(req, res) {
  return res.send('hello world');
})



app.listen(port, async (err) => {
  if (err) { console.error('Something bad happend', err) }

  console.log(`App running at: http://localhost:${port}`)
  await open(`http://localhost:${port}`)
}) 