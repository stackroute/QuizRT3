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
//   Name of Developers  Abhinav Kareer,Sunil Mekala, Pratik Sinha, Anil Sawant, Chandu
//

var playTournament=new Map();
module.exports={
	players: playTournament,
	addPlayer: function(topicId, sid, client, name, imageUrl){
		var clientData = {
			client:client,
			name:name,
			imageUrl: imageUrl
		};
		if(playTournament.get(topicId)==null){
			var temp= new Map();
			temp.set(sid, clientData);
		 	playTournament.set(topicId, temp);
		}
		else
			playTournament.get(topicId).set(sid, clientData);
	},

	popPlayers: function(topicId){
		// play.get(topicId).delete(sid);
		// if(play.get(topicId).size==0)
		// 	play.delete(topicId);
			var topicPlayers=[];
		playTournament.get(topicId).forEach(function(item, key, value){
			topicPlayers.push({
				sid: key,
				clientData: item
			});
		});
		playTournament.delete(topicId);
		return topicPlayers;
	}
};
