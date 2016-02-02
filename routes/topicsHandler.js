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
var router = express.Router();
var mongoose = require( 'mongoose' );
var bodyParser = require('body-parser');
var Category = require("../models/category");
var Topic = require("../models/topic");
var Profile =require("../models/profile");
var topicInst;
var topic1={};
var points = 0;
var level =1;

findPercentage = function(points,level)
{
  return ((points-levelScore(level))/(levelScore(level+1)-levelScore(level)))*100;
}

levelScore = function(n)
{
  return ((35 * (n * n)) +(95*n)-130);
}
findLevel = function(points){

  i=1;
  while(points>=levelScore(i))
  {
    i++;
  }

  return i-1;

}
 router.route('/categories')
  .get(function(req, res){
    Category.find()
      .populate("categoryTopics")
          .exec(function(err,categories){
            if(err){
                return res.send(err);
              }
            return res.json(categories);
          });
 	});
  router.route('/category/:id')
	.get(function(req, res){
		Category.findById(req.params.id)
      .populate("categoryTopics")
        .exec(function(err, category){
      			if(err)
      				return res.send(err);
      			return res.json(category);
		});
	});
  router.route('/topic/:id')
    .get(function(req,res){
      var usr = req.session.user.local.username;
      topicInst = req.params.id;
      req.session.tid = topicInst;
        Profile.findOne({userId: usr})
         .exec(function(err,data){

        topic1.topicWins=0;
        topic1.topicLosses=0;
        topic1["topicLevel"]=1;
        topic1["levelPercentage"]=0;
        topic1["isFollowed"]= false;
        topic1['points']=0;

        var topicsPlayed=data["topicsPlayed"];
         var l=topicsPlayed.length;
         for(var i=0;i<l;++i)
         {
           if(topicsPlayed[i].topicId === req.params.id)
            break;
         }
         if(i!=l)
         {
         var topic2=topicsPlayed[i];
         topic1["topicWins"]=topic2["gamesWon"];
         topic1["topicLosses"]=topic2["gamesPlayed"]-topic2["gamesWon"];
         points =topic2["points"];
         level= topic2["level"];
         topic1["topicLevel"]=topic2["level"];
         topic1["levelPercentage"]=findPercentage(points,level);
         topic1["isFollowed"]=topic2["isFollowed"];
         topic1["points"]=points;
       }
      Topic.findById(req.params.id)
       .exec(function(err,topic){
       if(err)
        return res.send(err);
        topic1.topicId=topic._id;
        topic1.topicName=topic.topicName;
        topic1.topicDescription=topic.topicDescription;
        topic1.topicIcon = topic.topicIcon;
        topic1.topicFollowers=topic.topicFollowers;
        console.log("######");
        console.log(topic1);
        res.json(topic1);
      });
      });
  })
  .put(function(req,res){
    var usr = req.session.user.local.username;
      Profile.findOne({userId: usr})
       .exec(function(err,data){
      var topicsPlayed=data["topicsPlayed"];
       var l=topicsPlayed.length;
       var tid=req.params.id;
       req.session.tid=tid;
       for(var i=0;i<l;++i)
       {
         if(topicsPlayed[i].topicId === req.params.id)
          break;
       }
       if(i==l)
       {
         var topic3={
             "topicId":req.params.id,
             "gamesPlayed":0,
             "gamesWon":0,
             "level":1,
              "isFollowed":false,
              "points":0
         }
         data.topicsPlayed.push(topic3);
       }
       data.topicsPlayed[i].isFollowed=!(data.topicsPlayed[i].isFollowed);
       data.save(function(err){
       if ( err ) console.log(err);
       var topic2=topicsPlayed[i];
       topic1["topicWins"]=topic2["gamesWon"];
       topic1["topicLosses"]=topic2["gamesPlayed"]-topic2["gamesWon"];
       topic1["topicLevel"]=topic2["level"];
       topic1["levelPercentage"]=0;
       topic1["points"]=topic2["points"];
       topic1["isFollowed"]=topic2["isFollowed"];

    Topic.findById(req.params.id)
     .exec(function(err,topic){
     if(err)
      return res.send(err);
      if(data.topicsPlayed[i].isFollowed==true)
      {
        topic.topicFollowers=topic.topicFollowers+1;
      }
      else {
        topic.topicFollowers=topic.topicFollowers-1;
      }
      topic.save(function(err){
      if ( err ) console.log(err);
    topic1.topicId=topic._id;
    topic1.topicName=topic.topicName;
    topic1.topicDescription=topic.topicDescription;
    topic1.topicIcon = topic.topicIcon;
    topic1.topicFollowers=topic.topicFollowers;
    res.json(topic1);

  });
    });
    });
});
})
.post(function(req,res){
  var usr = req.session.user.local.username;
    Profile.findOne({userId: usr})
     .exec(function(err,data){
    var topicsPlayed=data["topicsPlayed"];
     var l=topicsPlayed.length;
     var tid=req.params.id;
     req.session.tid=tid;
     for(var i=0;i<l;++i)
     {
       if(topicsPlayed[i].topicId === req.params.id)
        break;
     }
     if(i==l)
     {
       var topic3={
           "topicId":req.params.id,
           "gamesPlayed":0,
           "gamesWon":0,
           "level":1,
           "isFollowed":false,
           "points":0
       }
       data.topicsPlayed.push(topic3);
     }
     data.save(function(err){
     if ( err ) console.log(err)});

  });
});
module.exports= router;
