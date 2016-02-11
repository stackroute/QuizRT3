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
//   Name of Developers  Abhinav Kareer,Sunil Mekala, Pratik Sinha, Anil Sawant, Chandu
//
var express = require('express'),
		Reservoir = require('reservoir'),
		router = express.Router(),
		Profile =require("../models/profile"),
		Tournament =require("../models/tournament");



router.route('/tournaments')
	  .get(function(req, res){
	    Tournament.find()
	      .populate("topics.name")
	          .exec(function(err,tournaments){
	            if(err){
	                return res.send(err);
	              }
	            return res.json(tournaments);
	          });
	 	})
		.post( function(req,res) {
			var tournamentIds = req.body.tournamentIds,
					matchObj = [];
			if ( tournamentIds && tournamentIds.length ) {
				tournamentIds.forEach( function(id){
						matchObj.push({'_id':id});
				});
				console.log('\n\nMatchobj');
				console.log(matchObj);
				Tournament.find( {$or: matchObj} ).exec( function(err, userTournaments ) {
					if ( err ) {
						console.log(err);
						res.end(JSON.stringify( {error: 'Failed to retrieve tournaments from MongoDB'} ));
					}else {
						res.end(JSON.stringify( {error: null, userTournaments : userTournaments} ));
					}
				});
			}else {
				res.end(JSON.stringify( {error:'Tournament Ids not found in request body'} ));
			}
		});

router.route('/tournament/:tId')
	  .get(function(req , res){
			Tournament.findById(req.params.tId)
	      .populate("topics.name")
				.populate("leaderBoard.userId")
	          .exec(function(err,tournaments){
	            if(err){
	                return res.send(err);
	              }
	            return res.json(tournaments);
	          });
	  });
router.route('/leaderBoard/:tId')
.get(function(req , res){

	Tournament.findById(req.params.tId)
		.populate("leaderBoard.userId")
        .exec(function(err,tournaments){
          if(err){
              return res.send(err);
            }else {



								var usr=req.session.user.local.username;

							cntr=0;
							tempLeaderBoard=[];
							var tempFlag=false;
								tournaments.leaderBoard.forEach(function(tempUser,index)
								{

							 Profile.findOne({userId: tempUser.userId.local.username})
			         .exec(function(err,data){
								 cntr++;

								 if(cntr<=10 && cntr<=tournaments.leaderBoard.length)
								 {
								 	tempLeaderBoard.push({name:data.name,score:tempUser.totalScore,rank:index+1});
									}
										if(usr==data.userId)
										{
											tempFlag=true;
											currUserStat={
												name:data.name,
												rank:index+1,
											score:tempUser.totalScore,
											imgLink:data.imageLink
																		};
										}

									if((tempLeaderBoard.length==tournaments.leaderBoard.length || tempLeaderBoard.length==10) && tempFlag)
								 {
										return res.json({leaderBoard:tempLeaderBoard,myStat:currUserStat});
								 }
							 });



						 	});





            }

        });

});


module.exports= router;
