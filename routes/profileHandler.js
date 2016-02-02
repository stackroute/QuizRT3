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
 
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var Profile = require("../models/profile");
router.get('/profileData', function(req, res, next) {

   console.log(req.session.user);
   if(req.session.user == null){
     var usr = "qqqq";
   }
   else{
      var usr = req.session.user.local.username;
   }

  // console.log(usr + " ##########################################");
  // console.log("this is from profile controller\n"+req.session.isLoggedIn);
       Profile.findOne({userId: usr})
         .populate("topicsPlayed.topicId")
             .exec(function(err,data){
               profileData = data;
                res.json(profileData);
 });
 });
module.exports = router;
