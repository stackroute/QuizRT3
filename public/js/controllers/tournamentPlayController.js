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
//   Name of Developers  Anil Sawant

angular.module('quizRT')
    .controller('tournamentPlayController', function($route, $scope, $location, $interval, $http, $rootScope, $window, $cookies, $timeout) {
      if ( !$rootScope.loggedInUser ) {
        $rootScope.isAuthenticatedCookie = false;
        $rootScope.serverErrorMsg = 'User not authenticated.';
        $rootScope.serverErrorStatus = 401;
        $rootScope.serverErrorStatusText = 'You are not logged in. Kindly do a fresh login.';
        $location.path('/error');
      } else {
        $rootScope.hideFooterNav = true;
        $scope.levelId = $rootScope.playGame.levelId;
        $scope.tournamentId = $rootScope.playGame.tournamentId;
        $scope.topicId = $rootScope.playGame.topicId;
        $scope.topicName = $rootScope.playGame.topicName;
        $scope.tournamentTitle = $rootScope.playGame.tournamentTitle;
        if ( $scope.levelId && $scope.levelId.length ) {
          $scope.roundCount = $scope.levelId.substring($scope.levelId.lastIndexOf("_") + 1);
        }
        $scope.myscore = 0;
        $scope.myrank = 0;
        $scope.topperScore = 0;
        $scope.topperName = 'Topper';
        $scope.correctAnswerers = 0;
        $scope.wrongAnswerers = 0;
        $scope.unattempted = 0;
        $scope.quizTitle = $scope.tournamentTitle;
        var playersPerMatch = $rootScope.playersPerMatch;
        $scope.pendingUsersCount = playersPerMatch;
        $scope.question = "Setting up your game...";
        console.log("WAITING FOR " + playersPerMatch +" OTHER PLAYERS");

        // levelId is defined for Tournaments only
        if($scope.levelId){
             $scope.levelDetails = "Round "+ $scope.roundCount + " : " + $scope.topicName;
        }else{
            $scope.levelDetails = "";
        }
        // watch when the user leaves the quiz-play page to show/hide footer nav
        $scope.$on( '$routeChangeStart', function(args) {
          $rootScope.hideFooterNav = false;
        });

        // create the playerData obj for the quiz gameManager to identify the player and his client
        var playerData = {
            levelId: $scope.levelId, // defined only for Tournaments
            tournamentId: $scope.tournamentId,
            topicId: $scope.topicId,
            userId: $rootScope.loggedInUser.userId,
            playerName: $rootScope.loggedInUser.name,
            playerPic: $rootScope.loggedInUser.imageLink,
            playersNeeded: playersPerMatch
        };
        $rootScope.tournamentSocket.emit('joinTournament', playerData); // enter the tournament and wait for other players to join

        $rootScope.tournamentSocket.on( 'userNotAuthenticated', function() {
            $rootScope.isAuthenticatedCookie = false;
            $rootScope.serverErrorMsg = 'User not authenticated.';
            $rootScope.serverErrorStatus = 401;
            $rootScope.serverErrorStatusText = 'User session could not be found. kindly do a fresh login.';
            $location.path('/error');
            console.log('Problem maintaining the user session!');
        });

        $rootScope.tournamentSocket.once('startGame', function( startGameData ) {
          if ( startGameData.questions && startGameData.questions.length && startGameData.questions[0]) {
            $rootScope.freakgid = startGameData.gameId;
            $scope.playersCount = startGameData.playersNeeded;
            $scope.questionCounter = 0; // reset the questionCounter for each game
            $scope.question = "Starting Game in...";
            $scope.time = 3;
            $scope.timerSpan = $('#timer');
            $scope.timeInterval = $interval( function() {
                $scope.time--;
                //waiting for counter to end to start the Quiz
                if ($scope.time === 0) {
                    $scope.isDisabled = false;
                    $scope.wrongAnswerers = 0;
                    $scope.correctAnswerers = 0;
                    $scope.unattempted = $scope.playersCount;
                    if ( $scope.questionCounter == startGameData.questions.length ) {
                        $interval.cancel($scope.timeInterval);
                        $scope.options = null;
                        $scope.question = 'Game finished. Compiling the result...';
                        $scope.questionImage = null;
                        $scope.unattempted = 0;
                        $scope.finishGameData = {
                          gameId: startGameData.gameId,
                          tournamentId: $scope.tournamentId,
                          levelId: $scope.levelId,
                          topicId: startGameData.topicId
                        };
                        $rootScope.tournamentSocket.emit( 'gameFinished', $scope.finishGameData );
                    } else {
                        $scope.currentQuestion = startGameData.questions[$scope.questionCounter];
                        $scope.options = $scope.currentQuestion.options;
                        $scope.questionCounter++;
                        $scope.question = $scope.questionCounter + ". " +$scope.currentQuestion.question;
                        if ($scope.currentQuestion.image != "null")
                            $scope.questionImage = $scope.currentQuestion.image;
                        else {
                            $scope.questionImage = null;
                        }
                        $scope.time = 15;
                        $scope.changeColor = function(id, clickEvent) {
                            $scope.isDisabled = true;
                            if (id == $scope.currentQuestion.correctIndex ) {
                                $(clickEvent.target).addClass('btn-success');
                                $scope.myscore = $scope.myscore + $scope.time + 10;
                                $rootScope.tournamentSocket.emit('confirmAnswer', {
                                    ans: "correct",
                                    gameId: startGameData.gameId,
                                    tournamentId: $scope.tournamentId,
                                    topicId: startGameData.topicId
                                });
                            } else {
                                $(clickEvent.target).addClass('btn-danger');
                                $('#' + $scope.currentQuestion.correctIndex).addClass('btn-success');
                                $scope.myscore = $scope.myscore - 5;
                                $rootScope.tournamentSocket.emit('confirmAnswer', {
                                    ans: "wrong",
                                    gameId: startGameData.gameId,
                                    tournamentId: $scope.tournamentId,
                                    topicId: startGameData.topicId
                                });
                            }
                            $rootScope.tournamentSocket.emit('updateStatus', {
                                gameId: startGameData.gameId,
                                tournamentId: $scope.tournamentId,
                                topicId: startGameData.topicId,
                                userId: $rootScope.loggedInUser.userId,
                                playerScore: $scope.myscore,
                                playerName: $rootScope.loggedInUser.name,
                                playerPic: $rootScope.loggedInUser.imageLink
                            });
                        };
                    }
                }

            }, 1000);// to create 1s timer
          } else {
            $rootScope.hideFooterNav = false;
            $scope.question = 'Selected topic does not have any questions in our QuestionBank :(';
          }
          $scope.leaveGame = function() {
            console.log('clicked');
            $rootScope.tournamentSocket.emit('leaveGame', {userId: $rootScope.loggedInUser.userId, tournamentId: $scope.tournamentId, gameId: startGameData.gameId}); // enter the tournament and wait for other players to join
          };

        });
        $rootScope.tournamentSocket.on('takeScore', function(data) {
          if ( data.userId == $rootScope.loggedInUser.userId ) {
            $scope.myrank = data.myRank;
          }
          $scope.topperScore = data.topperScore;
          $scope.topperImage = data.topperImage;
          $scope.topperName = data.topperName;
        });
        $rootScope.tournamentSocket.on('isCorrect', function(data) {
          $scope.correctAnswerers++;
          $scope.unattempted--;
        });
        $rootScope.tournamentSocket.on('isWrong', function(data) {
          $scope.wrongAnswerers++;
          $scope.unattempted--;
        });
        $rootScope.tournamentSocket.on('pendingPlayers', function(data) {
          $scope.question = "WAITING FOR " + data.pendingPlayers +" OTHER PLAYER(S)";
        });
        $rootScope.tournamentSocket.on('playerLeft', function( data ) {
          $scope.playersCount = data.remainingCount;
          $scope.playerLeft = data.playerName + " left the game.";
        });
        $scope.$watch( 'playerLeft', function(nv,ov) {
          if ( nv ) {
            $timeout( function() {
              $scope.playerLeft = '';
            },2000);
          }
        });
        $rootScope.tournamentSocket.on('playerJoined', function( data ) {
          // $scope.playersCount = data.newCount;
          $scope.playerJoined = data.playerName + " joined the game.";
        });
        $scope.$watch( 'playerJoined', function(nv,ov) {
          if ( nv ) {
            $timeout( function() {
              $scope.playerJoined = '';
            },2000);
          }
        });
        $rootScope.tournamentSocket.on( 'takeResult', function( resultData ) {
            $rootScope.recentGames[resultData.gameResult.gameId] = {
              error: resultData.error,
              gameId: resultData.gameResult.gameId,
              tournamentId: resultData.gameResult.tournamentId,
              topicId: resultData.gameResult.topicId,
              gameBoard: resultData.gameResult.gameBoard
            };
            $timeout( function() {
              $location.path( '/quizResult/' + resultData.gameResult.gameId );
            },2000);
        });
        $rootScope.tournamentSocket.on( 'alreadyPlayingTheGame', function( duplicateEntryData ) {
          $scope.question = 'WARNING!!  You are already playing ' + duplicateEntryData.topicId + '. Kindly complete the previous game or play a different one.';
          $rootScope.hideFooterNav = false;
        });
        $rootScope.tournamentSocket.on( 'serverMsg', function( msgData ) {
          if (msgData.type == 'LOGOUT') {
            $cookies.remove('isAuthenticated');
            $rootScope.loggedInUser = null;
            $rootScope.isAuthenticatedCookie = false;
            $rootScope.logInLogOutErrorMsg = 'Server knocked out your session. This may be due to running multiple sessions.';
            $rootScope.logInLogOutSuccessMsg = '';
            $location.path('/login');
          }
        });
      }
    });
