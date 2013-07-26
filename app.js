var express = require('express');
var consolidate = require('consolidate');
var Handlebars = require("handlebars");
var app = express();
//var i18n = new (require('i18n-2'))({locales: ['en', 'ja']}); // setup some locales - other locales default to the first locale
var i18n = new (require('i18n-2'))({locales: ['ja','en']}); // setup some locales - other locales default to the first locale

Handlebars.registerHelper('I18n', function(str) {
	return i18n.__(str);
});

app.set('view engine', 'html');
app.engine('html', consolidate.handlebars);
//app.engine('html', require('hbs').__express);
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/prod'));
app.get('/', function(req, res) {
	var data = {
		test: "A VALUE FROM HBS!"	
	}
	return res.render('index', data);
});

app.listen(3001);
