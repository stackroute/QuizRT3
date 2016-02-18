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
//   Name of Developers  Abhinav Kareer,Sunil Mekala, Chandu
//
var express = require('express'),
    Reservoir = require('reservoir'),
    router = express.Router(),
    Profile = require("../models/profile"),
    Tournament = require("../models/tournament");



router.route('/tournaments')
    .get(function(req, res) {
        Tournament.find()
            .populate("topics.name")
            .exec(function(err, tournaments) {
                if (err) {
                    return res.send(err);
                }
                return res.json(tournaments);
            });
    })
    .post( function(req,res) {// not used . Can be used to retrieve multiple tournaments. takes tournamentIds array
      if ( req.data && req.data.tournamentIds ) {
        Tournament.find({'_id':{'$or': req.data.tournamentIds }})
                  .exec( function(err, userTournaments){
                    if ( err ) {
                      console.log('Database error. Failed to retrieve user tournaments.');
                      res.writeHead(500,{'Content-Type':'application/json'});
                      res.end({error:'Database error. Failed to retrieve user tournaments.'})
                    } else {
                      res.json({error:null, userTournaments: userTournaments });
                    }
                  });
      } else {
        res.writeHead(204, {'Content-Type':'application/json'} );
        res.end(JSON.stringify( { error:null, userTournaments: null } ));
      }
    });

router.route('/tournament/:tId')
    .get(function(req, res) {
        Tournament.findById(req.params.tId)
            .populate("topics.name")
            // .populate("leaderBoard.userId")
            .exec(function(err, tournament) {
                if (err) {
                  console.log('Could not retrieve tournament ' + req.params.tId);
                  console.log(err);
                  res.writeHead(204, {'Content-Type':'application/json'} );
                  return res.end(JSON.stringify( { error:null, tournament: null } ));
                }

                return res.json( { error:null, tournament: tournament } );
            });

    });
router.route('/createTournament')
    .post(function(req , res){

        console.log(req.body.levels);
        //var tournament = new Tournament();

    });
/*
router.route('/leaderBoard/:tId')
    .get(function(req, res) {

        Tournament.findById(req.params.tId)
            .populate("leaderBoard.userId")
            .exec(function(err, tournaments) {
                if (err) {
                    return res.send(err);
                }

                var usr = req.session.user.local.username;

                cntr = 0;
                tempLeaderBoard = [];
                var tempFlag = false;
                tournaments.leaderBoard.forEach(function(tempUser, index) {

                    Profile.findOne({
                        userId: tempUser.userId.local.username
                    })
                        .exec(function(err, profile) {
                            if (err) {
                                return res.send(err);
                            }
                            cntr++;

                            if (cntr <= 10 && cntr <= tournaments.leaderBoard.length) {
                                tempLeaderBoard.push({
                                    name: profile.name,
                                    score: tempUser.totalScore,
                                    rank: index + 1
                                });
                            }
                            if (usr == profile.userId) {
                                tempFlag = true;
                                currUserStat = {
                                    name: profile.name,
                                    rank: index + 1,
                                    score: tempUser.totalScore,
                                    imgLink: profile.imageLink
                                };
                            }

                            if ((tempLeaderBoard.length == tournaments.leaderBoard.length || tempLeaderBoard.length == 10) && tempFlag) {
                                return res.json({
                                    leaderBoard: tempLeaderBoard,
                                    myStat: currUserStat
                                });
                            }
                        });
                });


            });

    });
*/
router.route('/leaderBoard/:tId')
    .get(function(req, res) {
      console.log('Request received for leaderboard');
        //get current loggedIn username
        var usr = req.session.user.local.username,
            leaderBoard = [],
            myStats = {},
            myStatsFound = false;

        Tournament.findById(req.params.tId)
            .populate("leaderBoard.userId")
            .exec(function(err, tournaments) {
                if (err) {
                    return res.send(err);
                }

                if(tournaments.leaderBoard.length == 0){
                  return res.json({
                          leaderBoard: [],
                          myStat: []
                      });
                }

                var cnt = (tournaments.leaderBoard.length > 10) ? 10 : tournaments.leaderBoard.length;
                console.log(tournaments.leaderBoard);
                tournaments.leaderBoard.forEach(function(leader, index) {
                    if (cnt >0) {
                        leaderBoard.push({
                            name: leader.name,
                            score: leader.totalScore,
                            rank: index + 1,
                            imgLink: leader.imageLink
                        });
                    }
                    if (usr == leader.userId) {
                        myStatsFound = true;
                        currUserStat = {
                            name: leader.name,
                            rank: index + 1,
                            score: leader.totalScore,
                            imgLink: leader.imageLink
                        };
                    }

                    cnt--;

                    if ((cnt ==0) && myStatsFound) {
                        return res.json({
                            leaderBoard: leaderBoard,
                            myStat: currUserStat
                        });
                    }
                });
            });

    });


module.exports = router;
