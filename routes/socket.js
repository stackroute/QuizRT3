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
//                      + Anil Sawant

var GameManager = require('./gameManager/GameManager.js'),
    tournamentManager = require('./tournamentManager/tournamentManager.js'),
    LeaderBoard = require('./gameManager/Leaderboard.js'),
    uuid = require('node-uuid'),
    Game = require("./../models/game"),
    Profile = require("./../models/profile"),
    Tournament = require("./../models/tournament"),
    questionBank = require('./questionBank'),
    defaultMaxPlayers = 2;
    maxPlayers = 0;

module.exports = function(server,sessionMiddleware) {
  var io = require('socket.io')(server);
  io.use(function(socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
  });
  io.on('disconnect',function(client){
    // Players.delete(client.request.session.user,client);
    console.log( client.request.session.user.local.username + ' was disconnected from the server.');
    client.request.session.destroy();
  })

  io.on('connection', function(client) {
    console.log( client.request.session.user.local.username + ' connected to QuizRT server. Socket Id: ' + client.id);

    client.on('disconnect', function() {
      // need to implement:
      // finding the user disconnected and dropping him from GameManager
      console.log( client.request.session.user.local.username + ' disconnected from QuizRT server.');
      client.request.session.destroy();
    });

    client.on('join',function( playerData ) {
      console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId );
      // check if the user is authenticated and his session exists, if so add him to the game
      if ( client.request.session && (playerData.userId == client.request.session.user.local.username) ) {//req.session.user.local.username
        var gamePlayer = {
          userId: playerData.userId,
          playerName: playerData.playerName,
          playerPic: playerData.playerPic,
          client: client
        };

        // if ( playerData.levelId ) {
        //     give it to TournamentManager
        // }
        var addedSuccessfully = GameManager.addPlayerToGame( playerData.topicId, gamePlayer ); // add the player against the topicId.
        if ( !addedSuccessfully ) {
          console.log('User is already playing the game ' + playerData.topicId + '. Cannot add him again.');
          client.emit('alreadyPlayingTheGame', { topicId: playerData.topicId });
        }

        /*
          The above logic has to be improved to map game-id and players for that game
          For now we cannot have two games on the same topic running simultaneously
          //
          // GameManager.addPlayerToGame( topicId, minPlayers, player)
          // TournamentManager.addPlayerToTournament( levelId, topicId, minPlayers, player)
          // --> uses GameManager for individual games
        */

        // maxPlayers = 4;
        maxPlayers = playerData.playersPerMatch || defaultMaxPlayers;

        var gamePlayers = GameManager.getGamePlayers( playerData.topicId ),
            usersJoined = gamePlayers.length;

        if( usersJoined === maxPlayers ) {
          var gameId = uuid.v1(); // generate a unique game-id

          // @params (topicId, number of questions, callback)
          questionBank.getQuizQuestions( playerData.topicId, 5 , function( err, questions ) {
            // prepare the LeaderBoard for the game
            var players = [];
            gamePlayers.forEach( function(player) { // extra loop to exclude player.client from leaderBoard and prevent CallStack Overflow error
              var gamePlayer = {
                userId: player.userId,
                playerName: player.playerName,
                playerPic: player.playerPic,
                score: 0 // add score to gamePlayer and initialize it to zero
              }
              players.push( gamePlayer );
            });
            LeaderBoard.createNewLeaderBoard( gameId, players );
            /*  Note: Keep separate loops to prepare LeaderBoard and to prepare startGameData
                      This will reduce the time-lag between successive startGame emits
            */
            console.log('\n');
            // prepare startGameData and emit startGame for each player
            gamePlayers.forEach( function(player) {
              var startGameData  = {
                gameId: gameId,
                levelId: playerData.levelId, // defined only for tournaments
                topicId: playerData.topicId,
                maxPlayers: maxPlayers,
                questions: questions
              };
              player.client.emit('startGame', startGameData );
              console.log("Starting game for " + player.userId );
            });
          });// end getQuizQuestions

        } else if( usersJoined < maxPlayers ){
          console.log('pendingUsersCount = ' + (maxPlayers-usersJoined));
          gamePlayers.forEach( function(player) {
            player.client.emit('pendingUsers', { pendingUsersCount: (maxPlayers-usersJoined) });
          });
        } else {
          console.log('Somethings is wrong!!. usersJoined > maxPlayers ');
          gamePlayers.forEach( function(player) {
            player.client.emit('serverError', { pendingUsersCount: (maxPlayers-usersJoined) });
          });
        }
      } else {
        console.log('User session does not exist for: ' + playerData.userId + '. Or the user client was knocked out.');
        client.emit( 'userNotAuthenticated' ); //this may not be of much use
      }
    }); // end client-on-join

    client.on( 'isPlayingThisTopic', function( playerData ) {

    });

    client.on('confirmAnswer',function(data){
      if(data.ans =='correct'){
        //increment correct of allplayers
        //decrement unsawered of all players
        GameManager.getGamePlayers(data.topicId).forEach(function(player){
          player.client.emit('isCorrect');
        });
      }
      else{
        //increment wrong of allplayers
        //decrement unsawered of all players
        GameManager.getGamePlayers(data.topicId).forEach(function(player){
          player.client.emit('isWrong');
        });
      }
    });

    client.on('updateStatus',function( gameData ){
      if ( client.request.session && gameData.userId == client.request.session.user.local.username ) {
        LeaderBoard.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );

        var intermediateGameBoard = LeaderBoard.get( gameData.gameId ),
            len = intermediateGameBoard.length,
            gameTopper = intermediateGameBoard[0];
        GameManager.getGamePlayers(gameData.topicId).forEach( function( player, index) {
          player.client.emit('takeScore', {myRank: index+1, topperScore:gameTopper.score, topperImage:gameTopper.playerPic });
        });
      } else {
        console.log('User session does not exist for the user: ' + gameData.userId );
      }
    });

    client.on( 'gameFinished', function( game ) {
      var gameBoard = LeaderBoard.get( game.gameId );
      if ( gameBoard ) {
        var gameResultObj = {
          gameId: game.gameId,
          topicId: game.topicId,
          gameBoard: gameBoard
        }
        client.emit('takeResult', { error: null, gameResult: gameResultObj } );

        // store the finished game into MongoDB
        storeResult( game.gameId, game.levelId, game.topicId, gameBoard, function() {
          GameManager.popGame( game.topicId ); // pop and delete the reference to the game from GameManager
          console.log('Result saved and Game popped: ' + game.topicId);
        });

      } else {
        console.log('LeaderBoard for ' + gameId + ' does not exist. Check in join event.');
        client.emit('takeResult', { error: 'Result of your last game on ' + game.topicId + ' could not be retrived.'} );
      }
    });

    client.on('updateProfile',function(clientData){
      var levelId = clientData.levelId,
      tournamentId = levelId ? levelId.substring(0, levelId.indexOf('_')) : null;
      // above logic entirely depends on levelId having underscore('_')

      if ( tournamentId ) { // update coming from a tournament
        Profile.findOne({userId:clientData.userId},function(err,profileData){
          addTournamentToProfile( client, profileData, levelId, tournamentId, clientData );
        });
      } else {
        // update solo topic play
        Profile.findOne({userId:clientData.userId},function(err,profileData){
          profileData.totalGames++;
          if(clientData.rank == 1){
            profileData.wins++;
          }
          profileData.topicsPlayed.forEach(function(topic){
            if(topic.topicId == clientData.topicid){
              topic.gamesPlayed++;
              if(clientData.rank == 1){
                topic.gamesWon++;
              }
              topic.points+=clientData.score;
              topic.level = findLevel(topic.points);
            }
          });
          validateAndSaveProfile( profileData, client );
        });// end Profile.findOne()
      }
    });

    client.on('leaveGame', function( topicId ){
      console.log('\nLeave game called');
      if( GameManager.getGamePlayers( topicId ) && GameManager.getGamePlayers( topicId ).length ) {
        var index = GameManager.getGamePlayers( topicId ).indexOf( client.request.session.user.local.username );
        if ( index >=0 ) {
          var userLeft = GameManager.getGamePlayers( topicId ).splice( index,1);
          console.log( userLeft.userId + ' left the game ' + topicId);
        } else {
          console.log( client.request.session.user.local.username + ' is not playing in ' + topicId );
        }
      } else {
        console.log( 'Game with topicId = ' + topicId + ' doesnot exist.');
      } // GameManager.get(topicId).delete(client.request.session.passport.user.local.username);
    }); // end client-on-leaveGame
  });

}

// store the game result in MongoDB
function storeResult( gameId, levelId, topicId, gameBoard, done ) {
  Game.findOne( {gameId: gameId}, function(err, game) {
    if (err) {
      console.log('Mongo error while finding a game.');
      console.error(err);
    } else {
      if ( game ) {
        // game has already been saved. Don't save it again
        console.log('Game already saved: ' + gameId);
      } else {
        var playerList = [];
        gameBoard.sort( function(a,b) { // sort the leaderBoard in asc order of score
                    return b.score-a.score;
                  });
        gameBoard.forEach( function( player, index ) {
          var tempPlayer = { // this looks redundant. No need to save the rank. Sort by score instead
            'userId': player.userId,
            'playerName' : player.playerName,
            'playerPic': player.playerPic,
            'totalScore': new Number(player.score)
          }
          playerList.push( tempPlayer );
        });

        // Save the finished game to MongoDB
        var newGame = new Game({
          gameId: gameId,
          players: playerList
        });

        newGame.save(function (err, data) {
          if ( err ) {
            if (err.name === 'MongoError' && err.code === 11000) {
              console.log('Finished game already saved to Mongo.');
            } else {
              console.error(err);
            }
          } else {
            console.log('Game saved to MongoDB : ' + newGame.gameId );
            if( levelId ) {
              var tournamentId = levelId.substr(0,levelId.lastIndexOf("_"));
              updateTournamentAfterEveryGame( tournamentId, levelId, data._id, playerList, done );
            } else {
              done(); // done after saving if the game is not from a tournament
            }
          }
        });
      }
    }
  });
};

// add played tournament to user profile
function addTournamentToProfile( client, profileData, levelId, tournamentId ,clientData ) {
  var levelCleared = levelId.substr( levelId.indexOf('_') + 1 ),
      len = profileData.tournaments ? profileData.tournaments.length : 0,
      tournamentFound = false;

  for (var i = 0; i < len; i++) {
    if ( profileData.tournaments[i].tournamentId == tournamentId ) {
      tournamentFound = true;
      console.log( tournamentId + ' tournament updated in user profile');
      if ( profileData.tournaments[i].status == 'COMPLETED' ) {
        console.log('ERROR: User has already COMPLETED the ' + tournamentId + ' tournament.');
      } else {
        if ( profileData.tournaments[i].levelCleared === levelCleared ) {
          console.log('ERROR: User has already played level '+ levelCleared + ' of ' + tournamentId );
        } else {
          profileData.tournaments[i].levelCleared = levelCleared;
          profileData.tournaments[i].levelPoints[levelCleared-1] = clientData.score ;
          profileData.tournaments[i].currentRank = clientData.rank;
          if ( levelCleared == profileData.tournaments[i].finalLevel ) {
            profileData.tournaments[i].status = 'COMPLETED';
          }
          validateAndSaveProfile( profileData, client );
        }
      }
      break;// break if a Tournament was found
    }
  }// end for

  if( !tournamentFound ) {
    console.log('New tournament insert in user profile');
    Tournament.findOne({_id: tournamentId }, function(err, tournament ) {
      if ( err ) {
        console.log('Cannot find the tournament : ' + tournamentId);
        console.error(err);
      }else {
        var newTournamentObj = {
          "tournamentId": tournamentId,
          "status": 'PLAYING',
          "levelCleared": levelCleared,
          "levelPoints":[clientData.score],
          "currentRank":clientData.rank,
          "finalLevel": tournament.matches
        };
        // profileData.tournaments = profileData.tournaments ? profileData.tournaments.push(newTournamentObj) : [newTournamentObj];
        profileData.tournaments.push( newTournamentObj );
        validateAndSaveProfile( profileData, client );
      }
    }); //end Tournament.findOne()
  }// end if tournament not Found
}

// persist user profile to MongoDB
function validateAndSaveProfile( profileData, client ) {
  var validationError = profileData.validateSync();
  if ( validationError ) {
    console.log('Mongoose validaton error of user profile.');
    return console.error(validationError);
  } else {
    profileData.save( function(err, updatedUserProfile ) {
      if ( err ) {
        console.log('Could not save the updated user profile to MongoDB!');
        console.error(err);
      }else {
        console.log("User profile persisted sucessfully!!\n");
        // use the refreshUser event on client side (in userProfileController) to refresh the user stats after every game
        client.emit('refreshUser', { error: null, user: updatedUserProfile } );
      }
    }); //end save
  }
}


//Updateing tournament after each game played
function updateTournamentAfterEveryGame( tournamentId, levelId, gameID, playerList, done ) {
  console.log('\nUpdate tournament called');
  Tournament.findOne({ _id: tournamentId }, function( err, tournamentData ) {
    if(err) {
      console.log('Tournament ' + tournamentId + ' could not be read from MongoDB.');
      console.log(err);
    } else {
      tournamentData.totalGamesPlayed++;
      tournamentData.topics.some( function(topic) {
        if(topic._Id == levelId) {
          topic.games.push( gameID );
          return true;
        }
      });
      playerList.forEach( function( player ) {
        var isPlayerOnBoard = tournamentData.leaderBoard.some( function( boardPlayer ) {

          if ( player.userId == boardPlayer.userId ) {
            console.log('\nPlayer on LeaderBoard. updating score');
            boardPlayer.totalScore += new Number(player.score);
            return true;
          }
        });
        // put the player on leaderBoard
        if ( !isPlayerOnBoard ) {
          console.log('\nPushing new player to leaderboard');
          tournamentData.leaderBoard.push( player );
        }
      }); // end playerList.forEach

      // save the updated tournamentData to MongoDB
      tournamentData.save( function(err, savedTournament ) {
        if ( err ) {
          console.log('Tournament could not be saved to MongoDB.');
          console.error(err);
        } else {
          console.log('Tournament saved to MongoDB : ' + tournamentId);
          done(); // done after saving the game in tournament, updating it, and refreshing the leaderBoard
        }
      });
    }
  }); // end tournament.findOne
}
//
//   var temp = tournamentData.leaderBoard.filter(function(item){
//     return (item.userId == player.userId);
//   });
//
//   if( temp.length == 0 ) {
//     tournamentData.leaderBoard.push( player );
//   } else {
//     var tempVar=temp[0];
//     var ind=tournamentData.leaderBoard.indexOf(tempVar);
//     tournamentData.leaderBoard[ind].totalScore+=player.score;
//   }
// });
//
// tournamentData.save();
// console.log("updated tournament space");

var levelScore = function(n) {
  return ((35 * (n * n)) +(95*n)-130);
};

var findLevel = function(points) {
  var i=1;
  while(points>=levelScore(i)) {
    i++;
  }
  return i-1;
};
