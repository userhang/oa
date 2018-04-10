var mongodb=require('./db');
var crypto=require('crypto');

function Department(department){
	this.name=department.name;
}

module.exports=Department;

//存储部门信息
Department.prototype.save=function(callback){
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
	var department={
		iid:id,
		name:this.name,
	    time:time,
	};
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
		//读取department集合
		db.collection('departments',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
		//将用户数据插入department集合
		collection.insert(department,{
			safe:true
		},function(err,department){
			mongodb.close();
			if (err) {
				return callback(err);//错误，返回错误信息
			}
			callback(null,department[0]);//成功，err为null，并返回存储后的用户文档。
		});
		});
	});
};


//读取department信息
Department.get=function(name,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取users集合
	    db.collection('departments',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	//查找用户名为name的一个文档
	    collection.findOne({
		name:name
	    },function(err,department){
		    mongodb.close();
            if (err) {
        	    return callback(err);
            }
         
        callback(null,department);
	    });
	    });
	});
};


//获得10个部门信息
Department.getTen =function(page,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('departments',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	        var query={};
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
//审核选择
Department.getchoice =function(callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('departments',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	        var query={};
	    	
	    	collection.find(query).sort({
	    		time:-1
	    	}).toArray(function(err,docs){
	    		mongodb.close();
	    		if (err) {
	    			return callback(err);
	    		}
	    		callback(null,docs);
	    	});
	    })      
	    });
	  
};


//删除
Department.remove=function(id,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('departments',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
			
        collection.remove({
			"iid":id
		
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


Department.update=function(id,name,time,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('departments',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
			
        collection.update({
			"iid":id
			
		},{
			$set:{
			"name":name,
			"time.day":time
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
