var express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
var router = express.Router();
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
	res.render('register',{title:'Register'});

});

router.get('/login', function(req, res, next) {
	res.render('login',{title:'Login'});

});
router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','you have logout');
	res.redirect('/users/login');
});
// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

//defining local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },function(username,password,done){
		console.log(password+'in strategy about'+username);
		User.getUserByEmail(username,function(err,user){
			if(err) throw err;
			if (!user) {
				console.log('unknown user');
				return done(null,false,{message:'unknown user'});

			};

			User.comparePasswords(password,user.password,function(error,isMatch){
				if(error) throw error;
				if (isMatch) {
					console.log('password matched');
					return done(null,user);
				}else{
					console.log('invalide password');
					return done(null,false,{message:'invalide password'});
				}
			});

		});

	}
));
// router.post('/login', function(req, res){
//   console.log("body parsing", req.body);
//   //should be something like: {username: YOURUSERNAME, password: YOURPASSWORD}
// });

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'invalid username or password ' }),
            function(req, res) {
                console.log(req.user.email+' is successfully logged in.');
                	req.flash('success','You are Logged In');
					res.redirect('/');
            });


// router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'invalide username or password'}),function(req,res){
// 	console.log('authentication successful ');
// 	req.flash('success','You are Logged In');
// 	res.redirect('/')
// });

router.post('/register',upload.single('profileImage'),  function(req, res, next) {

	var name=req.body.name;
	var email=req.body.email;
	var userName=req.body.user_name;
	var password=req.body.password;
	var password2=req.body.password2;

	//check for profileImage
	if(req.file){
		console.log("uploading file");
		var originalName=req.file.originalname;
		var profileImageName=req.file.name;
		console.log(req.file.originalname);
		var profileImageMime=req.file.mimtype;
		var profileImagePath=req.file.path;
		var profileImageExten=req.file.extension;
		var profileImageSize=req.file.size;

	}else{
		var profileImageName='noImage.png';
	}

	//Form validation
	req.checkBody('name','Name Field is Required').notEmpty();
	req.checkBody('email','Please Enter Valid Email').isEmail();
	req.checkBody('username','User Name Field is Required').notEmpty();
	req.checkBody('password','password Field is Required').notEmpty();
	req.checkBody('password2','passwords do not match').equals(password2);

	//check for Erros
	req.getValidationResult().then(function(result){
		if(!result.isEmpty()){
			res.render('register',{
				errors:result.array(),
				name:name,
				email:email,
				userName:userName,
				password:password,
				password2:password2
			});
		}else{
			var newUser=new User({
				name:name,
				email:email,
				userName:userName,
				password:password,
				profileImage:profileImageName

			});

			// create user
			User.createUser(newUser,function(error,user){
				if(error) throw error;
				console.log(user);
			});

			//success message
			req.flash('success','you are now registerd. you may login');

			// redirect to home
			res.location('/');
			res.redirect('/');
		}

	});



});
module.exports = router;
