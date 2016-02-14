<!--
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
//   Name of Developers  Abhinav Kareer,Sunil Mekala, Pratik Sinha, Anil Sawant, Chandu , Mukesh Kumar Mishra
//  
-->

angular.module('quizRT')
	.controller('tournamentPlayerController', function(socket,$route,$scope,$location, $interval,$http,$rootScope,$window){

		// specifies name of css file to be loaded
		$rootScope.stylesheetName="quizPlayer";
		$scope.question = "Waiting for other players ...";
		$scope.myscore = 0;
		$scope.correctAnswerers = 0;
		$scope.wrongAnswerers = 0;
		console.log($rootScope.tournamentId);

		socket.emit('joinTournament',{
			tournamentId:$rootScope.tournamentId,
			name:$rootScope.fakeMyName,
			image:$rootScope.myImage
		});

		socket.on('startTournament',function(startGameData){
			
			var tournamentId = $rootScope.tournamentId;
			var tournamentGameID = startGameData.tournamentGameID;
			$rootScope.tournamentGameID = tournamentGameID;

			var URL = '/tournamentHandler/tournamentPlayer/quizData' + tournamentId +', ' + tournamentGameID ;

		});
		
	});