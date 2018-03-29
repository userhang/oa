var mongodb=require('./db');
var crypto=require('crypto');

function Messages(message){
	this.reid=message.reid;
	this.seid=message.seid;
}

module.exports=Messages;

//存储用户信息
Messages.prototype.save=function(callback){
	var date=new Date();

	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes())
	}
	var id=Math.random().toString(36).substr(2);
	//要存入数据库的用户文档
	var message={
		id:id,
		reid:this.reid,
		seid:this.seid,
		imessage:[],
	    time:time,
	    sign:'no'
	};
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
		//读取users集合
		db.collection('messages',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
		//将数据插入集合
		collection.insert(message,{
			safe:true
		},function(err,message){
			mongodb.close();
			if (err) {
				return callback(err);//错误，返回错误信息
			}
			callback(null,message[0]);//成功，err为null，并返回存储后的用户文档。
		});
		});
	});
};

//读取消息信息
Messages.findone=function(seid,reid,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取users集合
	    db.collection('messages',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	//查找用户名为name的一个文档
	    collection.findOne({
		reid:reid,
		seid:seid
	    },function(err,message){
		    mongodb.close();
            if (err) {
        	    return callback(err);
            }
        callback(null,message);
	    });
	    });
	});
};

//查看是否有消息记录
Messages.get=function(seid,reid,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取users集合
	    db.collection('messages',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	//查找用户名为name的一个文档
	    collection.findOne({
		seid:seid,
		reid:reid
	    },function(err,itok){
		    mongodb.close();
            if (err) {
        	    return callback(err);
            }
        callback(null,itok);
	    });
	    });
	});
};

//消息人列表
Messages.getTen =function(page,reid,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取posts集合
	    db.collection('messages',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	    var query={};
	    console.log(reid);
	    if (reid) {
		    	query.reid=reid;
		    }
	    collection.count(query,function(err,total){
	    	collection.find(query,{
	    		skip:(page-1)*10,
	    		limit:10
	    	}).sort({
	    		time:-1
	    	}).toArray(function(err,docs){
	    		mongodb.close();
	    		if (err) {
	    			return callback(err);
	    		}
	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};



//消息删除
Messages.remove=function(seid,reid,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('messages',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.remove({
			"seid":seid,
			"reid":reid
		},{
			W:1
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);
			}
			callback(null);
		});
		});
		
	});
};


//删除该用户所有
Messages.removealluser=function(name,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('messages',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.remove({
			"name":name
		},{
			W:1
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);
			}
			callback(null);
		});
		});
		
	});
};


//更新消息时间
Messages.updatetime=function(reid,seid,callback){
	var date=new Date();

	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes())
	}
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('messages',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.update({
			"reid":reid,
			"seid":seid
		},{
			$set:{
				time:time
			}
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);
			}
			callback(null);
		});
		});
		
	});
};

//更新消息状态
Messages.updatesignno=function(seid,reid,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('messages',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.update({
			"reid":reid,
			"seid":seid
		},{
			$set:{
				sign:'yes'
			}
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);
			}
			callback(null);
		});
		});
		
	});
};
//更新消息状态
Messages.updatesignyes=function(seid,reid,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('messages',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.update({
			"reid":reid,
			"seid":seid
		},{
			$set:{
				sign:'no'
			}
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);
			}
			callback(null);
		});
		});
		
	});
};
