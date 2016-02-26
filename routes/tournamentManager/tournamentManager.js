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
  this.playerTournaments = new Map();
  this.managePlayer = function( tournamentId, topicId, playersNeeded, gamePlayer ) {
    if ( this.tournaments.has( tournamentId ) ) {
      var gameManager = this.tournaments.get( tournamentId );
      var addedSuccessfully = gameManager.managePlayer( topicId, playersNeeded, gamePlayer );
      if ( addedSuccessfully ) {
        if ( this.playerTournaments.has( gamePlayer.userId )) {
          this.playerTournaments.get( gamePlayer.userId ).push( tournamentId );
        } else {
          this.playerTournaments.set( gamePlayer.userId, [tournamentId] );
        }
        console.log( gamePlayer.userId + ' is added to ' + topicId + ' of ' + tournamentId );
        return true;
      }
      console.log( gamePlayer.userId + ' is already playing ' + topicId + ' of ' + tournamentId );
      return false;
    } else {
      var GameManagerClass = require('../gameManager/GameManager.js');
      var newGameManager = new GameManagerClass();
      var addedSuccessfully = newGameManager.managePlayer( topicId, playersNeeded, gamePlayer );
      if ( addedSuccessfully ) {
        this.tournaments.set( tournamentId, newGameManager);
        if ( this.playerTournaments.has( gamePlayer.userId )) {
          this.playerTournaments.get( gamePlayer.userId ).push( tournamentId );
        } else {
          this.playerTournaments.set( gamePlayer.userId, [tournamentId] );
        }
        console.log('\nNew GameManager for tournament');
        console.log( gamePlayer.userId + ' is added to ' + topicId + ' of ' + tournamentId );
        return true;
      }
      return false;
    }
  };
  this.getGameManager = function( tournamentId ) {
    return this.tournaments.get( tournamentId );
  };
  this.getPlayerTournaments = function( userId ) {
    return this.playerTournaments.get( userId );
  };
  this.popPlayer = function( userId ) {
    var playerTournaments = this.playerTournaments.get( userId ),
        self = this;
    if ( playerTournaments ) {
      playerTournaments.forEach( function( tournamentId, index ) {
        var gameManager = self.getGameManager( tournamentId );
        gameManager.popPlayer( userId ); // pop the user from all the games
        console.log( playerTournaments.splice( index, 1 ) , '  was removed from the tournament ' + tournamentId );
      });
      this.playerTournaments.delete( userId );
    }
  };
  this.leaveTournament = function( tournamentId, userId ) {
      var gameManager = this.getGameManager( tournamentId );
      gameManager.popPlayer( userId ); // pop the user from all the games
      var playerTournaments = this.playerTournaments.get( userId );
      if ( playerTournaments && playerTournaments.length ) {
        var index = playerTournaments.indexOf( tournamentId );
        if ( index != -1) {
          console.log( this.playerTournaments.splice( index, 1 ) , ' left the tournament ' + tournamentId );
        }
      }
      if ( !playerTournaments.length ) {
        this.playerTournaments.delete( userId );
      }
  };

  this.finishGame = function( finishGameData ) {
    var gameManager = this.getGameManager( finishGameData.tournamentId );
    gameManager ? gameManager.finishGame( finishGameData ) : console.log('ERROR: Failed to find the gameManager for ' + finishGameData.tournamentId);
  };
};

module.exports = new TournamentManager();
