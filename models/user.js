var mongodb=require('./db');
var crypto=require('crypto');



function User(user){
	this.id=user.id;
	this.password=user.password;
	this.email=user.email;
}

module.exports=User;

//存储用户信息
User.prototype.save=function(callback){
	var date=new Date();

	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes())
	}
    //var id=Math.random().toString(36).substr(2);
	var md5=crypto.createHash('md5'),
	        //id=md5.update(time).digest('hex'),
	        email_MD5=md5.update(this.email.toLowerCase()).digest('hex'),
	        head="http://www.gravatar.com/avatar/"+email_MD5+"?s=48";
	//要存入数据库的用户文档
	var user={
		iid:this.id,
		name:'李四',
		password:this.password,
		email:this.email,
		head:head,
		age:18,
	    idepartment:'销售部',
	    idate:time,
	    place:'乐山',
	    irole:1
	};
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
		//读取users集合
		db.collection('users',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
		//将用户数据插入users集合
		collection.insert(user,{
			safe:true
		},function(err,user){
			mongodb.close();
			if (err) {
				return callback(err);//错误，返回错误信息
			}
			callback(null,user[0]);//成功，err为null，并返回存储后的用户文档。
		});
		});
	});
};


//读取用户信息
User.get=function(id,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取users集合
	    db.collection('users',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	//查找用户名为name的一个文档
	    collection.findOne({
		iid:id
	    },function(err,user){
		    mongodb.close();
            if (err) {
        	    return callback(err);
            }
            for(var i in user){//用javascript的for/in循环遍历对象的属性 
            if (i=='idepartment') {
              var department=user[i];
              }
              if (i=='irole') {
              var role=user[i];
              }
             } 
             

        callback(null,user,department,role);
	    });
	    });
	});
};



User.getTen =function(page,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('users',function(err,collection){
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


User.getdeparpeople =function(department,page,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('users',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	        var query={};
		    if (department) {
		    	query.idepartment=department;
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



//删除员工
User.remove=function(id,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('users',function(err,collection){
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


User.update=function(id,name,email,age,department,day,place,role,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('users',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.update({
			"iid":id
			
		},{
			$set:{
			"name":name,
			"email":email,
			"age":age,
			"idepartment":department,
			"idate.day":day,
			"place":place,
			"irole":role
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


User.updateone=function(id,name,email,age,place,password,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('users',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
			
        collection.update({
			"iid":id
			
		},{
			$set:{
			"name":name,
			"email":email,
			"age":age,
			"place":place,
			"password":password
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



User.searchnumber =function(id,name,department,place,age,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('users',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
			
			var query={};
			if(id!==''){
				query.iid=id;
				console.log(query.iid);
			}
			if(name!==''){
				query.name=name;
				console.log(query.name);
			}
			if(department!==''){
				query.idepartment=department;
				console.log(query.idepartment);
			}
			if(age!==''){
				query.age=parseInt(age);
				console.log(query.age);
			}
			if(place!==''){
				query.place=place;
				console.log(query.place);
			}
	       
		   console.log(query);
		  
	    	collection.find(query).sort({
	    		time:-1
	    	}).toArray(function(err,docs){
	    		mongodb.close();
	    		if (err) {
	    			return callback(err);
	    		}
	    		callback(null,docs);
	    	});
	    });     
	    });
	  
};
