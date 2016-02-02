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
 
var leader= new Map();

module.exports={
  leaderBoard: leader,

  addPlayer: function(gameId, sid, client, name, score, imageUrl){
    var clientData={
      'sid': sid,
      'name': name,
      'imageUrl': imageUrl,
      'score': score,
      'client': client
    };

    if(leader.get(gameId)==null){
			var temp= [];
			temp.push(clientData);
		 	leader.set(gameId, temp);
		}
		else{
			leader.get(gameId).push(clientData);
    }
	},

  getGamePlayers: function(gameId){
    return leader.get(gameId);
  },

  updateScore: function(gameId, sid, score){
    for(var i=0; i<leader.get(gameId).length; i++){
      if(leader.get(gameId)[i].sid== sid){
        leader.get(gameId)[i].score= score;
        break;
      }
    }

    leader.get(gameId).sort(function(a,b){
      return b.score-a.score;
    });
  }
};
