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
//                      + Anil Sawant

var topScore = 0;
var questionCounter = 0;
var temp;
angular.module('quizRT')
    .controller('quizPlayerController', function(socket, $route, $scope, $location, $interval, $http, $rootScope, $window) {
        $rootScope.stylesheetName = "quizPlayer";
        $scope.myscore = 0;
        $scope.correctAnswerers = 0;
        $scope.wrongAnswerers = 0;
        $scope.quizTitle = $rootScope.title;
        var playersPerMatch = $rootScope.playersPerMatch;
        $scope.pendingUsersCount = playersPerMatch;
        //$scope.question = "WAITING FOR " + playersPerMatch +" OTHER PLAYERS";
        console.log("WAITING FOR " + playersPerMatch +" OTHER PLAYERS");

        // levelId is defined for Tournaments only
        if($rootScope.levelId){
             $scope.levelDetails = "Round "+ $rootScope.roundCount + " : " + $rootScope.topicName;
        }else{
            $scope.levelDetails = "";
        }
        // watch when the user leaves the quiz-play page to show/hide footer nav
        $scope.$on( '$routeChangeStart', function(args) {
          $rootScope.isPlayingAGame = false;
        });

        // create the playerData obj for the quiz gameManager to identify the player and his client
        var playerData = {
            topicId: $rootScope.levelId || $rootScope.tId,
            userId: $rootScope.loggedInUser.userId,
            playerName: $rootScope.loggedInUser.name,
            playerPic: $rootScope.loggedInUser.imageLink,
            playersPerMatch: playersPerMatch
        };
        socket.emit('join', playerData); // enter the game and wait for other players to join
        
        socket.on('startGame', function( startGameData ) {
            $rootScope.freakgid = startGameData.gameId;
            $scope.question = "Starting Game ...";
            var tId = $rootScope.tId;
            var gId2 = startGameData.gameId;
            var path = '/quizPlayer/quizData/' + tId + ',' + gId2;

            $http.get(path)
                .success(function(data, status, headers, config) { // this call retrieves the questions. Call is redundant
                    //counter to start the Quiz
                    $scope.time = 3;

                    var timeInterval = $interval(function() {
                        $scope.time--;

                        //waiting for counter to end to start the Quiz
                        if ($scope.time == 0) {
                            $scope.isDisabled = false;
                            $scope.wrongAnswerers = 0;
                            $scope.correctAnswerers = 0;
                            $scope.unattempted = startGameData.maxPlayers;
                            if ( questionCounter == data.questions.length ) {
                                $interval.cancel(timeInterval);
                                $rootScope.finalScore = $scope.myscore;
                                $rootScope.finalRank = $scope.myrank;
                                socket.emit( 'gameFinished', startGameData.gameId);
                                // $location.path('/quizResult/' + startGameData.gameId );
                            } else {
                                temp = loadNextQuestion(data, questionCounter);

                                $scope.changeColor = function(id, element) {
                                    if (id == "option" + (temp.correctIndex)) {
                                        $(element.target).addClass('btn-success');
                                        $scope.myscore = $scope.myscore + $scope.time + 10;
                                        socket.emit('confirmAnswer', {
                                            ans: "correct",
                                            gameID: startGameData.gameId
                                        });
                                    } else {
                                        $(element.target).addClass('btn-danger');
                                        angular.element('#option' + temp.correctIndex).addClass('btn-success');
                                        $scope.myscore = $scope.myscore - 5;
                                        socket.emit('confirmAnswer', {
                                            ans: "wrong",
                                            gameID: startGameData.gameId
                                        });
                                    }
                                    $scope.isDisabled = true;
                                    socket.emit('updateStatus', {
                                        gameId: startGameData.gameId,
                                        userId: $rootScope.loggedInUser.userId,
                                        playerScore: $scope.myscore,
                                        playerName: $rootScope.loggedInUser.name,
                                        playerPic: $rootScope.loggedInUser.imageLink
                                    });
                                };

                                $scope.question = questionCounter + ". " +temp.question;
                                $scope.options = temp.options;

                                if (temp.image != "null")
                                    $scope.questionImage = temp.image;

                                else {
                                    $scope.questionImage = null;
                                }
                                $scope.time = 2;
                            }
                        }

                    }, 1000);// to create 1s timer

                })
                .error(function(data, status, headers, config) {
                    console.log(data);
                });
        });
        socket.on('takeScore', function(data) {
            //console.log("takeScore log emitted");
            //console.log("rank= " + data.myRank);
            $scope.myrank = data.myRank;
            $scope.topperScore = data.topperScore;
            $scope.topperImage = data.topperImage;
            console.log(data.topperImage);
        });
        socket.on('isCorrect', function(data) {
            $scope.correctAnswerers++;
            $scope.unattempted--;
        });
        socket.on('isWrong', function(data) {
            $scope.wrongAnswerers++;
            $scope.unattempted--;
        });
        socket.on('pendingUsers', function(data) {
            $scope.question = "WAITING FOR " + data.pendingUsersCount +" OTHER PLAYER(S)";
        });
        socket.on( 'takeResult', function( resultData ) {
            $rootScope.recentGames[$rootScope.freakgid] = resultData;
            $rootScope.recentGamesTopicNames[$rootScope.freakgid] = $rootScope.tId;
            $location.path( '/quizResult/' + $rootScope.freakgid );
        });
    });

function loadNextQuestion(data, questionNumber) {
    var optionCounter = 0;
    var obj;
    var options = [];
    while (data.questions[questionNumber].options[optionCounter]) {
        opt = {
            name: data.questions[questionNumber].options[optionCounter],
            id: "option" + (optionCounter + 1)
        };
        options.push(opt);
        optionCounter++;
    }
    obj = {
        "options": options,
        "question": data.questions[questionNumber].question,
        "image": data.questions[questionNumber].image,
        "correctIndex": data.questions[questionNumber].correctIndex
    };
    questionCounter++;
    return obj;
}
