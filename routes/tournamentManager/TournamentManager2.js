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
//

var TournamentManager = function() {
  this.tournaments = new Map();
  this.managePlayer = function( tournamentId, topicId, playersNeeded, gamePlayer ) {
    if ( this.tournaments.has( tournamentId ) ) {
      var gameManager = this.tournaments.get( tournamentId );
      var addedSuccessfully = gameManager.managePlayer( topicId, playersNeeded, gamePlayer );
      if ( addedSuccessfully )
        return true;
      console.log( gamePlayer.userId + ' is already playing ' + topicId + ' of ' + tournamentId );
      return false;
    } else {
      var newGameManager = require('../gameManager/AlphaGameManager.js');
      var addedSuccessfully = newGameManager.managePlayer( topicId, playersNeeded, gamePlayer );
      if ( addedSuccessfully ) {
        this.tournaments.set( tournamentId, newGameManager);
        console.log( gamePlayer.userId + ' is added to ' + topicId + ' of ' + tournamentId );
        return true;
      }
      return false;
    }
  };
  this.getGameManager = function( tournamentId ) {
    return this.tournaments.get( tournamentId );
  };
};

module.exports = new TournamentManager();
