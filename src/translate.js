var request = require('superagent')

function formatResponse(text) {
  var data

  try {
    data = eval('(' + text + ')')
  } catch(err) {
    return err.message
  }

  var ret = {
    main: data[0][0][0],
    others: []
  }

  if (data[1]) {
    data[1].forEach(function(tr) {
      ret.others.push({
        type: tr[0],
        translations: tr[1]
      })
    })
  }

  return ret
}

module.exports = function translate(original, callback) {
  var sourceLang = 'en'
  var targetLang = 'ru'
  var url = "http://translate.googleapis.com/translate_a/single?client=gtx&sl="
  + sourceLang + "&tl=" + targetLang + "&dt=bd&dt=t&q=" + encodeURI(original)

  request
    .get(url)
    .end((err, res) => {
      callback({
        translation: formatResponse(err.rawResponse),
        original: original
      })
    })
}
