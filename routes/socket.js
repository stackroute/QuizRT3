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

// var GameManager = require('./gameManager/GameManager.js'),
var GameManager = require('./gameManager/AlphaGameManager.js'),
    TournamentManager = require('./tournamentManager/TournamentManager2.js'),
    tournamentManager = require('./tournamentManager/tournamentManager.js'),
    defaultMaxPlayers = 2;
    maxPlayers = 0;

module.exports = function(server,sessionMiddleware) {
  var io = require('socket.io')(server);
  io.use(function(socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
  });
  io.on('disconnect',function(client){
    console.log( 'Server crashed. All the clients were disconnected from the server.');
  })

  var normalGameSocket = io
      .of('/normalGame')
      .on('connection', function(client) {
        if ( client.request.session && client.request.session.user ) {
          console.log( client.request.session.user + ' connected to QuizRT server. Socket Id: ' + client.id);
        }

        client.on('disconnect', function() {
          if ( client.request.session && client.request.session.user ) {
            GameManager.popPlayer( client.request.session.user ); // pop the user from all the games
            console.log( client.request.session.user + ' disconnected from QuizRT server. Socket Id: ' + client.id);
          }
        });
        client.on('logout', function( userData, done) {
          console.log( client.request.session.user + ' logged out.');
          done( GameManager.popPlayer( client.request.session.user ) );
          client.request.session.user = null;
      		client.request.logout();
        });

        client.on('join',function( playerData ) {
          console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId );
          // check if the user is authenticated and his session exists, if so add him to the game
          if ( client.request.session && (playerData.userId == client.request.session.user) ) {//req.session.user
            var gamePlayer = {
              userId: playerData.userId,
              playerName: playerData.playerName,
              playerPic: playerData.playerPic,
              client: client
            };

            maxPlayers = playerData.playersPerMatch || defaultMaxPlayers;
            var addedSuccessfully = GameManager.managePlayer( playerData.topicId, maxPlayers, gamePlayer ); // add the player against the topicId.
            if ( addedSuccessfully === false ) {
              console.log('User is already playing the game ' + playerData.topicId + '. Cannot add him again.');
              client.emit('alreadyPlayingTheGame', { topicId: playerData.topicId });
            }
          } else {
            console.log('User session does not exist for: ' + playerData.userId + '. Or the user client was knocked out.');
            client.emit( 'userNotAuthenticated' ); //this may not be of much use
          }
        }); // end client-on-join


        client.on('confirmAnswer',function(data){
          if(data.ans =='correct'){
            //increment correct of allplayers
            //decrement unsawered of all players
            GameManager.getGamePlayers(data.gameId).forEach(function(player){
              player.client.emit('isCorrect');
            });
          }
          else{
            //increment wrong of allplayers
            //decrement unsawered of all players
            GameManager.getGamePlayers(data.gameId).forEach(function(player){
              player.client.emit('isWrong');
            });
          }
        });

        client.on('updateStatus',function( gameData ){
          if ( client.request.session && gameData.userId == client.request.session.user ) {
            GameManager.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );

            var intermediateGameBoard = GameManager.getLeaderBoard( gameData.gameId ),
                len = intermediateGameBoard.length,
                gameTopper = intermediateGameBoard[0];
            GameManager.getGamePlayers(gameData.gameId).forEach( function( player, index) {
              player.client.emit('takeScore', {myRank: index+1, topperScore:gameTopper.score, topperImage:gameTopper.playerPic });
            });
          } else {
            console.log('User session does not exist for the user: ' + gameData.userId );
          }
        });

        client.on( 'gameFinished', function( game ) {
          GameManager.finishGame( game );
        });

        client.on('leaveGame', function( gameId ){
          GameManager.leaveGame( gameId, client.request.session.user );
        }); // end client-on-leaveGame
      });// end normalGameSocket



      var tournamentSocket = io
          .of('/tournament')
          .on('connection', function(client) {
            if ( client.request.session && client.request.session.user ) {
              console.log( client.request.session.user + ' connected to QuizRT server. Tournament Socket Id: ' + client.id);
            }

            client.on('disconnect', function() {
              if ( client.request.session && client.request.session.user ) {
                GameManager.popPlayer( client.request.session.user ); // pop the user from all the games
                console.log( client.request.session.user + ' disconnected from QuizRT server. Tournament Socket Id: ' + client.id);
              }
            });

            client.on('joinTournament',function( playerData ) {
              console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId + ' of tournament ' + playerData.levelId  );

              if ( client.request.session && (playerData.userId == client.request.session.user) ) {//req.session.user
                var gamePlayer = {
                  userId: playerData.userId,
                  playerName: playerData.playerName,
                  playerPic: playerData.playerPic,
                  client: client
                };

                maxPlayers = playerData.playersPerMatch || defaultMaxPlayers;
                console.log('\nTournamentManager');
                console.log(TournamentManager);
                var addedSuccessfully = TournamentManager.managePlayer( playerData.tournamentId, playerData.topicId, maxPlayers, gamePlayer ); // add the player against the topicId.
                if ( addedSuccessfully === false ) {
                  console.log('User is already playing the game ' + playerData.topicId + ' of ' + playerData.levelId + '. Cannot add him again.');
                  client.emit('alreadyPlayingTheGame', { topicId: playerData.topicId, levelId: playerData.levelId });
                }
              } else {
                console.log('User session does not exist for: ' + playerData.userId + '. Or the user client was knocked out.');
                client.emit( 'userNotAuthenticated' ); //this may not be of much use
              }
            }); // end client-on-joinTournament


            client.on('confirmAnswer',function(data){
              if(data.ans =='correct'){
                //increment correct of allplayers
                //decrement unsawered of all players
                GameManager.getGamePlayers(data.gameId).forEach(function(player){
                  player.client.emit('isCorrect');
                });
              }
              else{
                //increment wrong of allplayers
                //decrement unsawered of all players
                GameManager.getGamePlayers(data.gameId).forEach(function(player){
                  player.client.emit('isWrong');
                });
              }
            });

            client.on('updateStatus',function( gameData ){
              if ( client.request.session && gameData.userId == client.request.session.user ) {
                GameManager.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );

                var intermediateGameBoard = GameManager.getLeaderBoard( gameData.gameId ),
                    len = intermediateGameBoard.length,
                    gameTopper = intermediateGameBoard[0];
                GameManager.getGamePlayers(gameData.gameId).forEach( function( player, index) {
                  player.client.emit('takeScore', {myRank: index+1, topperScore:gameTopper.score, topperImage:gameTopper.playerPic });
                });
              } else {
                console.log('User session does not exist for the user: ' + gameData.userId );
              }
            });

            client.on( 'gameFinished', function( game ) {
              console.log(client.request.session.user + ' finished game: ' + game.gameId );
              var gameBoard = GameManager.getLeaderBoard( game.gameId );
              if ( gameBoard ) {
                var gameResultObj = {
                  gameId: game.gameId,
                  topicId: game.topicId,
                  levelId: game.levelId,
                  gameBoard: gameBoard
                }
                client.emit('takeResult', { error: null, gameResult: gameResultObj } );
                // store the finished game into MongoDB
                storeResult( game.gameId, game.levelId, game.topicId, gameBoard, function() {
                  setTimeout( function() {
                    GameManager.popGame( game.gameId ); // pop and delete the reference to the game from GameManager
                    console.log('Result saved and Game popped: ' + game.gameId);
                  }, 100);
                });

              } else {
                console.log('LeaderBoard for ' + gameId + ' does not exist. Check in GameManager.js.');
                client.emit('takeResult', { error: 'Result of your last game on ' + game.topicId + ' could not be retrived.'} );
              }
            });

            client.on('updateProfile',function(clientData){
              var updateProfileObj = {
    						score: clientData.score,
    						rank: clientData.rank,
    						topicid: clientData.topicId, // change this with $scope.topicId
    						userId: clientData.userId,
    						levelId: clientData.levelId
    					};
              console.log('updateProfileObj',updateProfileObj);
              updateProfile( client, clientData);
            });

            client.on('leaveGame', function( gameId ){
              GameManager.leaveGame( gameId, client.request.session.user );
            }); // end client-on-leaveGame
          });// end tournament socket
}
