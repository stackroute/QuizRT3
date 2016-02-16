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

var Reservoir = require('reservoir'),
    Question = require("../models/question.js");

module.exports = {
  getQuizQuestions: function( topicId, noOfQs, done ) {
    if ( isNaN(noOfQs) ) {
      console.log('noOfQs is not a number');
      done( null );
    } else {
      Question.find( { 'topicId': topicId } ) // retrieve questions from Question collection for topicId
      .exec( function(err, questions) {
        if ( err ) {
          console.log('Question cannot be read from mongo.');
          done( null );
        } else {
          var myReservoir = Reservoir( noOfQs ),
              fewQuestions = [];

          questions.forEach(function(e) {
            myReservoir.pushSome(e);
          });

          for (var i = 0; i < noOfQs; i++) {
            fewQuestions.push(myReservoir[i]);
          }
          done(fewQuestions);
        }

      });
    }
  }
}
// var newQuiz = new Quiz();
// newQuiz.topicId = topicId;
// newQuiz.gameId = gameId;
// newQuiz.questions = [];
//
// console.log('\nReserviour');
// console.log(myReservoir);
//
// for(var i=0;i<5;++i) {
//   newQuiz.questions.push(myReservoir[i]._id);
// }
// newQuiz.save( function(err) {
//   if ( err )  {
//     console.log(err);
//     console.log('New Quiz could not be saved to Mongo.');
//   } else {
//     console.log('New quiz saved to Mongo successfully.');
//   }
// });
