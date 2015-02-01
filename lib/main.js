var _ = require("underscore"),
	passport = require("passport"),
	defaults = require('../config/options'),
	request = require('request'),
	Strategy = require("passport-pnoi").Strategy;


var API = function( options ){
	// prerequisites
	options = options || {};
	options.callback = options.callback || function(accessToken, refreshToken, profile, done){ return done(null, profile, {}); };
	if( !options.key || !options.secret ) return;
	// extend default options
	this.options = _.extend({}, defaults, options);
	// always get an application token
	this.token();
	// setup passport to be ready for client-side auth
	passport.use(new Strategy({
		clientID: options.key,
		clientSecret: options.secret,
		callbackURL: "/auth/pnoi/callback", // option?
		url: options.url || false // customize for a third-party server (no trailing slash)
	}, options.callback));
	// is this optional?
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});
	return this;
}

API.prototype = {

	// mirror of passport's authentication method
	auth: function(){
		if( arguments[1] ) {
			return passport.authenticate('pnoi', arguments[0], arguments[1]);
		} else {
			return passport.authenticate('pnoi', arguments[0]);
		}
	},

	// add as a middleware for every subsequent request...
	// initialize app middleware
	middleware: function( app ){
		app.use( passport.initialize() );
		app.use( passport.session() );
	},

	// expose passport
	passport: function(){
		return passport;
	},

	// Item methods
	data: {},

	get: function( key ){
		return this.data[key] || null;
	},

	set: function( data ){
		_.extend( this.data, data );
		// allow chainability
		return this;
	},

	// CRUD

	create: function( params ){
		// query
	},

	read: function( params, callback ){
		// query
		var self = this;
		var url = this.options.url +"/api/";
		var token = this._token;
		//
		if(typeof params == "string"){
			// this is the complete api uri
			var path = params;
			// FIX: remove leading slash
			if( path.substring(0, 1) === "/" ) path = path.substring(1);
			url += path;
		} else if(typeof params == "object"){
			// assume it's an object
			// schema #1
			if( params.path ){
				// FIX: remove leading slash
				var path = params.path;
				if( path.substring(0, 1) === "/" ) path = path.substring(1);
				url += path;
			}
			// version 2
			if( params.name ) url += params.name;
			if( params.id ) url += "/"+ params.id;
			if( params.type ) url += "/"+ params.type;
			// use user token if passed
			if( params.token ) token = params.token; // or user.token ?
		} else {
			// exit now
			callback({ code: 400, message: "not a valid query" });
		}
		//var request = {};
		// save in memory
		//this.set( request );
		request.get( url, {
			'auth': {
				'bearer': token
			}
		}, function( error, response, result ){
			callback( null, result );
		});
	},

	update: function( params ){
		// query
	},

	destroy: function( params ){
		// query
	},

	// alias for destroy (delete)...
	del: function( params ){
		return this.destroy( params );
	},

	// request application-level token
	token: function(){
		// return existing token, if available
		if( this._token ) return this._token;
		// variables
		var self = this;
		// application only authentication, executed on the server-side
		request.get( this.options.url +"/oauth/token?client_id="+ this.options.key +"&client_secret="+ this.options.secret +"&grant_type=client_credentials",
		function( error, response, result ){
			// output error
			if( error ) return console.log(error);
			if( !result ) return;
			// parse token
			var data = JSON.parse( result );
			if( data.error ) return console.log( data.message );
			// save for later
			self._token = data.access_token;
		});
	},

	// user login using username/password
	login: function( creds, callback ){

		var self = this;
		// filter data?
		//
		request.get( this.options.url +"/oauth/token?client_id="+ this.options.key +"&client_secret="+ this.options.secret +"&username="+ creds.username +"&password="+ creds.password +"&grant_type=password",
		function( error, response, result ){
			// output error
			if( error ) return callback(error);
			if( !result ) return callback("no_valid_creds");
			// parse token
			var data = JSON.parse( result );
			// save for later
			callback(null, data);
		});
	}

}

module.exports = function( options ){
	return new API( options );
}