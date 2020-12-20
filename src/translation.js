// @flow
const fetch = require("node-fetch");

function formatResponse(data) {
  var ret = {
    main: data[0][0][0],
    others: [],
    thesaurus: [],
  };

  if (data[1]) {
    data[1].forEach(function (tr) {
      ret.others.push({
        type: tr[0],
        translations: tr[1],
      });
    });
  }

  // Definitions
  if (data[12]) {
    data[12].forEach(function (t) {
      ret.thesaurus.push({
        type: t[0],
        translations: t[1].map(function (tr) {
          return tr[0];
        }),
      });
    });
  }

  return ret;
}

type ReadResponseType = {|
  translation: {|
    main: Array<{|
      type: string,
      translations: string[],
    |}>,
    others: Array<{|
      type: string,
      translations: string[],
    |}>,
    thesaurus: Array<{|
      type: string,
      translations: string[],
    |}>,
  |},
  original: string,
|};

type ReadType = (
  string,
  {| src: string, target: string |}
) => Promise<ReadResponseType>;

const read: ReadType = async (original, options) => {
  if (!original) throw new Error("Arg original required");
  if (!options) throw new Error("Arg options required");
  if (!options.src) throw new Error("Arg options.src is required");
  if (!options.target) throw new Error("Arg options.target is required");

  var url =
    "http://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    options.src +
    "&tl=" +
    options.target +
    "&dt=bd&dt=md&dt=t&q=" +
    encodeURI(original);

  var headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36",
    Referer: "https://translate.google.de/",
  };

  const res = await fetch(url, { headers });
  const body = await res.json();

  // Currently we always use the error, because it can't handle a non-json res
  // when received headers say its json.
  var translation;
  try {
    translation = formatResponse(body);
  } catch (err) {
    err.body = body;
    throw err;
  }

  return { translation, original };
};

module.exports = { read };
