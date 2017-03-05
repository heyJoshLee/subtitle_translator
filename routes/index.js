var express = require('express');
var router = express.Router();
var MsTranslator = require('mstranslator');
var api_key = process.env.MS_TRANSLATOR_API_KEY;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("api_key is...")
  console.log(api_key)
  res.render('index', { title: 'Express' });
});

router.post("/translate", function(req, res, next) {
  var textToTranslate = req.body.textToTranslate,
      toLanguage = req.body.toLanguage;
  var client = new MsTranslator({
    api_key: api_key // use this for the new token API. 
  }, true);

  var params = {
    text: textToTranslate, 
    from: 'en', 
    to: toLanguage
  };

  client.translate(params, function(err, data) {
    res.send(data);
  });

// Don't worry about access token, it will be auto-generated if needed.
// client.translate(params, function(err, data) {
//   console.log(data);
// });
});

module.exports = router;
