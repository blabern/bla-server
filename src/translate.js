var request = require('request')

function formatResponse(text) {
  var data = eval('(' + text + ')')
  var ret = {
    main: data[0][0][0],
    others: [],
    thesaurus: []
  }

  if (data[1]) {
    data[1].forEach(function(tr) {
      ret.others.push({
        type: tr[0],
        translations: tr[1]
      })
    })
  }

  // Definitions
  if (data[12]) {
    data[12].forEach(function(t) {
      ret.thesaurus.push({
        type: t[0],
        translations: t[1].map(function(tr) {
          return tr[0]
        })
      })
    })
  }

  return ret
}

module.exports = function translate(original, options, callback) {
  var url = "http://translate.googleapis.com/translate_a/single?client=gtx&sl="
  + options.src + "&tl=" + options.target + "&dt=bd&dt=md&dt=t&q=" + encodeURI(original)

  var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36',
    Referer: 'https://translate.google.de/'
  }

  request({url, headers}, (err, res, body) => {
    // Currently we always use the error, because it can't handle a non-json res
    // when received headers say its json.
    var translation
    try {
      translation = formatResponse(body)
    } catch (err) {
      err.body = body
      return callback(err)
    }

    callback(null, {
      translation: translation,
      original: original
    })
  })
}
