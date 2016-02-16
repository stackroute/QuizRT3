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
//											+ Anil Sawant


var GameManager = function() {
  this.games = new Map();
}

GameManager.prototype.addPlayerToGame = function( topicId, gamePlayer ) {
	if ( this.games.get( topicId ) && this.games.get( topicId ).length ){
		this.games.get( topicId ).push(gamePlayer);
	} else {
		this.games.set(topicId, [gamePlayer]);
	}
};
GameManager.prototype.get = function( topicId ) {
	return this.games.get( topicId );
};
GameManager.prototype.popGame = function( topicId ) {
	this.games.delete( topicId ); // pop the game from games
}

module.exports = new GameManager();
