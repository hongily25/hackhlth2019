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

let Client = coinbase.Client;
let client = new Client({'apiKey': 'pwzHCVdKTg7OwlUG', 'apiSecret': 'AC8PntCX48C8MvQPbCnl0Dxp4vXlQAIT'});

function getAccounts (req, res, next) { 
  client.getAccounts({}, function(err, accounts) {
    accounts.forEach(function(acct) {
      console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
    });
  });
}

app.use(allowCrossDomain)
app.use('/', express.static(`${__dirname}/public`))
app.use(getAccounts)

app.get('/test', function(req, res, next) {
  return res.send('hello');
});

app.listen(port, async (err) => {
  if (err) { console.error('Something bad happend', err) }

  console.log(`App running at: http://localhost:${port}`)
  await open(`http://localhost:${port}`)
})