var crypto = require('crypto'),
	fs = require('fs'),
	formidable = require("formidable"),
	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	Comment = require('../models/comment.js');
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
  Post.getAll(null, function(err, posts){
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
      tags = [req.body.tag1, req.body.tag2, req.body.tag3],
      post = new Post(currentUser.name, req.body.title, tags, req.body.post);
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
	
	var form = new formidable.IncomingForm();
	form.uploadDir = "./public/tmp/";//至关重要，上传文件所需的临时目录
  	console.log("about to parse");
  	form.parse(req, function(error, fields, files) {
	    console.log("parsing done");
		for(var prop in files)
		{
			var file = files[prop];
			if(file.name)
			{
				fs.renameSync(file.path, "./public/images/" + file.name);
			}
			else{
				fs.unlinkSync(file.path);//删除临时目录的空文件，不然会被撑爆
			}
		}
  	});
	req.flash('success', '文件上传成功！');
  	res.redirect('/upload');
});

router.get("/u/:name", function(req, res){
	
	//检查用户是否存在
	User.get(req.params.name, function(err, user){
		
		if(!user){
			req.flash("error", '用户不存在！');
			return res.redirect('/');
		}
		//查询并返回该用户的所有文章
		Post.getAll(user.name, function(error, posts){
			
			if(error){
				req.flash('error', error);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

router.get("/u/:name/:day/:title", function(req, res){
		
	//查询并返回该用户的文章
	Post.getOne(req.params.name, req.params.day, req.params.title, function(error, post){
		
		if(error){
			req.flash('error', error);
			return res.redirect('/');
		}
		res.render('article', {
			title: req.params.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function(req, res){
	
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post){
		
		if(err)
		{
			req.flash('error', err);
			res.redirect('back');
		}
		res.render('edit', {
			
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//修改文章
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function(req, res){
	
	var currentUser = req.session.user;
	Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function(err){
		
		var url = "/u/" + req.params.name + "/" + req.params.day + "/" + req.params.title;
		if(err)
		{
			req.flash('error', err);
			return res.redirect(url);
		}
		req.flash('success', '修改成功！');
		res.redirect(url);
	});
});

//删除文章
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res){
	
	var currentUser = req.session.user;
	Post.remove(currentUser.name, req.params.day, req.params.title, function(err){
		
		if(err)
		{
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功！');
		res.redirect('/');
	});
});

//加入留言功能
router.post('/u/:name/:day/:title', function(req, res){
	
	var date = new Date(),
		time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate() + " " + date.getHours() + ":" + 
				(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
	var comment = {
		name: req.body.name,
		email: req.body.email,
		website: req.body.website,
		time: time,
		content: req.body.content
	}
	var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
	newComment.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '留言成功！');
		res.redirect('back');
	});
});

//获取存档信息 
router.get('/archive', function(req, res){
	
	Post.getArchive(function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('archive', {
			title: '存档',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
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
