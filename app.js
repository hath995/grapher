var express = require('express');
var consolidate = require('consolidate');
var Handlebars = require("handlebars");
var app = express();
var fs = require('fs');
var i18n = new (require('i18n-2'))({locales: ['en', 'ja']}); // setup some locales - other locales default to the first locale
var Constants = require('./dbsettings');
var mongoose = require('mongoose');
var crypto = require('crypto');
var mdb = mongoose.connect("mongodb://"+Constants.DBUSER+":"+Constants.DBPASS+"@localhost/test");

var UserSchema = new mongoose.Schema({
	username: String,
	email: String,
	pass: String
});

var DataSchema = new mongoose.Schema({
	name: String,
	funcs: mongoose.Schema.Types.Mixed,
	points: mongoose.Schema.Types.Mixed,
	hasPoints: Boolean,
	hasFunctions: Boolean,
	user:String
});

var Users = mongoose.model('grapherUsers',UserSchema);
var DataSets = mongoose.model('grapherData',DataSchema);

Handlebars.registerHelper('I18n', function(str) {
	return i18n.__(str);
});

//app.configure('dev',function() {
app.configure(function() {
	app.use(express.logger({format:'default',
		stream:fs.createWriteStream("site.log",{flags:'w+'})}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({"secret":"Ik1QaMPUbNet3k7fkkgpnHL73QIRbycswPOWUfQc04WTuhFZoOsbl4u0sp9EN9AZpyIdgiT74BQ4t9I0"}));
	app.set('port', process.env.PORT || 3001);
	app.set('view engine', 'html');
	app.engine('html', consolidate.handlebars);
	app.set('views', __dirname + '/views');
	app.use(app.router);
	app.use(express.static(__dirname + '/prod'));
	//app.enable("view cache")
});
//app.engine('html', require('hbs').__express);

app.get('/', function(req, res) {
	var data = {
		test: "A VALUE FROM HBS!"	
	}
	return res.render('index', data);
});

app.get('/lang/:lang/?',function(req,res) {
	i18n.setLocale(req.params.lang);
	res.redirect('/');
});


app.post('/users/?',function(req, res) {
	var post = req.body;
	var sha_hash = crypto.createHash('sha512');
	sha_hash.update(post.pass1+Constants.HASH_SALT,'utf8');
	var newuser = new Users({
		username:post.nuname,
		email:post.nuemail,
		pass:sha_hash.digest('hex')		
	}).save(function(err, user) {
		if(err) {
			res.json(err);
		}else{
			var test = user;
			test.loggedin = true;
			req.session.loggedin = true;
			req.session.username = user.username;
			res.json(test);
		}
	});
});

app.get('/users/?',function(req, res) {
	
});

app.get('/users/:user',function(req, res) {

});

app.post('/login/',function(req, res) {
	var post = req.body;
	var sha_hash = crypto.createHash('sha512');
	sha_hash.update(post.upass+Constants.HASH_SALT,'utf8');
	var hashedpass = sha_hash.digest('hex');
	Users.find({username: post.uname},function(err, user) {
		var passmatched = false;
		if(user[0].pass == hashedpass) {
			passmatched = true;
			req.session.loggedin = true;
			req.session.username = user[0].username;
			res.json({"_id":user[0]._id,
				"username":user[0].username
			});
		}else{

			res.json({login:"invalid","matched":passmatched});
		}	
		/*
		res.json({"_id":user[0]._id,
			"username":user[0].username,
			"wtf":"arg"
			});
		*/

	});
});
/*
ROUTES
POST:Users/
GET:Users/:user

POST:/login/
POST:/logout/

POST:db/datasets/:dsname
GET:db/datasets/:dsname
DELETE:db/datasets/:dsname
*/

app.listen(app.get('port'));
