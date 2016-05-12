/// <reference path="../typings/main.d.ts" />

import Express = require('express');

var router = Express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
