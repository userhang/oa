var mongodb=require('./db');
var crypto=require('crypto');

function Files(file){
	this.name=file.name;
	this.filename=file.filename;
}

module.exports=Files;

//存储用户信息
Files.prototype.save=function(callback){
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
	
	var file={
		iid:id,
		name:this.name,
		filename:this.filename,
	    time:time
	};
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
		//读取users集合
		db.collection('files',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
		//将用户数据插入users集合
		collection.insert(file,{
			safe:true
		},function(err,file){
			mongodb.close();
			if (err) {
				return callback(err);//错误，返回错误信息
			}
			callback(null,file[0]);//成功，err为null，并返回存储后的用户文档。
		});
		});
	});
};


//读取文件信息
Files.get=function(name,filename,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取users集合
	    db.collection('files',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	//查找用户名为name的一个文档
	    collection.findOne({
		filename:filename,
		name:name
	    },function(err,file){
		    mongodb.close();
		    console.log(1111);
            if (err) {
        	    return callback(err);
            }
         
        callback(null,file);
	    });
	    });
	});
};



Files.getTen =function(name,page,callback){
	//打开数据库
	   console.log(2222222222);
	mongodb.open(function(err,db){
		 console.log(44444444444);
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取posts集合
	    db.collection('files',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	    var query={};
	    if (name) {
	    	query.name=name;
	    }
	    collection.count(query,function(err,total){
	    	collection.find(query,{
	    		skip:(page-1)*10,
	    		limit:10
	    	}).sort({
	    		time:-1
	    	}).toArray(function(err,docs){
	    		mongodb.close();
	    		 console.log(33333333);
	    		if (err) {
	    			return callback(err);
	    		}
	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};



//删除
Files.remove=function(name,filename,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('files',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.remove({
			"name":name,
			"filename":filename
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
Files.removealluser=function(name,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('files',function(err,collection){
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



