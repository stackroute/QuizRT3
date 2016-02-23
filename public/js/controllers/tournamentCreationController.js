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

angular.module('quizRT')
  .directive('fileUpload', ['$parse' , function($parse){
    return {
      restrict : 'A',
      link  : function(scope , element , attrs ){
        element.bind('change', function(){
            scope.$apply(function(){
              scope.imageFile = element[0].files[0];
            });
        });
      }
    }
  }]);


angular.module('quizRT')
    .controller('tournamentCreationController',[ '$scope' , '$http' , '$rootScope' , '$location',
      function($scope,$http,$rootScope,$location){

       $rootScope.stylesheetName = "tournamentCreation";
       $scope.levelsArray = ["Level 1"];
       $scope.levelTopicArray = [];

       $http.get('/topicsHandler/topics')
        .then(
            function(successResponse){

              $scope.topics = successResponse.data;
              $scope.initialTopic = $scope.topics[0].topicName;

            },
            function(errorResponse){
              console.log('Error in fetching topics.');
              console.log(errorResponse.status);
               console.log(errorResponse.statusText);

            }
          );

     $scope.addLevels = function(levelIndex){
      $scope.levelsArray.push("Level " + ($scope.levelsArray.length + 1));
     };

     $scope.deleteLevels = function(levelIndex){
      
     }

     $scope.selectionChange = function(value , index){
       $scope.levelTopicArray[index] = value;
       //console.log($scope.levelTopicArray);
        
     };

     $scope.createTournament = function(tournament){

      var isValidTournament = validateTournament(tournament);

      if(isValidTournament){
        tournament.levelTopicArray = $scope.levelTopicArray;
        console.log($scope.tournament);
        var formData = new FormData();
        
        formData.append('data',JSON.stringify(tournament));
        formData.append('file',$scope.imageFile);

        $http.post('tournamentHandler/createTournament', formData , {headers: { 'Content-Type': undefined }})
        .then(
            function(successResponse){
              var tournamentId = successResponse.data.tournamentId;
              $location.path( "/tournament/" + tournamentId);
              
            },// end successCallback
            function(errorResponse){
              console.log('Error occurred while creating Tournament');
              console.log(errorResponse.error);
              alert(errorResponse.error);
            } //end errorCallback
          );

      }
      
      

     }

      $scope.reset = function(form) {
        if (form) {
          form.$setPristine();
          form.$setUntouched();
        }
        $scope.user = {};
      };

      validateTournament = function(tournament){

        var isValidTournament = false;
        

        if(!tournament || !tournament.title ){
          alert("Please provide title for the tournament.");
          
        }else if(!$scope.imageFile){
           alert("Please choose image file for the tournament.");

        }else if($scope.levelTopicArray.length == 0){
           alert("Please select topic for each level");

        }else if(!tournament.playersPerMatch || (tournament.playersPerMatch <2)) {
           alert("Please provide players required for each match. Minimum of 2 players are required.");

        }else{
          isValidTournament =  true;
        }

        return isValidTournament;



      }


    }]);



