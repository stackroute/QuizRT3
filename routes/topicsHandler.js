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

var express = require('express'),
    router = express.Router(),
    Category = require("../models/category"),
    Topic = require("../models/topic"),
    Profile =require("../models/profile"),
    findPercentage = function(points,level) {
      return ((points-levelScore(level))/(levelScore(level+1)-levelScore(level)))*100;
    },
    levelScore = function(n) {
      return ((35 * (n * n)) +(95*n)-130);
    },
    findLevel = function(points) {
      i=1;
      while(points>=levelScore(i)) {
        i++;
      }
      return i-1;
    };

router.route('/categories')
  .get( function(req, res){
    Category.find()
      .populate("categoryTopics")
      .exec(function(err,categories){
        if(err){
            return res.send(err);
          }
        return res.json(categories);
      });
});

router.route('/category/:categoryId')
  .get(function(req, res){
	   Category.findById(req.params.categoryId)
      .populate("categoryTopics")
        .exec(function(err, category){
    			if(err)
    				return res.send(err);
    			return res.json(category);
	      });
});


router.route('/topic/:topicId')
  .get( function(req,res) { // retrieve a topic's details
    var topicWithUserStats = {
      topicId: '',
      topicName: '',
      topicDescription: '',
      topicIcon: '',
      topicFollowers: 0,
      playersPerMatch: 2,
      userStats : {
        topicWins: 0,
        topicLosses: 0,
        topicLevel: 1,
        levelPercentage: 0,
        isFollowed: false,
        points: 0
      }
    };

    if ( req.session && req.session.user ) {
      Profile.findOne( {userId: req.session.user} )
      .exec( function(err, userProfileData ) {
        if(err) {
          res.writeHead(500, {'Content-type': 'application/json'} );
          res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
        } else {
          var topicsPlayed = userProfileData.topicsPlayed,
              len = topicsPlayed.length;

          for(var i = 0; i < len; ++i ) {
            if( topicsPlayed[i].topicId === req.params.topicId ) {
              topicWithUserStats.userStats.topicWins = topicsPlayed[i].gamesWon;
              topicWithUserStats.userStats.topicLosses = topicsPlayed[i].gamesPlayed - topicsPlayed[i].gamesWon;
              topicWithUserStats.userStats.topicLevel = topicsPlayed[i].level;
              topicWithUserStats.userStats.isFollowed = topicsPlayed[i].isFollowed;
              topicWithUserStats.userStats.points = topicsPlayed[i].points;
              topicWithUserStats.userStats.levelPercentage = findPercentage( topicsPlayed[i].points, topicsPlayed[i].level );
              break;
            }
          }

          Topic.findById( req.params.topicId )
            .exec(function(err,topic) {
              if(err) {
                res.writeHead(500, {'Content-type': 'application/json'} );
                res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
              } else {
                topicWithUserStats.topicId = topic._id;
                topicWithUserStats.topicName = topic.topicName;
                topicWithUserStats.topicDescription = topic.topicDescription;
                topicWithUserStats.topicIcon = topic.topicIcon;
                topicWithUserStats.topicFollowers = topic.topicFollowers;
                topicWithUserStats.playersPerMatch = topic.playersPerMatch;
                res.json( { error: null, topicWithUserStats: topicWithUserStats } );
              }
            });
        }
      });
    } else {
      console.log('User not authenticated. Returning from topicsHandler.');
      res.writeHead(401);
      res.end( JSON.stringify({ error: 'User session does not exist. Kindly do a fresh Login.' }) );
    }
  })
  .put( function(req,res) { // set isFollowed for the topic in user's profile and increment/decrement no of followers in topic
    if ( req.session && req.session.user ) {
      Profile.findOne( {userId: req.session.user} )
      .exec( function(err, userProfileData ) {
        if(err) {
          res.writeHead(500, {'Content-type': 'application/json'} );
          res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
        } else {
          var topicsPlayed = userProfileData.topicsPlayed,
              len = topicsPlayed.length,
              topicFound = false,
              topicFollowState = false;

          for(var i = 0; i < len; ++i ) {
            if( topicsPlayed[i].topicId === req.params.topicId ) {
              topicFound = true;
              topicFollowState = !topicsPlayed[i].isFollowed;
              topicsPlayed[i].isFollowed = topicFollowState;
              break;
            }
          }

          // user clicked on follow for the first time so add this new topic to topicsPlayed
          if ( !topicFound ) {
            var newTopic = {
              'topicId': req.params.topicId,
              'isFollowed': true,
              'gamesWon': 0,
              'gamesPlayed': 0,
              'level': 1,
              'points': 0
            }
            topicFollowState = true; // user clicked on follow for the first time so isFollowed = true
            userProfileData.topicsPlayed.push( newTopic );
          }
          userProfileData.save( function(err, savedDoc) {
            if ( err ) {
              console.error(err);
              res.writeHead(500, {'Content-type': 'application/json'} );
              res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
            }else {
              // increment/decrement topicFollowers of a topic by 1
              var queryObj = {'$inc': {'topicFollowers': -1}};
              if ( topicFollowState ) {
                queryObj = {'$inc': {'topicFollowers': 1}};
              }
              Topic.findOneAndUpdate( {'_id': req.params.topicId}, queryObj, {upsert:false}, function(err, doc){
                if(err) {
                  console.error('Failed to increment topicFollowers of a topic');
                  res.writeHead(500, {'Content-type': 'application/json'} );
                  res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
                } else {
                  res.json( { error: null, userTopicFollowState: topicFollowState } );
                }
              });
            }
          });
        }

      });
    } else {
      console.log('User not authenticated. Returning from topicsHandler.');
      res.writeHead(401);
      res.end( JSON.stringify({ error: 'User session does not exist. Kindly do a fresh Login.' }) );
    }

    /*
    ** Use the following mongo queries to optimize performance
    ** db.collection.update( {'userId': 12345, 'topicsPlayed.topicId': req.params.topicId }
                             ,{ '$set': { 'topicsPlayed.$.isFollowed':true}})

      db.collection.update( {'userId': 12345, 'topicsPlayed.topicId': {'$ne':req.params.topicId} }
                            ,{'$addToSet': {'topicsPlayed': {newTopic object}}})
    */

  })
  .post( function(req,res) { // used to save updates to userProfile and Topic when user hits play now.
    if ( req.session && req.session.user ) {
      Profile.findOne( {userId: req.session.user} )
      .exec( function(err, userProfileData ) {
        if(err) {
          res.writeHead(500, {'Content-type': 'application/json'} );
          res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
        } else {
          var topicsPlayed = userProfileData.topicsPlayed,
              len = topicsPlayed.length,
              topicFound = false;

          for(var i = 0; i < len; ++i ) {
            if( topicsPlayed[i].topicId === req.params.topicId ) {
              topicFound = true;
              topicsPlayed[i].gamesPlayed++;
              break;
            }
          }

          if ( !topicFound ) {
            var newTopic = {
              'topicId': req.params.topicId,
              'isFollowed': false,
              'gamesWon': 0,
              'gamesPlayed': 1,
              'level': 1,
              'points': 0
            }
            userProfileData.topicsPlayed.push( newTopic );
          }
          userProfileData.save( function(err, savedDoc) {
            if ( err ) {
              console.error(err);
              res.writeHead(500, {'Content-type': 'application/json'} );
              res.end( JSON.stringify({ error: 'We are facing problem with our database. Try after some time.' }) );
            }else {
              res.json( { error: null, updatedUser:savedDoc} );
            }
          });
        }
      });
    } else {
        console.log('User not authenticated. Returning from topicsHandler.');
        res.writeHead(401);
        res.end( JSON.stringify({ error: 'User session does not exist. Kindly do a fresh Login.' }) );
    }
  });
  module.exports= router;
