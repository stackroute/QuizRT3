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
//   Name of Developers  Abhinav Kareer,Sunil Mekala, Pratik Sinha, Anil Sawant,Venkata Gopichand
//


var mongoose = require('mongoose'),
    Topic = require('./topic'),
    tournamentSchema = mongoose.Schema({
      _id: String,
      title:String,
      description:String,
      matches:Number,
      playersPerMatch:Number,
      imageUrl:String,
      topics: [
        {
          _id:String,
          name:{type: String, ref: 'Topic'}
         }
      ]
    }),
    Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
