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
	      .populate("leg.topics")
	          .exec(function(err,tournaments){
	            if(err){
	                return res.send(err);
	              }
	            return res.json(tournaments);
	          });
	 	});

router.route('/tournaments/:tournamentID')
	  .get(function(req , res){


	  });


module.exports= router;
