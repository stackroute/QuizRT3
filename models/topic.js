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

var mongoose = require('mongoose'),
    category = require('./category'),
    game = require('./game'),
    topicSchema = new mongoose.Schema({
      _id: { type: String, required: true},
      topicName: String,
      topicIcon: String,
      topicCategory: { type: String, required: true, ref: 'Category'},
      topicDescription: String,
      topicFollowers: Number,
      playersPerMatch:{type:Number,default:2},
      games:[{type: String, ref: 'Game'}]
    }),
    Topic = mongoose.model('Topic', topicSchema, "topics_collection");

module.exports = Topic;
