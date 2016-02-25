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
    questionSchema = mongoose.Schema({
      questionId: {type: String, required: true},
      question: { type: String, required: true },
      image: String,
      options: [{type: String, required: true}],
      correctIndex: { type: Number, required: true },
      difficultyLevel: { type: Number, default: 0 },
      timesUsed: { type: Number, default: 0 },
      correctRatio: { type: String, default: "" },
      frequency: { type: Number, default: 0 },
      lastEdited: { type: Date, required: true },
      createdOn: { type: Date, required: true },
      topics: { type: String },
      topicIds: {type: String },
      categories: {type: String },
      topicId: [{type: String, required: true, ref: 'Topics'}]
    }),
    Question = mongoose.model('Question', questionSchema,'questionBank');

module.exports = Question;
