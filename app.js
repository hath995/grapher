var express = require('express');
var consolidate = require('consolidate');
var Handlebars = require("handlebars");
var app = express();
var fs = require('fs');
var i18n = new (require('i18n-2'))({locales: ['en', 'ja']}); // setup some locales - other locales default to the first locale

Handlebars.registerHelper('I18n', function(str) {
	return i18n.__(str);
});

//app.configure('dev',function() {
app.configure(function() {
	app.use(express.logger({format:'default',
		stream:fs.createWriteStream("site.log",{flags:'w+'})}));
	app.use(express.bodyParser());
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

app.listen(app.get('port'));
