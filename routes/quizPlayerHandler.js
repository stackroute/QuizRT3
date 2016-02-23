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
    Reservoir = require('reservoir'),
    router = express.Router(),
    Quiz = require("../models/quiz"),
    Question=require("../models/question.js");

router.route('/quizData/:id')
    .get( function(req, res) {
      var topicInst = req.params.id;
      console.log("fetching questions for :"+topicInst );
      var temp=topicInst.split(",");
      var topicId=temp[0];
      var gameId=temp[1];
      console.log(topicId);
      console.log(gameId);
      Quiz.findOne( { 'gameId': gameId } ) // find the liveGame in Quiz collection
        .exec( function(err, liveGame) {
          if( liveGame == null ) { // the game does't exist
            console.log("--------------------", liveGame);
            Question.find( { 'topicId': topicId } ) // retrieve questions from Question collection for topicId
              .exec( function(err, questions) {
                console.log("Retunrning Questions...................",questions);
                var myReservoir = Reservoir(5);// set the number of questions that the quiz will have
                questions.forEach(function(e) {
                  myReservoir.pushSome(e); // iterates through all the questions and randomly pushes only 5 into the reservoir
                });
                var newQuiz = new Quiz();
                newQuiz.topicId = topicId;
                newQuiz.gameId = gameId;
                newQuiz.questions = [];

                console.log('\nReserviour');
                console.log(myReservoir);

                for(var i=0;i<5;++i) {
                  newQuiz.questions.push(myReservoir[i]._id);
                }
                newQuiz.save(function(err) {
                  if ( err ) console.log(err);

                  Quiz.findOne({gameId:gameId})
                  .populate('questions')
                  .exec(function(err,data){
                    res.send(data);
                  });
                });
              });
        } else{
          // when is this executed??
          console.log('else part of loading questions into reserviour');
          Quiz.findOne({gameId:gameId})
          .populate('questions')
          .exec(function(err,data){
            console.log(data);
            res.send(data);
          });
        }
      });
    });

module.exports= router;
