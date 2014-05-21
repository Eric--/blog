var express = require('express');
var router = express.Router();

/* GET home page. test use
router.get('/', function(req, res) {
  res.render('index_old', { title: 'Express' });
}); */

/* update by erric */
router.get('/nswbmw', function(req, res) {
  res.render('template', { supplies: ['mop', 'broom', 'duster'] });
});

/* 布局测试 */
router.get('/layout', function(req, res) {
  res.render('layout', { title: 'Express' });
});

/* blog */
router.get('/', function(req, res) {
  res.render('index', { title: '主页' });
});

router.get('/reg', function(req, res) {
  res.render('reg', { title: '注册' });
});

router.post('/reg', function(req, res) {
  
});

router.get('/login', function(req, res) {
  res.render('login', { title: '登录' });
});

router.post('/login', function(req, res) {
  
});

router.get('/post', function(req, res) {
  res.render('post', { title: '发表' });
});

router.post('/post', function(req, res) {
  
});

router.get('/logout', function(req, res) {
  
});

module.exports = router;
