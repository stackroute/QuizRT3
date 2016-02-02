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

var gameManager = require('./gameManager/gameManager.js');
var leaderBoard = require('./gameManager/leaderboard.js');
var uuid= require('node-uuid');
var Game = require("./../models/game");
var Profile = require("./../models/profile");
var maxPlayers =4;
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
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
      console.log(data);
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
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
        profileData.save();
      });
    });
    client.on('storeResult',function(gameData){
      var playerlist = [];
      leaderBoard.leaderBoard.get(gameData).forEach(function(player,index){
          var temp = {
            'userId': player.sid,
            'rank':index+1,
            'score': player.score
          }
          playerlist.push(temp);
      });
      var game1= new Game({
        gId: gameData,
        players:playerlist
      });
      game1.save(function (err, data) {
      if (err) console.log(err);
      else {
        console.log('$&$&$&$&$&$&$&$&$&$&$&$&$&$&$&&$&$$&$&$&$&$&$&$&$&$&$&$&$&$');
        console.log('Saved ');
        console.log('$&$&$&$&$&$&$&$&$&$&$&$&$&$&$&&$&$$&$&$&$&$&$&$&$&$&$&$&$&$');
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
        console.log("----------------------------------------");
        console.log(player);
        console.log("----------------------------------------");
        tempLeaderBoard.push(temp);
        console.log("++++++++++++++++++++++++++++++++++++++++");
        console.log(tempLeaderBoard);
        console.log("++++++++++++++++++++++++++++++++++++++++");
    //     //  Players.get(data1.players[1]).join(gameID,function(){
    //     //    io.in(gameID).emit('startGame',"this is game id "+gameID);
    //     //  });
    //      data1.players.forEach(function(player,index){
    //         Players.get(player).join(gameID);
    //         if(index == data1.players.length - 1){
    //         }
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
      // leaderBoard.addPlayer(data.gameID,client.request.session.passport.user,client,data.name,data.score,data.image);
      console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
      console.log(data);
      console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
      leaderBoard.updateScore(data.gameID, client.request.session.passport.user, data.score);
      //
      // arrayofPlayers=leaderBoard.getGamePlayers(data.gameID);

      var topperDat=leaderBoard.leaderBoard.get(data.gameID)[0];
      console.log("******************************************************************");
      console.log(topperDat);
      console.log("*******************************************************************");

      var len = leaderBoard.leaderBoard.get(data.gameID).length;
      console.log("99999999999999999999999999999999999999999999999999");
      console.log(len);
      console.log("99999999999999999999999999999999999999999999999999");

      // for (var i = 0; i <leaderBoard.leaderBoard.get(data.gameID).length; i++) {
      //   if (leaderBoard.leaderBoard.get(data.gameID)[i].sid == client.request.session.passport.user){
      //     myRan= i+1;
      //   }
      // }
      // console.log("******************************************************************");
      // console.log(myRan);
      // console.log("*******************************************************************");

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
        console.log('my rank');
        console.log(index+1);
        console.log('my rank');
        player.client.emit('takeScore', {myRank: index+1, topperScore:leaderBoard.leaderBoard.get(data.gameID)[0].score, topperImage:leaderBoard.leaderBoard.get(data.gameID)[0].imageUrl});
      });
    });

    client.on('join',function(data){
      console.log('session object -------------------------------------');
      console.log(client.request.session);
      console.log('session object -------------------------------------');
      gameManager.addPlayer(data.tid, client.request.session.passport.user, client,data.name,data.image);

      if(gameManager.players.get(data.tid).size==maxPlayers){
        var topicPlayers= gameManager.popPlayers(data.tid);
        console.log("666666666666666666666666666666666");
        console.log(topicPlayers);
        console.log("666666666666666666666666666666666");

        var gameId= makeid();

        topicPlayers.forEach(function(player){
        leaderBoard.addPlayer(gameId, player.sid, player.clientData.client, player.clientData.name, 0,player.clientData.imageUrl);
        player.clientData.client.emit('startGame',{gameId:gameId,maxPlayers:maxPlayers});
        });
      }

    });


    client.on('leaveGame',function(topicID){
      // console.log(data);
      if(gameManager.players.get(topicID)) gameManager.players.get(topicID).delete(client.request.session.passport.user);
    });

  });

}

function renderThegame(matches){
  if(matches.Players.size < maxPlayers){

    }
    else{
      matches.Players.forEach(function(item,key,value){
        matches.Players.get(key).emit('startGame',matches.gameId);
      });
    }
};


function makeid()
{
    // var text = "";
    // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //
    // for( var i=0; i < 10; i++ )
    //     text += possible.charAt(Math.floor(Math.random() * possible.length));
    //
    // return text;
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

levelScore = function(n)
{
  return ((35 * (n * n)) +(95*n)-130);
};

findLevel = function(points){

  var i=1;
  while(points>=levelScore(i))
  {
    i++;
  }

  return i-1;

};
