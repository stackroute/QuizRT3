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

var topScore = 0;
var questionCounter = 0;
var temp;
angular.module('quizRT')
	.controller('quizPlayerController', function(socket,$route,$scope,$location, $interval,$http,$rootScope,$window){
		$rootScope.stylesheetName="quizPlayer";
		console.log($rootScope.tId);
		$scope.question = "WAITING FOR OTHER PLAYERS";
		$scope.myscore = 0;
		$scope.correctAnswerers = 0;
		$scope.wrongAnswerers = 0;
		socket.emit('join',{tid:$rootScope.tId,name:$rootScope.fakeMyName,image:$rootScope.myImage});

		socket.on('startGame',function(startGameData){
			$rootScope.freakgid = startGameData.gameId;
			var tId=$rootScope.tId;
			var gId2=startGameData.gameId;
		  var path ='/quizPlayer/quizData/'+ tId + ',' + gId2;
			$http.post(path)
					.success(function(data, status, headers, config) {
									$scope.time=5;
									console.log(data);
						  		var timeInterval= $interval(function(){
						  			$scope.time--;
										if($scope.time == 0){
											// $scope.topperScore = topScore;
											$scope.isDisabled = false;
											$scope.wrongAnswerers=0;
											$scope.correctAnswerers=0;
											$scope.unattempted = startGameData.maxPlayers; //this is hardcoded..get this data from the first socket
											if(questionCounter == data.questions.length){
												$interval.cancel(timeInterval);
												//socket.emit('leaveGame',"leaving the game");
												//$location.path('/login');
												// $location.path('/login');
												// $window.location.href='/#login';
												$rootScope.finalScore = $scope.myscore;
												$rootScope.finalRank = $scope.myrank;
												location.replace('/#quizResult');
											}
											else{
												temp = loadNextQuestion(data,questionCounter);
												$scope.changeColor = function(id,element){
														if(id == "option"+(temp.correctIndex)){
							                $(element.target).addClass('btn-success');
															$scope.myscore = $scope.myscore + $scope.time + 10;
															socket.emit('confirmAnswer',{ans:"correct",gameID:startGameData.gameId});
							              }
							              else{
							                $(element.target).addClass('btn-danger');
							                angular.element('#option'+temp.correctIndex).addClass('btn-success');
															$scope.myscore = $scope.myscore - 5;
															socket.emit('confirmAnswer',{ans:"wrong",gameID:startGameData.gameId});
							              }
							              $scope.isDisabled = true;
														socket.emit('updateStatus',{score:$scope.myscore,gameID:startGameData.gameId,name:$rootScope.fakeMyName,image:$rootScope.myImage});
							            };

												$scope.question = temp.question;
												$scope.options = temp.options;

												if(temp.image != "null")
												$scope.questionImage = temp.image;

												else{
													$scope.questionImage = null;
												}
												$scope.time = 15;
											}
										}

						  		},1000);

					})
					.error(function(data, status, headers, config) {
						console.log(error);
					});
		});
		socket.on('takeScore', function(data){
			console.log("takeScore log emitted");
			console.log("rank= "+data.myRank);
			$scope.myrank= data.myRank;
			$scope.topperScore = data.topperScore;
			$scope.topperImage=data.topperImage;
			console.log(data.topperImage);
		});
		socket.on('isCorrect',function(data){
			$scope.correctAnswerers++;
			$scope.unattempted--;
		});
		socket.on('isWrong',function(data){
			$scope.wrongAnswerers++;
			$scope.unattempted--;
		})
 });

function loadNextQuestion(data,questionNumber){
	var optionCoutner = 0;
	var obj;
	var options=[];
	while(data.questions[questionNumber].options[optionCoutner]){
		opt = {
				name:data.questions[questionNumber].options[optionCoutner],
				id:"option"+(optionCoutner+1)
		};
		options.push(opt);
		optionCoutner++;
	}
	obj = {
		"options":options,
		"question":data.questions[questionNumber].question,
		"image":data.questions[questionNumber].image,
		"correctIndex":data.questions[questionNumber].correctIndex
	};
	questionCounter++;
	return obj;
}
