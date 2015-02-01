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

var token; // placeholder to save token later

// init lib
var pnoi = new PNOI({
	key: "{{KEY}}",
	secret: "{{SECRET}}",
	callback: function( accessToken, refreshToken, profile, done ){
		token = accessToken;
		done(null, profile, {});
	}
});

// middleware
app.use( session({ secret: "secret", store: sessions, cookie: { maxAge: 86400000 }, resave: false, saveUninitialized: false }) );
// setup passport middleware
pnoi.middleware( app );

// routes
app.get('/', function(req, res){
	if( req.user ){
		res.send('<html><body><h2>Authenticated</h2><p>User: '+ req.user.displayName +'</p><p>Token: '+ token +'</p></body></html>');
	} else {
		//var auth =
		res.send('<html><body><a href="/auth/pnoi">Login</a></body></html>');
	}
	res.end();
});


app.get('/auth/pnoi', pnoi.auth());

app.get('/auth/pnoi/callback', pnoi.auth({ successRedirect: '/', failureRedirect: '/'}) );

// 1-1 api endpoing mapping
app.get('/api/*', function(req, res){
	var uri = req.params[0];
	var path = uri.split("/");
	var params = {
		name: path[0],
		id: path[1] || false,
		type: path[3] || false,
		token: token
	}
	//
	pnoi.read( params, function(err, result){
		console.log(result);
		res.end( result );
	});
});


// Run server on this port
server.listen(8080);
