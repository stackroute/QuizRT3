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

angular.module('quizRT')
	.controller('resultController', function( $scope, $rootScope, socket, $routeParams, $location){
    $scope.msg = "Compiling the game result. Please wait...";
		
		setTimeout( function(){ // wait for 3s to get the results from server
			console.log('Emitting getResult for ' + $routeParams.gameId);
      socket.emit('getResult', $routeParams.gameId );
      socket.on('takeResult',function( leaderBoard ) {
  			leaderBoard.sort(function(a,b) {
  				return b.score - a.score;
  			});
				console.log('leaderBoard');
				console.log(leaderBoard);
        $scope.msg = $rootScope.tId;
  			$scope.players = leaderBoard;
				var levelId=$rootScope.levelId||false;
  			socket.emit('storeResult',{gameId:$rootScope.freakgid,topicId:$rootScope.tId,levelId:levelId});
				var updateProfileObj = {
					score: $rootScope.finalScore,
					rank: $rootScope.finalRank,
					topicid: $rootScope.tId,
					userId: $rootScope.userIdnew,
					levelId: levelId
				};
  			socket.emit('updateProfile', updateProfileObj );//score and rank
      });
		},5000); // waits for 5s before asking for result. that doesn't make sense!!

		$scope.nextLevel = function() {
			// use this to redirect the player back to the tournament he is playing
			// use levelId for the same
			console.log('redirect to tournament page');
		};
  });
