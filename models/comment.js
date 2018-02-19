var mongodb=require('./db');


function Comment(id,day,title,comment){
	this.id=id,
	this.day=day,
	this.title=title,
	this.comment=comment
}

module.exports=Comment;

Comment.prototype.save=function(callback){
	var id=this.id,
	day=this.day,
	title=this.title,
	comment=this.comment;
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
				$push:{"comments":comment}
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