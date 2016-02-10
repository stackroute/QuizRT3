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

var mongoose = require('mongoose'),
    Topic=require('./topic'),
    Tournament = require('./tournament'),
    profileSchema = mongoose.Schema({
      userId: {type:String, unique:true},
      name:String,
      age:Number,
      imageLink:String,
      country:String,
      flagLink:String,
      badge:String,
      totalGames:Number,
      wins:Number,
      topicsPlayed:[{
        gamesWon: Number,
        gamesPlayed:Number,
        level:Number,
        isFollowed:Boolean,
        points:Number,
        topicId: {type:String, ref: 'Topic'}
      }],
      tournaments: [{
        tournamentId:{ type: String, ref: 'Tournament'},
        status:String, //can be amongst "FOLLOWED","PLAYING", or "COMPLETED"
        levelCleared:Number,
        finalLevel:Number,
        levelPoints:Array
      }]
    },
    {strict:false}),
    Profile = mongoose.model('Profile', profileSchema, "profile_collection");

module.exports = Profile;
