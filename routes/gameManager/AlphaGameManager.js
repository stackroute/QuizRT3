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

var uuid = require('node-uuid'), // used to generate unique game ids
    questionBank = require('./questionBank'),
    LeaderBoard = require('./Leaderboard.js'),
    MongoDB = require('./mongoOperations.js');

/**
** @param no constructor params
** @desc GameManager is a class that will handle all the games running in QuizRT.
**       It uses questionBank for getting questions for a game,
**       and LeaderBoard for maintaining the user scores.
*/
var GameManager = function() {
  this.games = new Map(); // holds all the games. Waiting, Live, and Finished
  this.players = new Map();// to map userId to [gameIds]
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
      players: [],
      playersFinished: 0
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
  this.managePlayer = function( topicId, playersNeeded, incomingPlayer ) {
    var gameId4TopicInWaitStack = this.topicsWaiting[topicId];
    if ( gameId4TopicInWaitStack ) { // if the game is waiting in the wait stack
      var isPlayerAdded = this.addPlayerToGame( gameId4TopicInWaitStack, topicId, incomingPlayer );
      if ( isPlayerAdded ) {
        if ( this.isGameReady( gameId4TopicInWaitStack ) ) {
          this.startGame( gameId4TopicInWaitStack ); //start the game
          delete this.topicsWaiting[topicId]; //remove the topic from wait stack
          return true;
        }
        this.emitPendingPlayers( gameId4TopicInWaitStack );
        return true; // GameManager started managing the player
      }
      return false;
    } else {
      var gameId = this.createNewGame( topicId, playersNeeded ); // create a new game
      if ( gameId ) { // if the game was created successfully
        var isPlayerAdded = this.addPlayerToGame( gameId, topicId, incomingPlayer );
        if ( isPlayerAdded ) {
          if ( this.isGameReady( gameId ) ) {
            this.startGame( gameId ); //start the game
            delete this.topicsWaiting[topicId]; //remove the topic from wait stack
            return true;
          }
          this.emitPendingPlayers( gameId );
          return true; // GameManager started managing the player
        }
        return false;
      }
      return false;
    }
  };

  /**
  ** @param gameId as String, topicId as String, gamePlayer as Object
  ** @return true if gamePlayer was added to a game; otherwise false
  */
  this.addPlayerToGame = function( gameId, topicId, gamePlayer ) {
    var playerGames = this.players.get( gamePlayer.userId ),
        gamePlayers = this.games.get( gameId ) ? this.games.get( gameId ).players : null,
        self = this;

  	if ( gamePlayers ) { // players Array exists in the game. This check is not necessary
      if ( playerGames && playerGames.length ) { // gamePlayer is already playing some game(s)
        var isPlayingSameTopic = playerGames.some( function( savedGameId ) {
          if ( savedGameId == gameId && self.games.get( savedGameId ) && (self.games.get( savedGameId ).topicId == topicId) ) {
            return true;
          }
          return false;
        });
        if ( !isPlayingSameTopic ) {
          playerGames.push( gameId ); // add the gameId to gamePlayer's array of playing-games
          gamePlayers.push( gamePlayer ); // since the game already exists, add gamePlayer to players array the game
          console.log( gamePlayer.userId , ' was added to ' , gameId);
          return true;
        }
        return false;// player is already playing topicId.
                     // Can't play the same topic until the game is finished/popped
      } else { // gamePlayer is not playing any game(s) so far
        this.players.set( gamePlayer.userId, [gameId] ); // set the gameId as the first game gamePlayer is playing i.e. set it in the map
        gamePlayers.push( gamePlayer ); // since the game already exists, add gamePlayer to players array the game
        console.log( gamePlayer.userId , ' was added to ' , gameId);
        return true;
      }
  	}
    return false;
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
    if ( game.players ) {
      game.players.forEach( function(player) {
        console.log('Emitting pending players = ' + (game.playersNeeded - game.players.length) + ' for ' + player.userId );
        player.client.emit('pendingPlayers', { gameId: gameId, pendingPlayers: (game.playersNeeded - game.players.length) } );
      });
    }
  };

  /**
  ** @param gameId as String
  ** @desc emits 'playerLeft' event for every player in a game with gameId = gameId
  */
  this.emitPlayerLeft = function( gameId, leavingPlayer ) {
    var game = this.games.get( gameId );
    if ( game.players ) {
      game.players.forEach( function(player) {
        console.log('Emitting player left = '+ leavingPlayer.playerName + ' for ' + player.userId);
        player.client.emit('playerLeft', { gameId: gameId, playerName: leavingPlayer.playerName } );
      });
    }
  };

  /**
  ** @param gameId as String
  ** @return true if everything is setup before starting a Game and 'startGame' events are emitted
  */
  this.startGame = function( gameId ) {
    var game = this.games.get( gameId ),
        self = this;

    questionBank.getQuizQuestions( game.topicId, 5 , function( err, questions ) { // get questions from the questionBank
      if ( err ) {
        console.log('ERROR: Failed to get quiz questions for ' + gameId + '. Cannot start the game. Terminating the game launch.');
        console.error(err);
        // return false;
      }
      //prepare the LeaderBoard for the game
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
      LeaderBoard.createNewLeaderBoard( gameId, players, function(err, leaderBoardCreated) {
        if ( err ) {
          console.log('ERROR: Failed to create LeaderBoard for ' + gameId + '. Cannot start the game. Terminating the game launch.');
          return false;
        }
        game.leaderBoard = players; // set the leaderBoard on game also. gives 2nd way to access it. other being getLeaderBoard()
        console.log('\n');
        console.log('Starting game: ' + gameId);
        game.players.forEach( function(player) {
          console.log('Starting game for ' + player.userId );
          player.client.emit('startGame', { topicId: game.topicId, gameId: gameId, playersNeeded: game.playersNeeded, questions: questions });
        });
        if ( !questions || !questions.length ) {
          self.popGame( gameId );
        }
        console.log('\n');
        return true;
      }); // create the leaderBoard for the game before starting
    });// end getQuizQuestions
  };

  /**
  ** @param gameId as String
  ** @return true if game finished properly, all user profiles updated
  */
  this.finishGame = function( gameData ) {
    var game = this.games.get( gameData.gameId ),
        self = this,
        gameBoard = this.getLeaderBoard( gameData.gameId );

    game.playersFinished++;
    if ( game.playersFinished == 1 ) { // start the timer when first player finishes the game
      game.timer = setTimeout( function() {
        console.log('\nSaving after 3s...');
        self.storeResult( gameData, gameBoard, game );
      }, 3000);
    }
    if ( game.playersFinished == game.players.length ) {
      console.log('\nSaving after all players finished..');
      clearTimeout( game.timer );
      this.storeResult( gameData, gameBoard, game );
    }
  };

  /**
  ** @param topicId as String
  ** @return Array of players playing topicId
  */
  this.storeResult = function( gameData, gameBoard, game ) {
    var noOfCallbacksFinished = 0;

    MongoDB.saveGameToMongo( gameData, gameBoard, function() {
      noOfCallbacksFinished++;
      if ( noOfCallbacksFinished == game.players.length+1 ) {
        //popGame
        console.log('Popping game');

      }
    });
    game.players.forEach( function( player ) {
      gameBoard.some( function( boardPlayer, index ) {
        if ( player.userId == boardPlayer.userId ) {
          var updateProfileObj = {
           score: boardPlayer.score,
           rank: index+1,
           topicid: game.topicId, // change this with $scope.topicId
           userId: boardPlayer.userId,
           levelId: game.levelId
         };
          MongoDB.updateProfile( updateProfileObj, function( updatedData ) {
            if ( updatedData.error ) {
              console.log('Failed to update user profile.');
            }else {
              player.client.emit('refreshUser', { error: null, user: updatedData.updatedUserProfile } );// not used so far
            }
            noOfCallbacksFinished++;
            if ( noOfCallbacksFinished == game.players.length+1 ) {
              //popGame
              console.log('Popping game');
            }
          });
          return true;
        }
      });
    });

  }

  /**
  ** @param topicId as String
  ** @return Array of players playing topicId
  */
  this.getGamePlayers = function( gameId ) {
  	return this.games.get( gameId );
  };

  /**
  ** @param gamePlayer as Obj
  ** @return Array of topics gamePlayer is playing
  */
  this.getPlayerTopics = function( userId ) {
  	return this.players.get( userId );
  };

  /**
  ** @param gameId as String, gamePlayer as Object
  ** @return true if gamePlayer left the game successfully; otherwise false
  */
  this.leaveGame = function( gameId, userId ) {
    var playerGames = this.players.get( userId ),
        game = this.games.get( gameId ),
        gamePlayers = game ? game.players : null, // array of players playing gameId
        playerLeft = false;

    if ( gamePlayers && gamePlayers.length ) {
      playerLeft = gamePlayers.some( function( savedPlayer, index ) {
        if ( savedPlayer.userId == userId ) {
          console.log( gamePlayers.splice( index, 1 ) , ' left ' + gameId );
          return true;
        }
        return false;
      });
    }
    if ( playerLeft ) { // do some cleanup
      if ( gamePlayers && !gamePlayers.length ) { // remove the game mapping if the game doesn't have any players
        delete this.topicsWaiting[game.topicId]; //remove the topic from wait stack
        this.games.delete( gameId );
      }
      var index = playerGames.indexOf( gameId );
      if ( playerGames && playerGames.length &&  (index != -1)) {
        console.log( playerGames.splice( index, 1 ), ' was removed from ' + userId  + "'s array of games.");
      }
      if ( playerGames && !playerGames.length ) { // remove the player mapping if the player is not playing any topic
        this.players.delete( userId );
      }
      return true; // player successfully left the game and other cleanup was done
    }
    return false; // the player or the game does not exist
  };


  /**
  ** @param gameId as String
  ** @return true if the game was successfully popped; otherwise false
  */
  this.popGame = function( gameId ) {
    var game = this.games.get( gameId ),
        gamePlayers = game ? game.players : null,
        self = this;
    if ( gamePlayers && gamePlayers.length ) {
      gamePlayers.forEach( function( gamePlayer ) { // before deleting the game delete the gameId entry in all the players
        var playerGames = self.players.get( gamePlayer.userId );
        if ( playerGames && playerGames.length ) { // player is playing some games
          var index = playerGames.indexOf( gameId );
          if ( index != -1 ) { // if player is playing the gameId to be popped
            console.log( gamePlayer.userId + ' was removed from ' + playerGames.splice( index, 1 ) );
          }
          if ( playerGames && !playerGames.length ) { // remove the player mapping if the player is not playing any topic
            self.players.delete( gamePlayer.userId );
          }
        }
      });
    }
    if ( this.games.has( gameId ) ) {
      delete this.topicsWaiting[game.topicId]; //remove the topic from wait stack
      this.games.delete( gameId ); // pop the game if it exists
      return true;
    }
    return false; // game doesn't exist
  }

  /**
  ** @param gamePlayer as Object
  ** @return true if the gamePlayer was successfully popped; otherwise false
  */
  this.popPlayer = function( userId ) {
    var playerGames = this.players.get( userId ),
        self = this,
        removedFromGamesCount = 0;
    if ( playerGames && playerGames.length ) {
      playerGames.forEach( function( gameId ) { // before popping the player, delete the gamePlayer entry in all the games
        var game = self.games.get( gameId ),
            gamePlayers = game ? game.players : null; // to check where if gamePlayer entry is there in games
        if ( gamePlayers && gamePlayers.length ) { // game has some players
          gamePlayers.some( function( savedGamePlayer, index ) {
            if ( savedGamePlayer.userId == userId ) {
              savedGamePlayer.client.emit('serverMsg', {type:'LOGOUT', msg:'Multiple logins!! All sessions in GameManager will be popped.'});
              console.log( gamePlayers.splice( index, 1 )[0].userId , ' was removed from ' + gameId );
              if ( self.topicsWaiting[game.topicId] ) { // if still waiting for more players
                self.emitPendingPlayers( gameId );
              } else {
                self.emitPlayerLeft( gameId, savedGamePlayer );
              }
              removedFromGamesCount++ ;
              return true;
            }
            return false;
          });
          if ( gamePlayers && !gamePlayers.length ) { // cleanup
            delete self.topicsWaiting[game.topicId]; //remove the topic from wait stack
            self.games.delete( gameId );
          }
        }
      });
      if ( removedFromGamesCount == playerGames.length ) { // gamePlayer was removed from all the games he was part of
        if ( this.players.has( userId ) ) {
          this.players.delete( userId ); // delete the player mapping
          return true;
        }
      }
      return false; // gamePlayer was removed from a few games but not from all he was part of
    }
  }

  /**
  ** @param gameId as String
  ** @return Array of players playing gameId
  */
  this.getGamePlayers = function( gameId ) {
  	return this.games.has( gameId ) ? this.games.get( gameId ).players : null ;
  };

  /**
  ** @param gamePlayer as Obj
  ** @return Array of topics gamePlayer is playing
  */
  this.getPlayerGames = function( gamePlayer ) {
  	return this.players.get( gamePlayer.userId );
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
}

module.exports = new GameManager();
