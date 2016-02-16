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
//	Name of Developers Anil Sawant

var uuid = require('node-uuid'), // used to generate unique ids
    questionBank = require('./questionBank'),
    LeaderBoard = require('./gameManager/Leaderboard.js');

var GameManager = function() {
  this.games = new Map();
  this.topicsWaiting = {};
}

GameManager.prototype.get = function( gameId ) {
	return this.games.get( gameId );
};

GameManager.prototype.createNewGame = function( topicId, minPlayers ) {
  // create a newGame, generate a new gameId using uuid and set the game into this.games
  var newGame = {
    topicId: topicId,
    minPlayers: minPlayers,
    players: []
  }
  var gameId = uuid.v1();
  this.games.set( gameId, newGame );// set the game into this.games
  this.topicsWaiting[topicId] = gameId; // save topicId as key and gameId as value to track which topics are waiting for more players to join
  return gameId;
};

GameManager.prototype.addPlayerToGame = function( topicId, minPlayers, incomingPlayer ) {
  var gameId4topicInWaitStack = this.topicsWaiting[topicId];
  if ( gameId4topicInWaitStack ) {
    this.get( gameId4topicInWaitStack ).players.push( incomingPlayer ); //add the player in a game having topic = topicId
    if ( this.isGameReady( gameId4topicInWaitStack ) ) {
      delete this.topicsWaiting[topicId]; //remove the topic from wait stack
      this.startGame( gameId4topicInWaitStack ); //start the game
    }
  } else {
    var gameId = this.createNewGame( topicId, minPlayers );
    this.get( gameId ).players.push( incomingPlayer ); //add the player to a game having topic = topicId
    if ( this.isGameReady( gameId ) ) {
      delete this.topicsWaiting[topicId]; //remove the topic from wait stack
      this.startGame( gameId ); //start the game
    }
  }
};

GameManager.prototype.isGameReady = function( gameId ) {
  var game = this.get( gameId );
  if ( game.minPlayers == game.players.length ) {
    return true;
  }
	return false;
};

GameManager.prototype.startGame = function( gameId ) {
  var game = this.get( gameId );

  /* @params (topicId, number of questions, callback) */
  questionBank.getQuizQuestions( game.topicId, 5 , function( questions ) { // get questions from the questionBank
    console.log('\n');
    game.players.forEach( function(player) {
      LeaderBoard.addPlayer( gameId, player );
      player.client.emit('startGame', { topicId: game.topicId, gameId: gameId, maxPlayers: game.minPlayers, questions: questions });
      console.log("Starting game for " + player.userId );
    });
  });// end getQuizQuestions
}

GameManager.prototype.popGame = function( gameId ) { // not used as of now
	this.games.delete( gameId ); // pop the game from games
}

module.exports = new GameManager();
