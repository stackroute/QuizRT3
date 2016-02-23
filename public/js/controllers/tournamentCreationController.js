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
       console.log($scope.levelTopicArray);
        
     };

     $scope.createTournament = function(tournament){

      var isValidTournament = validateTournament(tournament);

      if(isValidTournament){
        tournament.levelTopicArray = $scope.levelTopicArray;
        console.log($scope.tournament);
        var fileData = new FormData();
        
        fileData.append('data',JSON.stringify(tournament));
        fileData.append('file',$scope.imageFile);

        $http.post('tournamentHandler/createTournament', fileData , {headers: { 'Content-Type': undefined }})
        .then(
            function(successResponse){
              var tournamentId = successResponse.data.tournamentId;
              $location.path( "/tournament/" + tournamentId);
              
            },// end successCallback
            function(errorResponse){

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

        }else if(!tournament.playersPerMatch || (tournament.playersPerMatch >1)) {
           alert("Please provide players required for each match");

        }else{
          isValidTournament =  true;
        }

        return isValidTournament;



      }


    }]);



