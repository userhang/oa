var mongodb=require('./db');


function Postfiles(id,title,post,file){
	this.id=id,
	this.post=post,
	this.title=title,
	this.file=file
}

module.exports=Postfiles;
//公告文件存储
Postfiles.prototype.save=function(callback){
	var id=this.id,
	post=this.post,
	title=this.title,
	file=this.file;
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
				"title":title
			},{
				$push:{"files":file}
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