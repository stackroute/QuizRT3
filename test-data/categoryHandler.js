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
var fs = require('fs');
var router = express.Router();
var mongoose = require('mongoose');
var Category;
var categoryData;

var Category = require("../models/category");
// var Topic=require("../models/Topic");

var mongoose = require('mongoose');
mongoose.connect('mongodb://172.23.238.253/quizRT');

var db = mongoose.connection;
  // console.log("this is form profile data"+req.params.id);
    Category.find()
      .populate("categoryTopics")
          .exec(function(err,data){
            categoryData = data;
            console.log(JSON.stringify(categoryData, null, 4));
          });
