var mongodb=require('./db');


function Communication(seid,reid,message){
	this.seid=seid,
	this.reid=reid,
	this.message=message
}

module.exports=Communication;

Communication.prototype.save=function(callback){
	var reid=this.reid,
	seid=this.seid,
	message=this.message;
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
				$push:{"imessage":message}
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