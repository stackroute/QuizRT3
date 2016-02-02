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
var Reservoir = require('reservoir');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Quiz = require("../models/quiz");
var Question=require("../models/question.js");

router.route('/quizData/:id')
.post(function(req, res) {

  var topicInst = req.params.id;
  var temp=topicInst.split(",");
  var topicId1=temp[0];
  var groupId=temp[1];

  Quiz.findOne({gameId:groupId})
  .exec(function(err,data){
    //  console.log(data);
    if(data==null)
    {
      Question.find({'topicId':topicId1})

      .exec(function(err,data){
        var myReservoir = Reservoir(5);
        data.forEach(function(e) {
          myReservoir.pushSome(e);
        });
        var quiz1=new Quiz();
        quiz1.topicId=topicId1;
        quiz1.gameId=groupId;
        var myReservoir = Reservoir(5);
        data.forEach(function(e) {
          myReservoir.pushSome(e);
        });
        quiz1.questions=[];
        for(var i=0;i<5;++i)
        {
          quiz1.questions.push(myReservoir[i]._id);
        }

        console.log("hdkjsksdskdskdnskdnskd");
        console.log(quiz1);
        console.log("dvkdmfkdmfkdmd");
        quiz1.save(function(err){
          if ( err ) console.log(err);

                Quiz.findOne({gameId:groupId})
                .populate('questions')
                .exec(function(err,data){
                  console.log("dcndjcndjcnjcnjdcndjcraghav");
                  console.log(data);
                  console.log("dcndjcndjcnjcnjdcndjcraghav");
                  res.send(data);
                });
        });

      });



    }

else{
  Quiz.findOne({gameId:groupId})
  .populate('questions')
  .exec(function(err,data){
    console.log(data);
    res.send(data);
  });

}





});
});

module.exports= router;
