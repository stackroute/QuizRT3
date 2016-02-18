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
//   Name of Developers  Anil Sawant

var LeaderBoard = function() {
  this.games = new Map();
}

LeaderBoard.prototype.addPlayer = function( gameId, player ) {
  player.score = 0; // add score property to player and initialize it to zero
  if( this.games.get( gameId ) && this.games.get( gameId ).length ) {
    this.games.get( gameId ).push( player );
  } else {
    this.games.set( gameId, [player] );
  }
};

LeaderBoard.prototype.get = function(gameId) {
  return this.games.get(gameId);
};

LeaderBoard.prototype.updateScore = function( gameId, userId, score) {
  this.games.get( gameId ).some( function( player ) {
    if( player.userId == userId ){
      player.score = score;
      return true;
    }
    return false;
  });

  this.games.get( gameId ).sort( function(a,b) { // refresh the leaderBoard
    return b.score-a.score;                     // this is requred to get the gameTopper after every question
  });
};

module.exports = new LeaderBoard();
