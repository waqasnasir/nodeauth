var mongoose=require('mongoose');
var bcrypt = require('bcrypt-nodejs');
mongoose.connect('mongodb://root:ELWmHMv9LbxW@35.224.121.151:27017/admin')
var db=mongoose.connection;


//user schema
var UserSchema=mongoose.Schema({
	username:{
		type:String,
		index:true,
	},
	password:{
		type:String,
		bcrypt:true,

	},
	email:{
		type:String
	},
	name:{
		type:String
	},
	profileImage:{
		type:String
	}
});

var User=module.exports=mongoose.model('User',UserSchema);

module.exports.comparePasswords=function (password,hash,callback) {
	// body...
	bcrypt.compare(password,hash,function(err,isMatch){
		if (err) return callback(err);

		callback(null,isMatch);

	})
}


module.exports.createUser=function (newUser,callback) {
	// body...
	bcrypt.hash(newUser.password,null,null,function(err,hash){
				if (err) return callback(err);
				newUser.password=hash;
				newUser.save(callback);

			});

}
module.exports.getUserByEmail=function (username,callback) {
	// body...
	var query={email:username};
	User.findOne(query,callback);

}
module.exports.getUserById=function (id,callback) {
	// body...

	User.findById(id,callback);

}
