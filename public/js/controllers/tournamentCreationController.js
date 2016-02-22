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
              console.log($scope.topics);
              console.log('$$$$$$$$$$$$');

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

     $scope.selectionChange = function(value , index){
       $scope.levelTopicArray[index] = value;
       console.log($scope.levelTopicArray);
        
     };

     $scope.createTournament = function(tournament){
      
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

      $scope.reset = function(form) {
        if (form) {
          form.$setPristine();
          form.$setUntouched();
        }
        $scope.user = {};
      };


    }]);

