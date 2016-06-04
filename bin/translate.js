var translate = require('../src/translate')

function log(err, data) {
  if (err) return console.log(err)
  console.log(JSON.stringify(data, null, 2))
}

// translate('Play', {src: 'en', target: 'en'}, log)
translate('מִבְחָן', {src: 'iw', target: 'en'}, log)
