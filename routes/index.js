var crypto = require('crypto'),
	fs = require('fs');
	User = require('../models/user.js'),
	Post = require('../models/post.js');
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
router.get('/', checkLogin);
router.get('/', function(req, res) {
  Post.get(null, function(err, posts){
  	if(err){
		posts = [];
	}
	res.render('index', {
		title: '主页',
		user: req.session.user,
		posts: posts,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', { 
  	title: '注册',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
  });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
  var password = req.body.password,
	  password_re = req.body['password-repeat'];
	  
  if(password_re != password)
  {
  	req.flash('error', '两次输入的密码不一致!');
	return res.redirect('/reg');
  }
  //生成密码的md5值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
	  var newUser = new User({
	  	name: req.body.name,
		password: password,
		email: req.body.email 
	  });
  //检查用户名是否存在
  User.get(newUser.name, function(err, user){
  	if(user)
	{
		req.flash('error', '用户已存在');
		return res.redirect('/reg');
	}
	//如果不存在则新增用户
	newUser.save(function(err, user){
		if(err)
		{
			req.flash('error', err);
			return res.redirect('/reg');
		}
		req.session.user = user;
		req.flash('success', '注册成功!');
		res.redirect('/');
	});
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', { 
  	title: '登录',
	user: req.session.user,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  //生成密码的md5值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.name, function(err, user){
  	if(!user)
	{
		req.flash('error', '用户不存在！');
		return res.redirect('/login');
	}
	//检查密码是否一致
	if(user.password != password){
		req.flash('error', '密码错误！');
		return res.redirect('/login');	
	}
	//用户名密码都匹配后，将用户信息存入 session
	req.session.user = user;
	req.flash('success', '登录成功！');
	res.redirect('/');
  });
});

router.get('/post', checkLogin);
router.get('/post', function(req, res) {
	res.render('post', {
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
  var currentUser = req.session.user,
      post = new Post(currentUser, req.body.title, req.body.post);
  post.save(function(err){
  	if(err){
		req.flash('error', err);
		return res.redirect('/');
	}
	req.flash('success', '发布成功！');
	res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash('success', '登出成功！');
  res.redirect('/login');
});

//上传文件
router.get('/upload', checkLogin);
router.get('/upload', function(req, res){
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/upload', checkLogin);
router.post('/upload', function(req, res){
/*	for(var i in req.files)
	{
		if(req.files[i].size == 0)
		{
			//使用同步方式删除一个文件
			fs.unlinkSync(req.files[i].path);
			console.log('Successfully removed an empty file!');
		}else{
			var target_path = './images/' + req.files[i].name;
			//使用同步方式重命名一个文件
			fs.renameSync(req.files[i].path, target_path);
			console.log('Successfully renamed a file!');
		}
	} */
	console.log(req.busboy);
	req.flash('success', '文件上传成功！');
	res.redirect('/upload');
});

//页面权限控制
function checkLogin(req, res, next)
{
	if(!req.session.user)
	{
		req.flash('error', '未登录！');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next)
{
	if(req.session.user)
	{
		req.flash('error', '已登录！');
		res.redirect('back');
	}
	next();
}

module.exports = router;
