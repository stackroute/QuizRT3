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
//

var gameManager = require('./gameManager/gameManager.js'),
tournamentManager = require('./tournamentManager/tournamentManager.js'),
leaderBoard = require('./gameManager/leaderboard.js'),
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
    Players.delete(client.request.session.passport.user,client);
    client.request.session.destroy();
  })

  io.on('connection', function(client) {
    client.on('updateProfile',function(data){
      var levelId = data.levelId,
      tournamentId = levelId ? levelId.substring(0, levelId.indexOf('_')) : null;
      // above logic entirely depends on levelId having underscore('_')

      console.log('Update profile called');
      if ( tournamentId ) { // update coming from a tournament
        Profile.findOne({userId:data.userID},function(err,profileData){
          addTournamentToProfile( client, profileData, levelId, tournamentId, data );
        });
      } else {
        // update solo topic play
        Profile.findOne({userId:data.userID},function(err,profileData){
          profileData.totalGames++;
          if(data.rank == 1){
            profileData.wins++;
          }
          profileData.topicsPlayed.forEach(function(topic){
            if(topic.topicId == data.topicid){
              topic.gamesPlayed++;
              if(data.rank == 1){
                topic.gamesWon++;
              }
              topic.points+=data.score;
              topic.level = findLevel(topic.points);
            }
          });
          validateAndSaveProfile( profileData, client );
        });// end Profile.findOne()
      }
    });
    client.on('storeResult',function(gameData){
      var playerlist = [];
      var gameId=gameData.gameId;
      var tid=gameData.topicId;
      var tournamentID="";
      var levelId="";
      if(gameData.levelId)
      {
        levelId=gameData.levelId;
        tournamentID=levelId.substr(0,levelId.lastIndexOf("_"));

      }
      leaderBoard.leaderBoard.get(gameId).forEach(function(player,index){
        console.log(player);
        var temp = {
          'userId': player.sid,
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
            updateTournamentAfterEveryGame(tournamentID,levelId,data._id,playerlist);
          }
        }
      });

    });
    client.on('getResult',function(data){
      var tempLeaderBoard=[];
      leaderBoard.leaderBoard.get(data).forEach(function(player) {
        var temp={
          'sid': player.sid,
          'name': player.name,
          'imageUrl': player.imageUrl,
          'score': player.score
        };
        tempLeaderBoard.push(temp);
      });
      client.emit('takeResult',tempLeaderBoard);
    });
    client.on('confirmAnswer',function(data){
      if(data.ans =='correct'){
        //increment correct of allplayers
        //decrement unsawered of all players
        leaderBoard.leaderBoard.get(data.gameID).forEach(function(player){
          player.client.emit('isCorrect');
        });
      }
      else{
        //increment wrong of allplayers
        //decrement unsawered of all players
        leaderBoard.leaderBoard.get(data.gameID).forEach(function(player){
          player.client.emit('isWrong');
        });
      }
    });

    client.on('updateStatus',function(data){
      leaderBoard.updateScore(data.gameID, client.request.session.passport.user, data.score);
      var topperDat=leaderBoard.leaderBoard.get(data.gameID)[0];
      var len = leaderBoard.leaderBoard.get(data.gameID).length;

      // for (var i = 0; i <leaderBoard.leaderBoard.get(data.gameID).length; i++) {
      //   if (leaderBoard.leaderBoard.get(data.gameID)[i].sid == client.request.session.passport.user){
      //     myRan= i+1;
      //   }
      // }
      // client.emit('takeScore', {myRank:myRan});
      // leaderBoard.leaderBoard.get(data.gameID).forEach(function(player){
      //   var myRan=0;
      //   for (var i = 0; i <leaderBoard.leaderBoard.get(data.gameID).length; i++) {
      //     if (leaderBoard.leaderBoard.get(data.gameID)[i].sid == player.client.request.session.passport.user){
      //       myRan= i+1;
      //     }
      //   }
      //   player.client.emit('takeScore', {myRank: myRan,topperScore:leaderBoard.leaderBoard.get(data.gameID)[0].score,topperImage:leaderBoard.leaderBoard.get(data.gameID)[0].imageUrl});
      // });

      leaderBoard.leaderBoard.get(data.gameID).forEach(function(player, index){
        player.client.emit('takeScore', {myRank: index+1, topperScore:leaderBoard.leaderBoard.get(data.gameID)[0].score, topperImage:leaderBoard.leaderBoard.get(data.gameID)[0].imageUrl});
      });
    });

    client.on('join',function(data){
      console.log("--------------------------------------");
      console.log( client.request.session);
      console.log("---------------------------------------");
     gameManager.addPlayer(data.tId, client.request.session.passport.user, client,data.name,data.image);
      maxPlayers=1;
      // maxPlayers=data.playersPerMatch || defaultMaxPlayers;

      var usersJoined=gameManager.players.get(data.tId).size;
      var topicPlayers=[];
      if( usersJoined == maxPlayers ) {

        topicPlayers= gameManager.popPlayers(data.tId);

        var gameId= makeid();
        topicPlayers.forEach(function(player){
          leaderBoard.addPlayer(gameId, player.sid, player.clientData.client, player.clientData.name, 0,player.clientData.imageUrl);
          console.log("Starting Normal game");
          player.clientData.client.emit('startGame',{gameId:gameId,maxPlayers:maxPlayers});
        }); //end topicPlayers.forEach
      }
      else
      {
        topicPlayers= gameManager.getAllPlayers(data.tId);
        topicPlayers.forEach(function(player){
          //console.log(maxPlayers+"-"+usersJoined);
          player.clientData.client.emit('pendingUsers',{pendingUsersCount:(maxPlayers-usersJoined)});
        });
      }

    }); // end client.on('join')

    client.on('leaveGame',function(topicID){
      // console.log(data);
      if(gameManager.players.get(topicID)) gameManager.players.get(topicID).delete(client.request.session.passport.user);
    });

  });

}

/*   ***** ALERT  ****** ALERT  */

// Delete this method if it's not used
function renderThegame(matches){
  if( matches.Players.size >= maxPlayers ){
    matches.Players.forEach(function(item,key,value){
      matches.Players.get(key).emit('startGame',matches.gameId);
    });
  }
};



// add played tournament to user profile
function addTournamentToProfile( client, profileData, levelId, tournamentId ,data ) {
  var levelCleared = levelId.substr( levelId.indexOf('_') + 1 ),
  len = profileData.tournaments ? profileData.tournaments.length : 0;

  if ( len ) {// if userProfile has tournaments array
    var tournamentFound = false;

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
            profileData.tournaments[i].levelPoints[levelCleared-1] = data.score ;
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
            "levelPoints":[data.score],
            "finalLevel": tournament.matches
          };
          // profileData.tournaments = profileData.tournaments ? profileData.tournaments.push(newTournamentObj) : [newTournamentObj];
          profileData.tournaments.push( newTournamentObj );
          validateAndSaveProfile( profileData, client );
        }
      }); //end Tournament.findOne()
    }// end if tournament not Found
  }else {
    console.log('First tournament insert in user profile');
    Tournament.findOne({_id: tournamentId }, function(err, tournament ) {
      if ( err ) {
        console.log('Cannot find the tournament : ' + tournamentId);
        console.error(err);
      }else {
        var newTournamentObj = {
          "tournamentId": tournamentId,
          "status": 'PLAYING',
          "levelCleared": levelCleared,
          "levelPoints":[data.score],
          "finalLevel": tournament.matches
        };
        // profileData.tournaments = profileData.tournaments ? profileData.tournaments.push(newTournamentObj) : [newTournamentObj];
        profileData.tournaments.push( newTournamentObj );
        validateAndSaveProfile( profileData, client );
      }
    }); //end Tournament.findOne()
  }
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
        console.log("\nUser profile persisted sucessfully!!");
        client.emit('refreshUser', updatedUserProfile );
      }
    }); //end save
  }
}


//Updateing tournament after each game played
function updateTournamentAfterEveryGame(tournamentID,levelId,gameID,playerList)
{

  Tournament.findOne({_id:tournamentID},function(err,tournamentData){
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
          tournamentData.leaderBoard.push({userId:player.userId,totalScore:player.score});
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




function makeid() {
  return uuid.v1();
};

function game(gameId,Players,isRunning){
  this.isRunning = isRunning;
  this.gameId = gameId;
  this.Players = Players;
};

function getRankAndTopScore(gameId,score,sessionID){
  var rank =0;
  var topScore=score;
  var match = getMatch(gameId);
  match.Players.get(sessionID).score= score;
  match.Players.forEach(function(item,key,value){
    if(key != sessionID){
      if(match.Players.get(key).score > score)
      rank++;
      if(match.Players.get(key).score > score)
      topScore = match.Players.get(key).score;
    }
  });
  return {rank:rank+1,topScore:topScore};
};


function getMatch(gameId){
  for (var i = 0; i < allGames.length; i++) {
    if(allGames[i].gameId == gameId){
      return allGames[i];
    }
  }
  return null;
};

levelScore = function(n) {
  return ((35 * (n * n)) +(95*n)-130);
};

findLevel = function(points) {
  var i=1;
  while(points>=levelScore(i)) {
    i++;
  }
  return i-1;
};
