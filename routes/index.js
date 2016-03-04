var express = require('express');
var router = express.Router();

var siteinfo = require('../siteinfo/siteinfo');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: siteinfo.siteTitle, info : siteinfo.siteInfo, authors : siteinfo.authors });
});

module.exports = router;
