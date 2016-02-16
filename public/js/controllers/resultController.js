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
	.controller('resultController', function( $scope, $rootScope, socket, $route, $location, $timeout){
    $scope.msg = "Compiling the game result. Please wait...";
		$scope.gameId = $route.current.params.gameId;

		$timeout( function() {
			if ( $rootScope.recentGames[$scope.gameId].error ) {
				$scope.msg = $rootScope.recentGames[$scope.gameId].error;
			} else {
				$scope.gameBoard = $rootScope.recentGames[$scope.gameId].finishedGameBoard; // show the results
				$scope.msg = $rootScope.recentGamesTopicNames[$scope.gameId] + ' - Hall of Fame'; // display the name of the topic played

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
			}
		}, 3000); // show the results after 3s. LOL!!!!

		$scope.nextLevel = function() {
			// use this to redirect the player back to the tournament he is playing
			// use levelId for the same
			console.log('redirect to tournament page');
		};
  });
