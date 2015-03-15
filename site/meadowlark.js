var express = require('express');
var app = express();
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main'});
var fortune = require('./lib/fortune.js');

app.disable('x-powered-by');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

console.log("Start");

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/about', function(req, res) {
	res.render('about', { fortune: fortune.getFortune(), pageTestScript: "/qa/tests-about.js" });
});

app.get('/tours/hood-river', function(req, res) {
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res) {
	res.render('tours/request-group-rate');
});

//
// Tours API
//

var tours = [
	{ id: 0, name: 'HoodRiver', price: 99.99 },
	{ id: 1, name: 'OregonCoast', price: 149.95 }
];

//
// Build an XML representation of an array of tours.
//
function buildToursXml(t) {
	var toursXml = '<?xml version="1.0"?><tours>' +
			t.map(function(p) {
				return '<tour price="' + p.price + '" id="' + p.id + '">' + p.name + '</tour>';
			}).join('') + '</tours>';
	return toursXml;
}

//
// Build a plain text representation of an array of tours.
//
function buildToursText(t) {
	var toursText = t.map(function(p) {
		return p.id + ': ' + p.name + ' (' + p.price + ')';
	}).join('\n');
	return toursText;
}

app.get('/api/tours', function(req, res) {
	res.format({
		'application/json': function() {
			res.json(tours);
		},
		'application/xml': function() {
			res.type('application/xml');
			res.send(buildToursXML(tours));
		},
		'text/xml': function() {
			res.type('text/xml');
			res.send(buildToursXML(tours));
		},
		'tetx/plain': function() {
			res.type('text/plain');
			res.send(buildToursText(tours));
		}
	});
});

app.put('/api/tour/:id', function(req, res) {
	console.log("Putting to id: <" + req.params.id + "> ");
	var p = tours.some(function(p) { return p.id == req.params.id; });
	if (p) {
		if (req.query.name) p.name = req.query.name;
		if (req.query.price) p.price = req.query.price;
		res.json({ success: true});
	} else {
		res.json({error: 'No such tour exists.'});
	}
});

app.delete('/api/tour/:id', function(req, res) {
	var i;
	for (var i=tours.length-1; i >= 0; i--)
		if (tours[i].id == req.params.id) break;
	if (i >= 0) {
		tours.splice(i, 1);
		res.json({success: true});
	} else {
		res.json({error: 'No such tour exists.'});		
	}
});


// debug pages

app.get('/debug/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = "";
	for (var name in req.headers) s += name + ':' + req.headers[name] + '\n';
	res.send(s);
});

app.get('/debug/request', function(req, res) {
	var rmap = {
		params : req.params,
		query : req.query,
		body : req.body,
		route : req.route,
		cookies : req.cookies,
		headers : req.headers,
		ip : req.ip,
		host : req.hostname,
		protocol : req.protocol,
		originalUrl : req.originalUrl
	};
//	res.json(JSON.stringify(rmap));
	res.json(rmap);
});

// custom 404 page
app.use(function(req, res){
        res.status(404);
        res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500);
        res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});