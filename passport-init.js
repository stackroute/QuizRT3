//Copyright {2016} {NIIT Limited, Wipro Limited}
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//   Name of Developers  Raghav Goel, Kshitij Jain, Lakshay Bansal, Ayush Jain, Saurabh Gupta, Akshay Meher
//

var mongoose = require('mongoose');
var User = require('./models/user');
var Profile=require('./models/profile');
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./config/auth');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		//console.log('serializing user:',user.username);
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			//console.log('deserializing user:',user.username);
			done(err, user);
		});
	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) {
			// check in mongo if a user with username exists or not
			User.findOne({ 'local.username' :  username },
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
					// Username does not exist, log the error and redirect back
					if (!user){
						console.log('User Not Found with username '+username);
						return done(null, false);
					}
					// User exists but wrong password, log the error
					if (!isValidPassword(user, password)){
						console.log('Invalid Password');
						return done(null, false); // redirect back to login page
					}
					// User and password both match, return user from done method
					// which will be treated like success
					return done(null, user);
				}
			);
		}
	));

	passport.use('register', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {
           console.log("**********Hello*************");
           console.log(req.body.country);
           console.log("**********Hello*************");
			// find a user in mongo with provided username
			User.findOne({ 'local.username' :  username }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
					console.log('Error in register: '+err);
					return done(err);
				}
				// already exists
				if (user) {
					console.log('User already exists with username: '+username);
					return done(null, false);
				} else {
					// if there is no user, create the user
					var newUser = new User();
          var newProfile=new Profile();
					// set the user's local credentials
					newUser.local.username = username;
					newUser.local.password = createHash(password);
					newProfile.userId = username;
          newProfile.country=req.body.country;
					newProfile.age=req.body.age;
					newProfile.name=req.body.DisplayName;
					newProfile.topicsPlayed=[];
					newProfile.badge="Beginner";
          if(req.body.imageLink.length==0)
          {
					newProfile.imageLink="/images/userProfileImages/user.png";
        }
        else {
          newProfile.imageLink=req.body.imageLink;
        }
					newProfile.wins=0;
					newProfile.totalGames=0;
           console.log("**********************");
					console.log(newProfile);
					   console.log("**********************");
					// save the user
					newUser.save(function(err) {
						if (err){
							console.log('Error in Saving user: '+err);
							throw err;
						}
						console.log(newUser.local.username + ' Registration succesful');
						return done(null, newUser);
					});
					newProfile.save(function(err) {
						if (err){
							console.log('Error in Saving user: '+err);
							throw err;
						}
						console.log(newProfile.userId + ' Registration succesful');
						return done(null, newProfile);
					});
				}
			});
		})
	);

	passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
			profileFields:['id','email','name','displayName','photos']
	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		User.findOne({'facebook.id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.facebook.id = profile.id;
	    				newUser.facebook.token = accessToken;
	    				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	    				newUser.facebook.email = profile.emails[0].value;

							var newProfile=new Profile();
							newProfile.userId = profile.id;
							newProfile.name=profile.name.givenName +' ' + profile.name.familyName;
							newProfile.country='India';
		 					newProfile.age=20;
		 					//newProfile.name=req.body.DisplayName;
		 					newProfile.topicsPlayed=[];
		 					newProfile.badge="Beginner";
		 					newProfile.imageLink=profile.photos[0].value;
		 					newProfile.wins=0;
		 					newProfile.totalGames=0;
		            console.log("**********************");
		 					console.log(newProfile);
	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    				console.log(profile);
							newProfile.save(function(err) {
								if (err){
									console.log('Error in Saving user: '+err);
									throw err;
								}
								//req.session.user = newUser;
								console.log(newProfile.userId + ' Registration succesful');
								return done(null, newUser);
							});
	    			}
	    		});
	    	});
	    }

	));

	passport.use(new GoogleStrategy({
	    clientID: configAuth.googleAuth.clientID,
	    clientSecret: configAuth.googleAuth.clientSecret,
	    callbackURL: configAuth.googleAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		User.findOne({'google.id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
	    				var newUser = new User();
	    				newUser.google.id = profile.id;
	    				newUser.google.token = accessToken;
	    				newUser.google.name = profile.displayName;
	    				newUser.google.email = profile.emails[0].value;

	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				})
	    				console.log(profile);
	    			}
	    		});
	    	});
	    }

	));

	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.local.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};
