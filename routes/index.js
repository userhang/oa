
/*
 * GET home page.
 */


var crypto=require('crypto'),
     fs=require('fs'),
 User=require('../models/user.js'),
 Post=require('../models/post.js'),
 Files=require('../models/files.js'),
 Department=require('../models/department.js'),
  Comment=require('../models/comment.js'),
   Postfiles=require('../models/postfiles.js'),
   Messages=require('../models/message.js'),
  Communication=require('../models/communication.js');



module.exports = function(app){

    app.get('/',checkLogin);
	app.get('/',function(req,res){

	var page=req.query.p ? parseInt(req.query.p) :1;
    Post.getmainpost(page,function(err,posts,total){
			if (err) {
				posts=[];
			}
			res.render('department',{
				title:'主页',
				posts:posts,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+posts.length)==total,
				department:req.session.department,
                role:req.session.role,
				user:req.session.user,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
    });

    app.get('/reg',checkNotLogin);
    app.get('/reg',function(req,res){
		res.render('reg',{
			title:'注册',
			user:req.session.user,
			department:req.session.department,
            role:req.session.role,
			success:req.flash('success').toString(),
	        error:req.flash("error").toString()
		});
	});

	app.post('/reg',checkNotLogin);
	app.post('/reg',function(req,res){
		var id=req.body.id,
		    password=req.body.password,
		    password_re=req.body['password-repeat'];
	    //检查两次输入密码一样否？
	    if (password_re !=password) {
	    	req.flash('error','两次输入密码不一致');
	    	return res.redirect('/reg');
	    }
	    //生成密码的MD5值
	    var md5=crypto.createHash('md5'),
	        password=md5.update(req.body.password).digest('hex');
	    var newUser =new User({
	    	id:req.body.id,
	    	password:password,
	    	email:req.body.email
	    });

	    //检查用户名是否存在
	    User.get(newUser.id,function(err,user){
	    	if (user) {
	    		req.flash('error','用户名已存在');
	    		return res.redirect('/reg');
	    	}
	    	//如果不存在则加入新用户
	    	newUser.save(function(err,user){
	    		if (err) {
	    			req.flash('error',err);
	    			return res.redirect('/reg');
	    		}
	    	
	    		req.session.user=user;
	    		req.flash('success','注册成功');
	    		res.redirect('/login');
	    	});
	    });
	});

    app.get('/login',checkNotLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title:'登入',
			user:req.session.user,
			department:req.session.department,
            role:req.session.role,
			success:req.flash('success').toString(),
			error:req.flash("error").toString()
		});
	});

    app.post('/login',checkNotLogin);
	app.post('/login',function(req,res){
		//生成密码的MD5值
	    var md5=crypto.createHash('md5'),
	        password=md5.update(req.body.password).digest('hex');
	        //检查用户名是否存在
	    User.get(req.body.id,function(err,user,department,role){
	    	if (!user) {
	    		req.flash('error','用户名已存在');
	    		return res.redirect('/login');
	    	}
	    	//检查两次输入密码一样否？
	        if (user.password !=password) {
	    	    req.flash('error','密码错误');
	    	    return res.redirect('/login');
	        }
	        req.session.department=department;
	        req.session.role=role;
	        req.session.user=user;
	        req.flash('success','登入成功');
	        res.redirect('/');
	    });
	});
		  

    app.get('/logout',checkLogin);
	app.get('/logout',function(req,res){
		req.session.user=null;
		req.session.department=null;
	    req.session.role=null;
		req.flash('success','登出成功');
		res.redirect('/');
	});


	app.get('/upload',checkLogin);
	app.get('/upload',function(req,res){
		var path1='./public/images/'+req.session.department;
		var path2='./public/images/'+req.session.department+'/'+req.session.user.iid;

		//检查目录，不存在就创建
		fs.exists(path2,function(exists){
        if(exists){
                console.log("目录存在")
            }
        if(!exists){

            fs.mkdir(path1,function(err){
            	fs.mkdir(path2,function(err){
            		if (err) {
            			console("创建失败"+err);
            		}
            	});
		    });
            };
        });

		res.render('upload',{
			title:'文件上传',
			user:req.session.user,
			department:req.session.department,
            role:req.session.role,
			success:req.flash('success').toString(),
			error:req.flash("error").toString()
		});
	});


	app.post('/upload',checkLogin);
	app.post('/upload',function(req,res){
		for (var i in req.files) {
			if (req.files[i].size == 0) {
				//使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('success removed an empty file!');
			}else{
				var filename=req.files[i].name;
			    var newFiles =new Files({
				name:req.session.user.iid,
	    	    filename:req.files[i].name
	        	});
		        //检查用户名是否存在
			    Files.get(req.session.user.iid,filename,function(err,file){
			    	if (file) {
			    		req.flash('error','文件名已存在');
			    		return res.redirect('/');
			    	}
			    	//如果不存在则加入新用户
			    	newFiles.save(function(err,filename){
			    		if (err) {
			    			req.flash('error',err);
			    			return res.redirect('/upload');
			    		}
			    	});
			    	var pathnamefile='./public/images/'+req.session.department+'/'+req.session.user.iid+'/'+req.files[i].name;
					var target_path ='./public/tempt/'+req.files[i].name;
					//使用同步方式重命名一个文件
					fs.renameSync(req.files[i].path,target_path);
					//转移文件
					fs.writeFileSync(pathnamefile, fs.readFileSync(target_path));
					//删除文件
					fs.unlink(target_path,function(err){
						if (err) {
							console.log("删除失败"+err);
						}
					})
					req.flash('success','文件上传成功');
					return res.redirect('/upload');
			    });
			}
			
		};
	});


	app.get('/myfiles',function(req,res){
			var page=req.query.p ? parseInt(req.query.p) :1;
		Files.getTen(req.session.user.iid,page,function(err,files,total){
			if (err) {
				files=[];
			}
			res.render('myfiles',{
				title:'主页',
				files:files,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+files.length)==total,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});


	app.get('/deletefile/:name/:filename',checkLogin);
	app.get('/deletefile/:name/:filename',function(req,res){
		
		Files.remove(req.params.name,req.params.filename,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			var pathnamefile='./public/images/'+req.session.department+'/'+req.session.user.iid+'/'+req.params.filename;
			fs.unlink(pathnamefile,function(err){
						if (err) {
							console.log("删除失败"+err);
						}
				})
			req.flash('success','删除成功');
			return res.redirect('/upload');
		});
	});

	app.post('/downloadfile',function(req,res){
		 // 实现文件下载 

		  var path='./public/images/'+req.session.department+'/'+req.body.name+'/'+req.body.filename;;
		  var f = fs.createReadStream(path);
		  res.writeHead(200, {
		    'Content-Type': 'application/force-download',
		    'Content-Disposition': 'attachment; filename='+encodeURIComponent(req.body.filename),
		  });
		  f.pipe(res);
	});


	app.get('/downloadfile/:id/:title/:filename',function(req,res){
		 // 实现文件下载 

		  var path='./public/postfiles/'+req.params.id+'/'+req.params.title+'/'+req.params.filename;
		  var f = fs.createReadStream(path);
		  res.writeHead(200, {
		    'Content-Type': 'application/force-download',
		    'Content-Disposition': 'attachment; filename='+encodeURIComponent(req.params.filename),
		  });
		  f.pipe(res);
	});


	app.get('/allpeople',function(req,res){
        var page=req.query.p ? parseInt(req.query.p) :1;
		Department.getchoice(function(err,des){
			if (err) {
				des=[];
			}
			User.getTen(page,function(err,users,total){
			if (err) {
				users=[];
			}
			res.render('allpeople',{
				title:'主页',
				users:users,
				des:des,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+users.length)==total,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
		});	
	});


	app.get('/inpeople',function(req,res){
        var page=req.query.p ? parseInt(req.query.p) :1;
		Department.getchoice(function(err,des){
			if (err) {
				des=[];
			}
			User.getdeparpeople(req.session.department,page,function(err,users,total){
			if (err) {
				users=[];
			}
			res.render('allpeople',{
				title:'主页',
				users:users,
				des:des,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+users.length)==total,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
		});	
	});

	app.get('/departmentmanage',function(req,res){
			var page=req.query.p ? parseInt(req.query.p) :1;
		Department.getTen(page,function(err,departments,total){
			if (err) {
				departments=[];
			}
			res.render('departmentmanage',{
				title:'主页',
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+departments.length)==total,
				departments:departments,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});
	app.post('/departmentmanage',function(req,res){
		var name=req.body.name;
        var newDepartment =new Department({
	    	name:req.body.name
	    });
	    //检查用户名是否存在
	    Department.get(name,function(err,department){
	    	if (department) {
	    		req.flash('error','部门名已存在');
	    		return res.redirect('/departmentmanage');
	    	}
	    	//如果不存在则加入新用户
	    	newDepartment.save(function(err,department){
	    		if (err) {
	    			req.flash('error',err);
	    			return res.redirect('/departmentmanage');
	    		}
	    	
	    		
	    		req.flash('success','新增成功');
	    		res.redirect('/departmentmanage');
	    	});
	    });
	});


	app.get('/deletedepartment/:id',checkLogin);
	app.get('/deletedepartment/:id',function(req,res){
		
		Department.remove(req.params.id,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','删除成功');
			return res.redirect('/departmentmanage');
		});
	});

   
	app.post('/changedepartment',checkLogin);
	app.post('/changedepartment',function(req,res){

		Department.get(req.body.name,function(err,department){
	    	if (department) {
	    		req.flash('error','部门名已存在');
	    		return res.redirect('/departmentmanage');
	    	}
	    	//如果不存在则修改
	    Department.update(req.body.id,req.body.name,req.body.day,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','修改成功');
			res.redirect('/departmentmanage');
		});
	    });	
		
	});


    app.get('/deletenumber/:id/:department',checkLogin);
	app.get('/deletenumber/:id/:department',function(req,res){
		var path1='./public/images/'+req.params.department+'/'+req.params.id;
		var path2='./public/postfiles/'+req.params.id;
		deleteFolderRecursive(path1);
		deleteFolderRecursive(path2);
		
		User.remove(req.params.id,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			Files.removealluser(req.params.id,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			Post.removealluser(req.params.id,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','删除成功');
			return res.redirect('/');
		});
		});

		});
	
	});

	
	app.post('/changenumber',function(req,res){
		
		var age = parseInt(req.body.age);
		var role= parseInt(req.body.role);
		User.update(req.body.id,req.body.name,req.body.email,age,req.body.department,req.body.day,req.body.place,role,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','修改成功');
			 res.redirect('/');
		});
	});


	app.get('/personal',checkLogin);
	app.get('/personal',function(req,res){
	    	res.render('personal',{
				title:'主页',
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
	 
	});


	app.post('/prechange',function(req,res){	
		var age = parseInt(req.body.age);
		 //生成密码的MD5值
	    var md5=crypto.createHash('md5'),
	        password=md5.update(req.body.password).digest('hex');
		User.updateone(req.body.id,req.body.name,req.body.email,age,req.body.place,password,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			User.get(req.body.id,function(err,user){
	        req.session.user=user;
	        req.flash('success','修改成功');
	        res.redirect('/personal');
	    });
		});
	});


	app.get('/post',checkLogin);
	app.get('/post',function(req,res){
		var path1='./public/postfiles/'+req.session.user.iid;
			//检查目录，不存在就创建
			console.log(path1);
			fs.exists(path1,function(exists){
	        if(exists){
	                console.log("目录存在")
	            }
	        if(!exists){
	            fs.mkdir(path1,function(err){
            		if (err) {
            			console("创建失败"+err);
            		}
			    });
	            };
	        });
		res.render('post',{
			title:'发表',
			user:req.session.user,
			department:req.session.department,
            role:req.session.role,
			success:req.flash('success').toString(),
			error:req.flash("error").toString()
		});
	});

	app.post('/post',checkLogin);
	app.post('/post',function(req,res){

		var currentUser=req.session.user,
		tags=[req.body.tag1,req.body.tag2,req.body.tag3],
			post= new Post(currentUser.iid,currentUser.name,req.session.department,req.session.role,currentUser.head,req.body.title,req.body.mainpost,tags,req.body.post);
			post.save(function(err){
				if (err) {
						req.flash('error',err);
						return res.redirect('/');
					}
					var path2='./public/postfiles/'+req.session.user.iid+'/'+req.body.title;

					//检查目录，不存在就创建
					var files=[];
                    var j=0;
					console.log('start');
					console.log(path2);
					fs.exists(path2,function(exists){
			        if(exists){
			                console.log("目录存在")
			            }
			        if(!exists){
			            fs.mkdir(path2,function(err){
		            		if (err) {
		            			console("创建失败"+err);
		            		}
		            		for (var i in req.files) {
								if (req.files[i].size == 0) {
									//使用同步方式删除一个文件
									fs.unlinkSync(req.files[i].path);
									console.log('success removed an empty file!');
								}else{
									console.log('start add filename'+i);
									files[j]=req.files[i].name;
									console.log(files[j]+j);
							    	var pathnamefile='./public/postfiles/'+req.session.user.iid+'/'+req.body.title+'/'+req.files[i].name;
									var target_path ='./public/tempt/'+req.files[i].name;
									//使用同步方式重命名一个文件
									fs.renameSync(req.files[i].path,target_path);
									//转移文件
									fs.writeFileSync(pathnamefile, fs.readFileSync(target_path));
									//删除文件
									fs.unlink(target_path,function(err){
										if (err) {
											console.log("删除失败"+err);
										}
									});
								};
								j++;
							};
						var filename={
						files1:files[0],
						files2:files[1],
						files3:files[2],
						files4:files[3],
						files5:files[4],
					}
					var newPostfiles=new Postfiles(currentUser.iid,req.body.title,req.body.post,filename);
								newPostfiles.save(function(err){
									console.log(currentUser.iid+req.body.title+req.body.post+files);
									if (err) {
										req.flash('error',err);
										return res.redirect('back');
									}
									req.flash('success','发表成功');
					                return res.redirect('/department');
								});
					    });
			            };
			        });
				});
	});

	app.get('/u/:iid',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
        //检查用户是否存在
		User.get(req.params.iid,function(err,user){
			if (!user) {
				req.flash('error','用户不存在');
				return res.redirect('/');
			}
			//查询并返回用户所有文章
			Post.getTen(req.params.iid,page,function(err,posts,total){
				if (err) {
					req.flash('error',err);
					return res.redirect('/');
				}
				
				res.render('userpost',{
					title:user.iid,
					posts:posts,
					page:page,
					isFirstPage:(page-1)==0,
				    isLastPage:((page-1)*10+posts.length)==total,
					department:req.session.department,
            		role:req.session.role,
					user:req.session.user,
					success:req.flash('success').toString(),
			        error:req.flash("error").toString()
				});
			});
		});
	});


	app.get('/u/:iid/:day/:title',function(req,res){
		Post.getOne(req.params.iid,req.params.day,req.params.title,function(err,post){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('article',{
			title:req.params.title,
			post:post,
			department:req.session.department,
            role:req.session.role,
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash("error").toString()
		});
		});
	});

	app.post('/u/:iid/:day/:title',function(req,res){
		var date=new Date(),
		time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes());
		var md5=crypto.createHash('md5'),
	        email_MD5=md5.update(req.body.email.toLowerCase()).digest('hex'),
	        head="http://www.gravatar.com/avatar/"+email_MD5+"?s=48";
		var comment ={
			iid:req.body.id,
			name:req.body.name,
			head:head,
			email:req.body.email,
			website:req.body.website,
			time:time,
			content:req.body.content
		};
		var newComment=new Comment(req.params.iid,req.params.day,req.params.title,comment);
		newComment.save(function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','留言成功');
			res.redirect('back');
		});
	});



	app.get('/edit/:id/:day/:title',checkLogin);
	app.get('/edit/:id/:day/:title',function(req,res){
		var currentUser=req.session.user;
		Post.edit(currentUser.iid,req.params.day,req.params.title,function(err,post){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			}
			res.render('edit',{
			title:'编辑',
			post:post,
			user:req.session.user,
			department:req.session.department,
            role:req.session.role,
			success:req.flash('success').toString(),
			error:req.flash("error").toString()
		});
		});
	});

	app.post('/edit/:id/:day/:title',checkLogin);
	app.post('/edit/:id/:day/:title',function(req,res){
		var currentUser=req.session.user;
		Post.update(currentUser.iid,req.params.day,req.params.title,req.body.mainpost,req.body.post,function(err){
			var url='/u/'+req.params.id+'/'+req.params.day+'/'+req.params.title;
			if (err) {
				req.flash('error',err);
				return res.redirect(url);
			}
			req.flash('success','修改成功');
			res.redirect('/');
		});
	});

	app.get('/remove/:id/:day/:title',checkLogin);
	app.get('/remove/:id/:day/:title',function(req,res){
		var path='./public/postfiles/'+req.params.id+'/'+req.params.title;
		deleteFolderRecursive(path);

		
		var currentUser=req.session.user;
		Post.remove(currentUser.iid,req.params.day,req.params.title,function(err){
			if (err) {
				req.flash('error',err);
				return res.redirect('back');
			} 
			req.flash('success','删除成功');
			return res.redirect('/');
		});
			   
	});



    app.get('/archive',checkLogin);
	app.get('/archive',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
		Post.getArchive(req.session.department,page,function(err,posts,total){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('archive',{
				title:'存档',
				posts:posts,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+posts.length)==total,
				user:req.session.user,
				department:req.session.department,
            	role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});

	app.get('/tags',function(req,res){
    	Post.getTags(req.session.department,function(err,posts){
    		if (err) {
    			req.flash('error',err);
    			return res.redirect('/');
    		}
    		res.render('tags',{
    			title:'标签',
    			posts:posts,
    			user:req.session.user,
    			department:req.session.department,
            	role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()

    		});
    	});
    });


    app.get('/tags/:tag',function(req,res){
    	Post.getTag(req.params.tag,function(err,posts){
    		if (err) {
    			req.flash('error',err);
    			return res.redirect('/');
    		}
    		res.render('tag',{
    			title:'TAG:'+req.params.tag,
    			posts:posts,
    			user:req.session.user,
    			department:req.session.department,
            	role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()

    		});
    	})
    });




	app.get('/department',checkLogin);
	app.get('/department',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
		Post.getDepost(req.session.department,page,function(err,posts,total){
			if (err) {
				posts=[];
			}
			res.render('department',{
				title:'主页',
				posts:posts,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+posts.length)==total,
				department:req.session.department,
                role:req.session.role,
				user:req.session.user,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});


	app.get('/inpostmanage',checkLogin);
	app.get('/inpostmanage',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
		Post.getArchive(req.session.department,page,function(err,posts,total){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('postmanage',{
				title:'存档',
				posts:posts,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+posts.length)==total,
				user:req.session.user,
				department:req.session.department,
            	role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});

	app.get('/postmanage',checkLogin);
	app.get('/postmanage',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
		Post.getallpost(page,function(err,posts,total){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('postmanage',{
				title:'存档',
				posts:posts,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+posts.length)==total,
				user:req.session.user,
				department:req.session.department,
            	role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
	});

	app.get('/links',function(req,res){
		
			res.render('links',{
				title:'友情链接',
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});	
	});

	app.get('/viewinnumber',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
		User.getdeparpeople(req.session.department,page,function(err,users,total){
			if (err) {
				users=[];
			}
			res.render('viewpeople',{
				title:'主页',
				users:users,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+users.length)==total,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
	});

	app.get('/viewnumber',function(req,res){
		var page=req.query.p ? parseInt(req.query.p) :1;
			User.getTen(page,function(err,users,total){
			if (err) {
				users=[];
			}
			res.render('viewpeople',{
				title:'主页',
				users:users,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+users.length)==total,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
		
	});


	app.post('/searchnumber',function(req,res){
			User.searchnumber(req.body.id,req.body.name,req.session.department,req.body.place,req.body.age,function(err,users){
			if (err) {
				users=[];
			}

			res.render('viewpeople',{
				title:'主页',
				users:users,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
		
	});

	app.post('/searchpost',function(req,res){
			Post.searchpost(req.body.id,req.body.name,req.session.department,req.body.title,function(err,posts){
			if (err) {
				users=[];
			}

			res.render('postmanage',{
				title:'主页',
				posts:posts,
				user:req.session.user,
				department:req.session.department,
                role:req.session.role,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});	
		
	});
    app.get('/imessage',checkLogin);
	app.get('/imessage',function(req,res){
	var page=req.query.p ? parseInt(req.query.p) :1;
    Messages.getTen(page,req.session.user.iid,function(err,messages,total){
			if (err) {
				posts=[];
			}
			res.render('message',{
				title:'主页',
				messages:messages,
				page:page,
				isFirstPage:(page-1)==0,
			    isLastPage:((page-1)*10+messages.length)==total,
				department:req.session.department,
                role:req.session.role,
				user:req.session.user,
				success:req.flash('success').toString(),
			    error:req.flash("error").toString()
			});
		});
    });

    app.post('/imessage',function(req,res){
        var newMessage =new Messages({
	    	reid:req.body.reid,
	    	seid:req.session.user.iid,
	    });
	    var ireid=req.body.reid;
	    var iseid=req.session.user.iid;
	    var date=new Date(),
		time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+""+date.getHours()+":"+(date.getMinutes() < 10 ? ('0' +date.getMinutes()) : date.getMinutes());
	    Messages.get(req.body.reid,req.session.user.iid,function(err,itok){
	    	if (itok) {
	        console.log("111111111111");
            var messages ={
			reid:ireid,
			seid:iseid,
			time:time,
			message:req.body.message
		    };
		    var newCommunication=new Communication(req.body.reid,req.session.user.iid,messages);
            newCommunication.save(function(err){
            var messages ={
			reid:ireid,
			seid:iseid,
			time:time,
			message:req.body.message
		    };
		    var newCommunication=new Communication(req.session.user.iid,req.body.reid,messages);
            newCommunication.save(function(err){

        	if (err) {
				req.flash('error',err);
				return res.redirect('back');
		    }
		    Messages.updatetime(req.body.reid,req.session.user.iid,function(err,itok){

            if (err) {
				req.flash('error',err);
				return res.redirect('back');
		    }
		    Messages.updatetime(req.session.user.iid,req.body.reid,function(err,itok){
            if (err) {
				req.flash('error',err);
				return res.redirect('back');
		    }
		    Messages.updatesignno(req.body.reid,req.session.user.iid,function(err){
		    Messages.updatesignyes(req.session.user.iid,req.body.reid,function(err){
            req.flash('success','消息发送成功');
			res.redirect('/imessage');

		    });
            });

		    });

		    });


            });

            });
	    	}else{
	        console.log("2222222222");
	    	newMessage.save(function(err,messageall){
    		if (err) {
    			req.flash('error',err);
    			return res.redirect('/');
    		}
    	    var messages ={
			reid:req.body.reid,
			seid:req.session.user.iid,
			time:time,
			message:req.body.message
		    };
		    var newCommunication=new Communication(req.body.reid,req.session.user.iid,messages);
    		newCommunication.save(function(err){

    		var newMessage =new Messages({
			    	reid:req.session.user.iid,
			    	seid:req.body.reid,
			    });
			newMessage.save(function(err,messageall){
			    		if (err) {
			    			req.flash('error',err);
			    			return res.redirect('/');
			    		}
			var messages ={
			reid:req.body.reid,
			seid:req.session.user.iid,
			time:time,
			message:req.body.message
		    };
		    var newCommunication=new Communication(req.session.user.iid,req.body.reid,messages);
            newCommunication.save(function(err){
            Messages.updatesignno(req.body.reid,req.session.user.iid,function(err){
            Messages.updatesignyes(req.session.user.iid,req.body.reid,function(err){
            if (err) {
				req.flash('error',err);
				return res.redirect('back');
			    }
			req.flash('success','消息发送成功');
			res.redirect('/imessage');

            });
            });
            });

			});
		});
    	});


	    };

	    });
    	
    });


    app.post('/viewmessage',function(req,res){
    	var page=req.query.p ? parseInt(req.query.p) :1;
        Messages.findone(req.body.seid,req.session.user.iid,function(err,messages){
			if (err) {
				messages=[];
			}
			Messages.updatesignno(req.body.seid,req.session.user.iid,function(err){
            if (err) {
				req.flash('error',err);
				return res.redirect('back');
			    }
			res.render('communication',{
			title:'主页',
			messages:messages,
			department:req.session.department,
            role:req.session.role,
			user:req.session.user,
			success:req.flash('success').toString(),
		    error:req.flash("error").toString()
			});


			});
		});
    	
    });



	app.use(function(req,res){
    	res.render("404");
    })

    function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    };
    };

    function checkLogin(req,res,next){
	if (!req.session.user) {
		req.flash('error','未登入');
		return res.redirect('/login');
	    }
	next();
    }

    function checkNotLogin(req,res,next){
	if (req.session.user) {
		req.flash('error','已登入');
		return res.redirect('back');
	    }
	next();
    }
   
};