// Setup main app/server
var http = require('http'),
	// server
	express = require('express'),
	app = express(),
	server = http.createServer(app),
	// sessions
	session = require('express-session'),
	MemoryStore = session.MemoryStore,
	sessions = new MemoryStore({ reapInterval: 60000 * 10 });
	// main lib
	PNOI = require("pnoi");


// init lib
var pnoi = new PNOI({
	key: "{{KEY}}",
	secret: "{{SECRET}}"
});

// middleware
app.use( session({ secret: "secret", store: sessions, cookie: { maxAge: 86400000 }, resave: false, saveUninitialized: false }) );
// setup passport middleware
pnoi.middleware( app );

// routes
app.get('/', function(req, res){
	if( req.session.user ){
		res.send('<html><body><h2>Authenticated</h2><p>Token: '+ req.session.user.token +'</p></body></html>');
	} else {
		//var auth =
		res.send('<html><body><h2>Login</h2><form action="/auth/pnoi/password"><input name="username" placeholder="username"><input name="password" placeholder="password"><input type="submit"></form></body></html>');
	}
	res.end();
});


app.get('/auth/pnoi/password', password);

app.get('/api/*', function(req, res){
	var uri = req.params[0];
	var path = uri.split("/");
	var params = {
		name: path[0],
		id: path[1] || false,
		type: path[3] || false,
		token: req.user.token
	}
	//
	pnoi.read( params, function(err, result){
		console.log(result);
		res.end( result );
	});
});

function password( req, res, next ){
	var data = req.query;
	pnoi.login( data, function( err, result ){
		if( err ) return console.log("error", err);
		// create user object
		req.session.user = {};
		req.session.user.token = result.access_token;
		// refresh page
		res.redirect("/");
	});

}

// Run server on this port
server.listen(8080);
