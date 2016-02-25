var Game = require("../../models/game"),
    Profile = require("../../models/profile"),
    Tournament = require("../../models/tournament");

module.exports = {

  saveGameToMongo : function( gameData, gameBoard, done ) {
    var self = this;
    Game.findOne( {gameId: gameData.gameId}, function(err, game) {
      if (err) {
        console.log('Mongo error while finding a game.');
        console.error(err);
      } else {
        if ( game ) {
          // game has already been saved. Don't save it again
          console.log('Game already saved: ' + gameData.gameId);
        } else {
          var playerList = [];
          gameBoard.sort( function(a,b) { // sort the leaderBoard in asc order of score
                      return b.score-a.score;
                    });
          gameBoard.forEach( function( player, index ) {
            var tempPlayer = { // this looks redundant.
              'userId': player.userId,
              'playerName' : player.playerName,
              'playerPic': player.playerPic,
              'totalScore': new Number(player.score)
            }
            playerList.push( tempPlayer );
          });

          // Save the finished game to MongoDB
          var newGame = new Game({
            gameId: gameData.gameId,
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
              if( gameData.levelId ) {
                var tournamentId = gameData.levelId.substr(0,gameData.levelId.lastIndexOf("_"));
                self.updateTournamentAfterEveryGame( tournamentId, gameData.levelId, data._id, playerList, done );
              } else {
                done(); // done after saving if the game is not from a tournament
              }
            }
          });
        }
      }
    });
  },

  // update the user profilePic
  updateProfile: function( clientData, done ) {
    var self = this,
        levelId = clientData.levelId,
        tournamentId = levelId ? levelId.substring(0, levelId.indexOf('_')) : null;
    // above logic entirely depends on levelId having underscore('_')

    if ( tournamentId ) { // update coming from a tournament
      Profile.findOne({userId:clientData.userId},function(err,profileData){
        this.addTournamentToProfile( profileData, levelId, tournamentId, clientData, done );
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
            topic.level = self.findLevel(topic.points);
          }
        });
        self.validateAndSaveProfile( profileData, done );
      });// end Profile.findOne()
    }
  },

  // add played tournament to user profile
  addTournamentToProfile: function( client, profileData, levelId, tournamentId ,clientData, done ) {
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
            this.validateAndSaveProfile( profileData, done );
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
          this.validateAndSaveProfile( profileData, done );
        }
      }); //end Tournament.findOne()
    }// end if tournament not Found
  },

  // persist user profile to MongoDB
  validateAndSaveProfile: function( profileData, done ) {
    var validationError = profileData.validateSync();
    if ( validationError ) {
      console.log('Mongoose validaton error of user profile.');
      return console.error(validationError);
    } else {
      profileData.save( function(err, updatedUserProfile ) {
        if ( err ) {
          console.log('Could not save the updated user profile to MongoDB!');
          console.error(err);
          done({error:'Could not save the updated user profile to MongoDB!'});
        }else {
          console.log("User profile persisted sucessfully!!");
          done({error:null, updatedUserProfile: updatedUserProfile});
        }
      }); //end save
    }
  },

  //Updateing tournament after each game played
  updateTournamentAfterEveryGame: function( tournamentId, levelId, gameID, playerList, done ) {
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
            console.log('Pushing new player to leaderboard');
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
  },
  findLevel: function(points) {
    var i=1;
    while(points>=((35 * (i * i)) +(95*i)-130)) {
      i++;
    }
    return i-1;
  }
}
