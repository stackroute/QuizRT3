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
	.controller('resultController', function(socket,$route,$scope,$location, $interval,$http,$rootScope,$window){
		console.log("calledResult");
    $scope.topicName = "compiling results..please wait";
		setTimeout(function(){
      socket.emit('getResult',$rootScope.freakgid);
      socket.on('takeResult',function(data) {
  			data.sort(function(a,b) {
  				return b.score - a.score;
  			});
        $scope.topicName = $rootScope.tId;
  			$scope.players = data;
  			socket.emit('storeResult',$rootScope.freakgid);
  			console.log($rootScope.userIdnew);
  			socket.emit('updateProfile',{score:$rootScope.finalScore,rank:$rootScope.finalRank,topicid:$rootScope.tId,userID:$rootScope.userIdnew});//score and rank
      });
      $scope.home=function()
      {
        location.replace("/");
      }
		},3000);
  });
