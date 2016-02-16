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

var gameManager = require('./gameManager/gameManager.js'),
    tournamentManager = require('./tournamentManager/tournamentManager.js'),
    LeaderBoard = require('./gameManager/Leaderboard.js'),
    uuid= require('node-uuid'),
    Game = require("./../models/game"),
    Profile = require("./../models/profile"),
    Tournament=require("./../models/tournament"),
    defaultMaxPlayers =4;
    maxPlayers=0;

module.exports = function(server,sessionMiddleware) {
  var io = require('socket.io')(server);
  io.use(function(socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
  });
  io.on('disconnect',function(client){
    // Players.delete(client.request.session.user,client);
    console.log( client.request.session.user.local.username + ' left a game (or was disconnected from one).');
    client.request.session.destroy();
  })

  io.on('connection', function(client) {

    client.on('join',function( playerData ) {
      console.log('\n' + playerData.userId + ' joined');
      // check if the user is authenticated and his session exists, if so add him to the game
      if ( client.request.session && (playerData.userId == client.request.session.user.local.username) ) {//req.session.user.local.username
        var gamePlayer = {
          userId: playerData.userId,
          playerName: playerData.playerName,
          playerPic: playerData.playerPic,
          client: client
        };
        gameManager.addPlayerToGame( playerData.topicId, gamePlayer ); // add the player against the topicId.
        /*
          The above logic has to be improved to map game-id and players for that game
          For now we cannot have two games on the same topic running simultaneously
        */

        maxPlayers = 3;
        // maxPlayers=data.playersPerMatch || defaultMaxPlayers;

        var gamePlayers = gameManager.topicsMap.get( playerData.topicId ),
            usersJoined = gamePlayers.length;
        if( usersJoined == maxPlayers ) {
          console.log('\nPopping the topic from gameManager');
          gameManager.popGame( playerData.topicId ); // pop the game from topicsMap and start the game
          var gameId = uuid.v1(); // generate a unique game-id

          // make the questions reserviour here.
          // It will save N additional socket calls coming from N sockets

          gamePlayers.forEach( function(player) {
            LeaderBoard.addPlayer( gameId, player );
            player.client.emit('startGame', { gameId: gameId, maxPlayers: maxPlayers });
            console.log("\nStarting game...");
          }); //end gamePlayers.forEach
        } else {
          gamePlayers.forEach( function(player) {
            console.log('\nEmitting pendingUsers');
            player.client.emit('pendingUsers', { pendingUsersCount: (maxPlayers-usersJoined) });
          });
        }
      } else {
        console.log('User session doesnot exist for: ' + playerData.userId );
        client.emit( 'userNotAuthenticated' );
      }
    }); // end client-on-join

    client.on('confirmAnswer',function(data){
      if(data.ans =='correct'){
        //increment correct of allplayers
        //decrement unsawered of all players
        LeaderBoard.games.get(data.gameID).forEach(function(player){
          player.client.emit('isCorrect');
        });
      }
      else{
        //increment wrong of allplayers
        //decrement unsawered of all players
        LeaderBoard.games.get(data.gameID).forEach(function(player){
          player.client.emit('isWrong');
        });
      }
    });

    client.on('updateStatus',function( gameData ){
      if ( client.request.session && gameData.userId == client.request.session.user.local.username ) {
        LeaderBoard.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );

        var intermediateGameBoard = LeaderBoard.games.get( gameData.gameId ),
            len = intermediateGameBoard.length,
            gameTopper = intermediateGameBoard[0];
        intermediateGameBoard.forEach( function( player, index) {
          player.client.emit('takeScore', {myRank: index+1, topperScore:gameTopper.score, topperImage:gameTopper.playerPic });
        });
      } else {
        console.log('User session doesnot exist for the user: ' + gameData.userId );
      }
    });

    client.on( 'gameFinished', function( gameId ) {
      var finishedGameBoard = LeaderBoard.games.get( gameId );
      if ( finishedGameBoard ) {
        for (var i = 0; i < finishedGameBoard.length; i++) {
          if( finishedGameBoard[i].client )
            delete finishedGameBoard[i].client;
        }
        client.emit('takeResult', { error: null, finishedGameBoard: finishedGameBoard } );
      } else {
        console.log('LeaderBoard for ' + gameId + ' does not exist.');
        client.emit('takeResult', { error: 'Result of your last game could not be retrived.'} );
      }

    });

    client.on('getResult',function( gameId ){
      var finishedGameBoard = LeaderBoard.games.get( gameId );
      for (var i = 0; i < finishedGameBoard.length; i++) {
        delete finishedGameBoard[i].client;
      }
      client.emit('takeResult', finishedGameBoard );
    });

    client.on('updateProfile',function(clientData){
      var levelId = clientData.levelId,
      tournamentId = levelId ? levelId.substring(0, levelId.indexOf('_')) : null;
      // above logic entirely depends on levelId having underscore('_')

      console.log('Update profile called');
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

    client.on('storeResult',function(gameData){
      console.log('\nStoreResult called');
      var playerlist = [];
      var gameId=gameData.gameId;
      var tid=gameData.topicId;
      var tournamentId="";
      var levelId="";
      if(gameData.levelId)
      {
        levelId=gameData.levelId;
        tournamentId=levelId.substr(0,levelId.lastIndexOf("_"));

      }
      LeaderBoard.games.get(gameId).forEach(function(player,index){
        //console.log(player);
        var temp = {
          'userId': player.sid,
          'name' : player.name,
          'imageUrl': player.imageUrl,
          'rank':index+1,
          'score': player.score
        }
        playerlist.push(temp);
      });
      var game1= new Game({
        gId: gameId,
        players:playerlist
      });
      game1.save(function (err, data) {
        if (err) console.log(err);
        else {
          if(gameData.levelId)
          {
            updateTournamentAfterEveryGame(tournamentId,levelId,data._id,playerlist);
          }
        }
      });

    });


      // for (var i = 0; i <leaderBoard.LeaderBoard.games.get(data.gameID).length; i++) {
      //   if (leaderBoard.LeaderBoard.games.get(data.gameID)[i].sid == client.request.session.passport.user){
      //     myRan= i+1;
      //   }
      // }
      // client.emit('takeScore', {myRank:myRan});
      // leaderBoard.LeaderBoard.games.get(data.gameID).forEach(function(player){
      //   var myRan=0;
      //   for (var i = 0; i <leaderBoard.LeaderBoard.games.get(data.gameID).length; i++) {
      //     if (leaderBoard.LeaderBoard.games.get(data.gameID)[i].sid == player.client.request.session.passport.user){
      //       myRan= i+1;
      //     }
      //   }
      //   player.client.emit('takeScore', {myRank: myRan,topperScore:leaderBoard.LeaderBoard.games.get(data.gameID)[0].score,topperImage:leaderBoard.LeaderBoard.games.get(data.gameID)[0].imageUrl});
      // });
    //});

    client.on('leaveGame',function( topicId ){
      console.log('\nLeave game called');
      if( gameManager.topicsMap.get( topicId ) && gameManager.topicsMap.get( topicId ).length ) {
        var index = gameManager.topicsMap.get( topicId ).indexOf( client.request.session.user.local.username );
        if ( index >=0 ) {
          var userLeft = gameManager.topicsMap.get( topicId ).splice( index,1);
          console.log( userLeft.userId + ' left the game ' + topicId);
        } else {
          console.log( client.request.session.user.local.username + ' is not playing in ' + topicId );
        }
      } else {
        console.log( 'Game with topicId = ' + topicId + ' doesnot exist.');
      } // gameManager.topicsMap.get(topicId).delete(client.request.session.passport.user.local.username);
    }); // end client-on-leaveGame
  });

}

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
function updateTournamentAfterEveryGame(tournamentId,levelId,gameID,playerList)
{

  Tournament.findOne({_id:tournamentId},function(err,tournamentData){
    if(err)
    {
      console.log(err);
    }
    else {
      tournamentData.totalGamesPlayed++;
      tournamentData.topics.forEach(function(topic){
        if(topic.userId==levelId)
        {
          topic.games.push(gameID);
        }

      });

      playerList.forEach( function(player) {
        var temp=tournamentData.leaderBoard.filter(function(item){
          return (item.userId==player.userId)
        });

        if(temp.length==0)
        {
          //tournamentData.leaderBoard.push({userId:player.userId,totalScore:player.score});
          tournamentData.leaderBoard.push(player);
        }
        else {
          var tempVar=temp[0];
          var ind=tournamentData.leaderBoard.indexOf(tempVar);
          tournamentData.leaderBoard[ind].totalScore+=player.score;
        }
      });
      tournamentData.leaderBoard.sort(function(a, b) {
        return b.totalScore - a.totalScore;
      });

      tournamentData.save();
      console.log("updated tournament space");
    }

  });

}


// function game(gameId,Players,isRunning){
//   this.isRunning = isRunning;
//   this.gameId = gameId;
//   this.Players = Players;
// };
//
// function getRankAndTopScore(gameId,score,sessionID){
//   var rank =0;
//   var topScore=score;
//   var match = getMatch(gameId);
//   match.Players.get(sessionID).score= score;
//   match.Players.forEach(function(item,key,value){
//     if(key != sessionID){
//       if(match.Players.get(key).score > score)
//       rank++;
//       if(match.Players.get(key).score > score)
//       topScore = match.Players.get(key).score;
//     }
//   });
//   return {rank:rank+1,topScore:topScore};
// };
//
//
// function getMatch(gameId){
//   for (var i = 0; i < allGames.length; i++) {
//     if(allGames[i].gameId == gameId){
//       return allGames[i];
//     }
//   }
//   return null;
// };

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
