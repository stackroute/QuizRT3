
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
//                       + Anil Sawant

var express = require('express'),
    router = express.Router(),
    Profile = require("../models/profile"),
    userSettingsHandler = require('./userSettingsHandler');

router.get('/profileData', function(req, res, next) {
  if ( req.session && req.session.user ) {
    console.log('Authenticated user: ' + req.session.user.local.username);
    if( !(req.session.user == null) ){
      var usr = req.session.user.local.username;
      Profile.findOne({userId: usr})
        .populate("topicsPlayed.topicId")
            .exec(function(err,profileData){
              if (err) {
                console.log('Database error. Could not load user profile.');
                res.writeHead(500, {'Content-type': 'application/json'});
                res.end(JSON.stringify({ error:'We could not load your profile properly. Try again later.'}) );
              }else if( !profileData ){
                console.log('User not found in database.');
                res.writeHead(500, {'Content-type': 'application/json'});
                res.end(JSON.stringify({ error: 'We could not find you in our database. Try again later.'}) );
              }else {
                res.json({ error: null, user:profileData });
              }
            });
    }
  } else {
    console.log('User not authenticated. Returning.');
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Failed to create user session. Kindly do a fresh Login.' }) );
  }
 });

// add user profile sub-hadlers here
router.use('/userSettings', userSettingsHandler );

module.exports = router;
