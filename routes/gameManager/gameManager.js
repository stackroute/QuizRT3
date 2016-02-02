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
 
var play=new Map();
module.exports={
	players: play,
	addPlayer: function(topicId, sid, client, name, imageUrl){
		var clientData = {
			client:client,
			name:name,
			imageUrl: imageUrl
		};
		if(play.get(topicId)==null){
			var temp= new Map();
			temp.set(sid, clientData);
		 	play.set(topicId, temp);
		}
		else
			play.get(topicId).set(sid, clientData);
	},

	popPlayers: function(topicId){
		// play.get(topicId).delete(sid);
		// if(play.get(topicId).size==0)
		// 	play.delete(topicId);
			var topicPlayers=[];
		play.get(topicId).forEach(function(item, key, value){
			topicPlayers.push({
				sid: key,
				clientData: item
			});
		});
		play.delete(topicId);
		return topicPlayers;
	}
};
