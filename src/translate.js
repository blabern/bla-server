var request = require('superagent')

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

  request
    .get(url)
    .end((err, res) => {
      // Currently we always use the error, because it can't handle a non-json res
      // when received headers say its json.
      var translation
      try {
        translation = formatResponse(err.rawResponse)
      } catch (err) {
        err.response = err.rawResponse
        return callback(err)
      }

      callback(null, {
        translation: translation,
        original: original
      })
    })
}
