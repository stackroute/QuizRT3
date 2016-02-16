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
//												+ Anil Sawant

angular.module('quizRT')
	.controller('resultController', function( $scope, $rootScope, socket, $route, $location, $timeout) {
    $scope.msg = "Compiling the game result. Please wait...";
		$scope.gameId = $route.current.params.gameId;
		$scope.topicId = $rootScope.recentGames[$scope.gameId].topicId;
		if ( $rootScope.levelId ) {
			$scope.isComingFromTournament = true;
		}

		$timeout( function() {
			if ( $rootScope.recentGames[$scope.gameId].error ) {
				$scope.msg = $rootScope.recentGames[$scope.gameId].error;
			} else {
				$scope.gameTopper = $rootScope.recentGames[$scope.gameId].gameBoard.splice(0);
				$scope.gameBoard = $rootScope.recentGames[$scope.gameId].gameBoard; // show the results
				$scope.msg = 'Result of your previous ' + $scope.topicId + ' quiz.'; // display the name of the topic played

				var levelId = $rootScope.levelId || false;
  			// socket.emit('storeResult',{gameId:$rootScope.freakgid,topicId:$rootScope.tId,levelId:levelId});
				var updateProfileObj = {
					score: $rootScope.finalScore,
					rank: $rootScope.finalRank,
					topicid: $rootScope.tId, // change this with $scope.topicId
					userId: $rootScope.loggedInUser.userId,
					levelId: levelId
				};
  			socket.emit('updateProfile', updateProfileObj );//score and rank
			}
		}, 3000); // show the results after 3s. LOL!!!! ROFL!!!! LOL!!!!!

		$scope.nextLevel = function() {
			if ( $rootScope.levelId ) {
				var tournamentId = $rootScope.levelId.substring(0, $rootScope.levelId.indexOf('_') );
				$location.path( '/tournament/' + tournamentId );
			}
		};

		$scope.goHome = function() {
			$location.path( '/userProfile' );
		};
  });
