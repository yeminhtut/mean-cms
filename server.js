var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var path 	   = require('path');
var User = require('./models/user');
var jwt = require('jsonwebtoken');
var superSecret = 'iamsuperscret';


// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

//connect database
mongoose.connect('mongodb://yemin:yemin123@apollo.modulusmongo.net:27017/toBa8nuq');

//Route
// app.get('/',function(req,res){
// 	res.send("Welcome to home page");
// });

userRouter = express.Router();

userRouter.route('/')
	.get(function(req,res){
		User.find(function(err,users){
				if(err) res.send(err);
				res.json(users);
			});
	});

userRouter.post('/authenticate',function(req,res){
		User.findOne({username:req.body.username}).select('name username password').exec(function(err,user){
			if(err) throw err;
			if(!user){
				res.json({success:false,message:"Authentication failed, user not found"});
			}
			else if(user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.json({success:false,message:"Authentication failed, invalid password"});
				}
				else{
					// create a token
					var token = jwt.sign(
										{name: user.name,username: user.username},
										superSecret, 
										{expiresIn: "10h" });
					res.json({success:true,message:'Enjoy your token',token:token});
				}				
			}			
		})
		//res.json(req.body.username);
	});



app.use('/user',userRouter);

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.listen(8080);
console.log("Server start running");