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
  this.games = new Map(); // holds leaderBoards for all the games

  /**
  ** @param gameId as String
  ** @return leaderBoard for the gameId
  */
  this.get = function( gameId ) {
    return this.games.get( gameId );
  };

  this.createNewLeaderBoard = function( gameId, players ) {
    if( this.games.has( gameId ) ) { // leaderBoard for the gameId already exists return false
      return false;
    }
    this.games.set( gameId, players); // add the leaderBoard against the gameId
    return true;
  };

  /**
  ** @param gameId as String, userId as String, score as Number
  ** @return true if the score was updated for the userId, for the gameId, and respective LeaderBoard was updated
  */
  this.updateScore = function( gameId, userId, score) {
    if( this.games.has( gameId ) ) {
      var wasPlayerScoreUpdated = this.games.get( gameId ).some( function( player ) {
        if( player.userId == userId ){
          player.score = score;
          return true; // loop breaking condition
        }
        return false;
      });

      if ( wasPlayerScoreUpdated ) { // if the player was not found return false
        this.games.get( gameId ).sort( function(a,b) { // refresh the leaderBoard
          return b.score-a.score;                     // this is requred to get the gameTopper after every question
        });
        return true;
      }
      return false;
    }
  };
}

module.exports = new LeaderBoard();
