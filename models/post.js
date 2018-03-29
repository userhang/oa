var mongodb=require('./db');

markdown =require('markdown').markdown;

function Post(id,name,department,role,head,title,mainpost,tags,post){
	this.id=id;
	this.name=name;
	this.department=department;
	this.role=role;
	this.head=head;
	this.title=title;
	this.mainpost=mainpost;
	this.tags=tags;
	this.post=post;
}

module.exports=Post;

Post.prototype.save = function(callback) {
	var date=new Date();

	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+"-"+(date.getMonth()+1),
		day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()),
		minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes())
	}
	// 要存入数据库的文件
	var post={
		iid:this.id,
		name:this.name,
		idepartment:this.department,
		irole:this.role,
		head:this.head,
		time:time,
		title:this.title,
		mainpost:this.mainpost,
		tags:this.tags,
		post:this.post,
		comments:[],
		files:[],
		pv:0
	};
	
    //打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
		//将用户数据插入posts集合
		collection.insert(post,{
			safe:true
		},function(err){
			mongodb.close();
			if (err) {
				return callback(err);//错误，返回错误信息
			}
			callback(null);//成功，err为null，并返回存储后的用户文档。
		});
		});
	});
};

Post.getTen =function(id,page,callback){
		//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取posts集合
	    db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	    var query={};
	   
	    query.iid=id;
	  
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
	    		docs.forEach(function(doc){
	    			doc.post=markdown.toHTML(doc.post);
	    		});

	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};

//查询该部门的所有公告
Post.getDepost =function(department,page,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取posts集合
	    db.collection('posts',function(err,collection){
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
	    		docs.forEach(function(doc){
	    			doc.post=markdown.toHTML(doc.post);
	    		});

	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};


//查询主页公告
Post.getmainpost =function(page,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取posts集合
	    db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);//错误，返回错误信息
			}
	        var query={};
	   
	    	query.idepartment='销售部';
	    	query.mainpost='1';
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
	    		docs.forEach(function(doc){
	    			doc.post=markdown.toHTML(doc.post);
	    		});

	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};


Post.getOne =function(id,day,title,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"iid":id,
				"time.day":day,
				"title":title
			},function(err,doc){
				
				if (err) {
					mongodb.close();
					return callback(err);
				}
 
				if(doc){
					collection.update({
					    "iid":id,
					    "time.day":day,
					    "title":title
					},{
						$inc:{"pv":1}
					},function(err){
						mongodb.close();
						if (err) {
							return callback(err);
						}
					});

					doc.post = markdown.toHTML(doc.post);
					doc.comments.forEach(function (comment){
						comment.content =markdown.toHTML(comment.content)
					});
					callback(null,doc);
				}
               
				
			});
		});
	});
};

//返回原始内容发表的内容
Post.edit=function(id,day,title,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"iid":id,
				"time.day":day,
				"title":title
			},function(err,doc){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,doc);
			});
		});
	});
};

//更新文章
Post.update=function(id,day,title,mainpost,post,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.update({
			"iid":id,
			"time.day":day,
			"title":title
		},{
			$set:{
				post:post,
				mainpost:mainpost
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

//删除文章
Post.remove=function(id,day,title,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
		if (err) {
				mongodb.close();
				return callback(err);
			}
        collection.remove({
			"iid":id,
			"time.day":day,
			"title":title
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


//删除特定用户的所有文章
Post.removealluser=function(id,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
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


//返回部门所有文章存储信息
Post.getArchive =function(department,page,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
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
	    		docs.forEach(function(doc){
	    			doc.post=markdown.toHTML(doc.post);
	    		});

	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};

//返回所有文章存储信息
Post.getallpost =function(page,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
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
	    		docs.forEach(function(doc){
	    			doc.post=markdown.toHTML(doc.post);
	    		});

	    		callback(null,docs,total);
	    	});
	    })      
	    });
	  	});
};


//返回所有的标签
Post.getTags =function(department,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return collection(err);
			}
			var query={};
		    if (department) {
		    	query.idepartment=department;
		    }
			collection.distinct("tags",function(err,docs){
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
};


//返回所有特定便签
Post.getTag =function(tag,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return collection(err);
			}
			collection.find({
				"tags":tag
			},{
				"iid":1,
				"time":1,
				"title":1
			}).sort({
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







Post.searchpost =function(id,name,department,title,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);//错误，返回错误信息
		}
	//读取集合
	    db.collection('posts',function(err,collection){
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
			if(title!==''){
				query.title=title;
				console.log(query.title);
			}
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