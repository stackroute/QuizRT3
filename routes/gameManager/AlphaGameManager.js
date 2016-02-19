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
    LeaderBoard = require('./Leaderboard.js');

/**
** @param no constructor params
** @desc GameManager is a class that will handle all the games running in QuizRT.
**       It uses questionBank for getting questions for a game,
**       and LeaderBoard for maintaining the user scores.
*/
var GameManager = function() {
  this.games = new Map(); // holds all the games Waiting, Live, and Finished
  this.topicsWaiting = {}; // holds only the games which are waiting for players. Maps topicId to gameId

  /**
  ** @param topicId as String, playersNeeded as Number
  ** @return true if the new game was created, otherwise false
  */
  this.createNewGame = function( topicId, playersNeeded ) {
    var newGame = { // create a newGame, generate a new gameId using uuid and set the game into this.games
      topicId: topicId,
      playersNeeded: playersNeeded,
      leaderBoard: [],
      players: []
    }
    var gameId = uuid.v1(); // generate a unique gameId
    this.games.set( gameId, newGame );// set the game into this.games against the new gameId
    this.topicsWaiting[topicId] = gameId; // save topicId as key and gameId as value to track which topics are waiting for more players to join
    return gameId; // return gameId so that it can be used later
  };

  /**
  ** @param topicId as String, playersNeeded as Number, incomingPlayer as Object
  ** @return true if player was added to a game, otherwise false
  */
  this.addPlayerToGame = function( topicId, playersNeeded, incomingPlayer ) {
    var gameId4TopicInWaitStack = this.topicsWaiting[topicId];
    if ( gameId4TopicInWaitStack ) { // if the game is waiting in the wait stack
      this.games.get( gameId4TopicInWaitStack ).players.push( incomingPlayer ); //add the player in a game having topic = topicId
      if ( this.isGameReady( gameId4TopicInWaitStack ) ) {
        this.startGame( gameId4TopicInWaitStack ); //start the game
        delete this.topicsWaiting[topicId]; //remove the topic from wait stack
      }
    } else {
      var gameId = this.createNewGame( topicId, playersNeeded ); // create a new game
      this.games.get( gameId ).players.push( incomingPlayer ); //add the player to a game having topic = topicId
      if ( this.isGameReady( gameId ) ) { // check if the game is ready to start
        this.startGame( gameId ); //start the game
        delete this.topicsWaiting[topicId]; //remove the topic from wait stack
      } else {
        this.emitPendingPlayers( gameId );
      }
    }
  };

  /**
  ** @param gameId as String
  ** @return true if the game is ready to start, otherwise false
  */
  this.isGameReady = function( gameId ) {
    var game = this.games.get( gameId );
    if ( game.playersNeeded === game.players.length ) {
      return true;
    }
  	return false;
  };

  /**
  ** @param gameId as String
  ** @desc emits 'pendingPlayers' event for every player in a game with gameId = gameId
  */
  this.emitPendingPlayers = function( gameId ) {
    var game = this.games.get( gameId );
    game.players.forEach( function(player) {
      player.client.emit('pendingPlayers', { gameId: gameId, pendingPlayers: (game.playersNeeded - game.players.length) } );
    });
  };

  /**
  ** @param gameId as String
  ** @return true if everything is setup before starting a Game and 'startGame' events are emitted
  */
  this.startGame = function( gameId ) {
    var game = this.games.get( gameId );

    questionBank.getQuizQuestions( game.topicId, 5 , function( err, questions ) { // get questions from the questionBank
      if ( err ) {
        console.error(err);
        return false;
      }
      // prepare the LeaderBoard for the game
      var players = []
      game.players.forEach( function(player) { // extra loop to exclude player.client from leaderBoard and prevent CallStack Overflow error
        var gamePlayer = {
          userId: player.userId,
          playerName: player.playerName,
          playerPic: player.playerPic,
          score: 0 // add score to gamePlayer and initialize it to zero
        }
        players.push( gamePlayer );
      });
      var leaderBoardCreated = LeaderBoard.createNewLeaderBoard( gameId, players ); // create the leaderBoard for the game before starting
      if ( leaderBoardCreated ) {
        game.leaderBoard = players; // set the leaderBoard on game also. gives 2nd way to access it. other being getLeaderBoard()
        console.log('\n');
        game.players.forEach( function(player) {
          player.client.emit('startGame', { topicId: game.topicId, gameId: gameId, playersNeeded: game.playersNeeded, questions: questions });
          console.log("Starting game for " + player.userId );
        });
        return true;
      } else {
        console.log('ERROR: Failed to create LeaderBoard for ' + gameId );
        return false;
      }
    });// end getQuizQuestions
  };

  /**
  ** @desc exposes the LeaderBoard.get method from GameManager
  */
  this.getLeaderBoard = function( gameId ) { // expose the LeaderBoard from GameManager
    return LeaderBoard.get( gameId ); // call the LeaderBoard to get game specific leaderBoard
  };

  /**
  ** @desc exposes the LeaderBoard.updateScore method from GameManager
  */
  this.updateScore = function( gameId, userId, score) {
    LeaderBoard.updateScore( gameId, userId, score); // call the LeaderBoard to update the player score
  };

  this.popGame = function( gameId ) { // not used as of now
  	this.games.delete( gameId ); // pop the game from games
  };
}

module.exports = new GameManager();
