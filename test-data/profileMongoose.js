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
var fs = require('fs');
var profileData = JSON.parse(fs.readFileSync('nishant.json'));
mongoose.connect('mongodb://172.23.238.253/quizRT');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function (callback) {

var ayush=
  console.log('connection open');
var Profile = require("../models/profile.js");

  var profile1 = new Profile(profileData);

  profile1.save(function(err){
    if ( err ) console.log(err);
    console.log(profileData.name +" profile Saved Successfully");
    console.log('closing mongo');
    mongoose.disconnect();
  });

});
