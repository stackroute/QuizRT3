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

// angular.module('quizRT')
//   .factory('fileUploadService', ['$http', function($http){
//     return $http.post()
//   }]);


angular.module('quizRT')
    .controller('tournamentCreationController',[ '$scope' , '$http' , '$rootScope' , '$location',
      function($scope,$http,$rootScope,$location){

       $rootScope.stylesheetName = "tournamentCreation";

     //  $scope.data = 'none';
     //  $scope.add = function()
     //  {
     //   var f = document.getElementById('file').files[0],
     //       r = new FileReader();
     //   r.onloadend = function(e)
     //   {
     //     $scope.data = e.target.result;
     //   }
     //   r.readAsBinaryString(f);
     // }

     $scope.createTournament = function(tournament){
      
      var fileData = new FormData();
      //$scope.imageFile is set using fileUpload directive
      
      fileData.append('data',JSON.stringify(tournament));
      fileData.append('file',$scope.imageFile);

      $http.post('tournamentHandler/createTournament', fileData , {headers: { 'Content-Type': undefined }})
      .then(
          function(successResponse){

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

