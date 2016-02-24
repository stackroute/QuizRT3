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
	.controller('resultController', function( $scope, $rootScope, $route, $location, $timeout) {
		$scope.gameId = $route.current.params.gameId;
		if ( !$rootScope.recentGames || !$rootScope.recentGames[$scope.gameId] ) {
			$location.path( '/404');
		} else {
			if ( $rootScope.showRecentResult ) { // to show the result direclty when user clicks on recent result button
				$scope.timeBeforeResult = 0;
				$rootScope.showRecentResult = false;
			} else {
				$scope.timeBeforeResult = 3000;
				$scope.msg = "Compiling the game result. Please wait...";
			}
			$scope.topicId = $rootScope.recentGames[$scope.gameId].topicId;

			if ( $rootScope.playGame.levelId ) {
				$scope.isComingFromTournament = true;
			}

			$timeout( function() {
				if ( $rootScope.recentGames[$scope.gameId].error ) {
					$scope.msg = $rootScope.recentGames[$scope.gameId].error;
				} else {
					if ( $rootScope.recentGames[$scope.gameId].gameBoard ) {
						$scope.gameTopper = $rootScope.recentGames[$scope.gameId].gameBoard[0];
					}
					$scope.gameBoard = $rootScope.recentGames[$scope.gameId].gameBoard; // show the results
					$scope.msg = 'Result of your last ' + $scope.topicId + ' quiz.'; // display the name of the topic played

					var levelId = $rootScope.playGame.levelId || false;

					var updateProfileObj = {
						score: $rootScope.finalScore,
						rank: $rootScope.finalRank,
						topicid: $scope.topicId, // change this with $scope.topicId
						userId: $rootScope.loggedInUser.userId,
						levelId: levelId
					};
					$rootScope.socket.emit('updateProfile', updateProfileObj );//score and rank
				}
			}, $scope.timeBeforeResult); // show the results after a delay. LOL!!!! ROFL!!!! LOL!!!!!

			$scope.nextLevel = function() {
				if ( $rootScope.playGame.levelId ) {
					var tournamentId = $rootScope.playGame.levelId.substring(0, $rootScope.playGame.levelId.indexOf('_') );
					$location.path( '/tournament/' + tournamentId );
				}
			};
		}

		$scope.$on( '$routeChangeStart', function(args) {
			$rootScope.playGame = {}; // reset the playGame object so that new game can be mapped to it
		});

		$scope.goHome = function() {
			$location.path( '/userProfile' );
		};
  });
