var mongodb = require('./db'),
	markdown = require('markdown').markdown;

function Post(name, title, tags, post)
{
	this.name = name;
	this.title = title;
	this.tags = tags;
	this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(funCallback)
{
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + 
				date.getDate() + " " + date.getHours() + ":" + 
				(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
	};
	//要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post,
		comments: [],
		pv: 0
	};
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			//将文档插入 posts 集合
			collection.insert(post, {
				safe: true
			}, function(err){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null);
			});
		});
	});
}

//读取文章及其相关信息
Post.getAll = function(name, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			var query = {};
			if(name) query.name = name;
			//根据query对象查询文档
			collection.find(query).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});
				funCallback(null, docs);
			});
		});
	});
}

//获取一篇文章
Post.getOne = function(name, day, title, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
		
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc){
				if(err)
				{
					mongodb.close();
					return funCallback(err);
				}
				
				//每访问1次，pv值增加1
				collection.update({
					"name": name,
					"time.day": day,
					"title": title
				}, {
					$inc: {"pv": 1}
				}, function(err){
					mongodb.close();
					if(err){
						return funCallback(err);
					}
				});
				
				//解析 md 为 html
				doc.post = markdown.toHTML(doc.post);
				doc.comments.forEach(function(comment){
					comment.content = markdown.toHTML(comment.content);
				});
				funCallback(null, doc);
			});
		});
	});
}

//返回原始发表的内容(markdown 格式)
Post.edit = function(name, day, title, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
		
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({
				"name": name,
				"time.day": day,
				"title": title
			}, function(err, doc){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null, doc);
			});
		});
	});
}

//更新一篇文章及相关信息
Post.update = function(name, day, title, post, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
		
			//更新文章内容
			collection.update({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				$set: {post: post}
			}, function(err, doc){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null);
			});
		});
	});
}

//删除一篇文章
Post.remove = function(name, day, title, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
		
			//根据用户名、发表日期及文章名删除一篇文章
			collection.remove({
				"name": name,
				"time.day": day,
				"title": title
			}, {
				w: 1
			},function(err, doc){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null);
			});
		});
	});
}

//返回所有文章存档信息
Post.getArchive = function(funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			//返回只包含 name、time、title 属性的文章组成的存档数组
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null, docs);
			});
		});
	});
}

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 posts集合
		db.collection('posts', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			var pattern = new RegExp("^.*" + keyword + ".*$", "i");
			//返回只包含 name、time、title 属性的文章组成的存档数组
			collection.find({
				"title": pattern
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null, docs);
			});
		});
	});
}