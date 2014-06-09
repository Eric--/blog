var express = require('express');
var path = require('path');

var settings = require('./settings');

//使用connect中间件
var connect = require('connect');
var MongoStore = require('connect-mongo')(connect);
var flash = require('connect-flash');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//github登录验证
var passport = require('passport'),
	GithubStrategy = require('passport-github').Strategy;

//设置页面模板和引擎模板的位置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//通过user启用中间件
app.use(favicon());
app.use(flash());
app.use(logger('dev'));
app.use(logger({stream: accessLog}));
app.use(bodyParser());
app.use(cookieParser());
app.use(connect.session({
	secret: settings.cookieSecret,
	key: settings.db,//cookie name
	cookie:{maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
	store: new MongoStore({
		db: settings.db
	})
}));

app.use('/', routes);
app.use('/users', users);// note: 使用use注册相当于/users/,使用get还是原始请求
app.use(express.static(path.join(__dirname, 'public')));
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
    next();
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
