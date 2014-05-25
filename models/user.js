var mongodb = require('./db');

function User(user)
{
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function(funCallback)
{
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 users集合
		db.collection('users', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			//将用户数据插入 users 集合
			collection.insert(user, {
				safe: true
			}, function(err, user){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null, user[0]);
			});
		});
	});
}

//读取用户信息
User.get = function(name, funCallback)
{
	//打开数据库
	mongodb.open(function(err, db){
		if(err)
		{
			return funCallback(err);
		}
		//读取 users集合
		db.collection('users', function(err, collection){
			if(err)
			{
				mongodb.close();
				return funCallback(err);
			}
			//将用户数据插入 users 集合
			collection.findOne({
				name: name
			}, function(err, user){
				mongodb.close();
				if(err)
				{
					return funCallback(err);
				}
				funCallback(null, user);
			});
		});
	});
}
