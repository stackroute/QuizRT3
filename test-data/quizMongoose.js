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
 
fs = require('fs');
var slugify = require('slugify');
var Quiz = require('../models/quiz.js');


 fs.readFile('quiz.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var json=JSON.parse(data);

  var mongoose = require('mongoose');
  mongoose.connect('mongodb://172.23.238.253/quizRT');

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function (callback) {
  // console.log('connection open');
//console.log(json);

//console.log(json.length);
 for(i=0;i<json.length;++i)
 {
 var quiz1 = new Quiz(json[i]);

    quiz1.save(function(err){
    if ( err ) console.log(err);
    console.log("Quiz Saved Successfully");
 });
 }
 console.log('closing mongo');
 //mongoose.disconnect();
 });//end once


});//end readfile
