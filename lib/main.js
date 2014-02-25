var _ = require("underscore"),
	passport = require("passport"),
	apiStrategy = require("passport-pnoi");



var API = function( options ){
	// prerequisites
	options = options || {};
	options.callback = function(){};
	if( !options.key || !options.secret ) return;
	// authenticate
	passport.use(new apiStrategy({
		key: options.key,
		secret: options.secret,
		callbackURL: "/auth/pnoi/callback" // option?
	}, options.callback));
	// add as a middleware for every subsequent request...
	passport.authenticate('basic', { session: false });
}

API.prototype = {

	auth: false,

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

	read: function( params ){
		// query
		var request = {};
		// save in memory
		this.set( request );
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
	}

}

return function( options ){
	new API( options );
}