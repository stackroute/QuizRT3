angular.module('quizRT')
  .directive('fileUpload', ['$parse' , function($parse){

    return {
      restrict : 'A',
      link  : function(scope , element , attrs ){
        
        var model = $parse(attrs.fileUpload);
        var modelSetter = model.assign;
        
        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope.tournament.imageFile, element[0].files[0]);
            });
        });
      }
    }

  }]);


angular.module('quizRT')
    .controller('tournamentCreationController',[ '$scope' , '$http' , '$rootScope' , '$location',
      function($scope,$http,$rootScope,$location){

       $rootScope.stylesheetName = "tournamentCreation";

      $scope.data = 'none';
      $scope.add = function()
      {
       var f = document.getElementById('file').files[0],
           r = new FileReader();
       r.onloadend = function(e)
       {
         $scope.data = e.target.result;
       }
       r.readAsBinaryString(f);
     }

     $scope.createTournament = function(tournament){
      console.log(tournament);
      console.log($scope.imageFile);
      $http.post('/tournamentHandler/createTournament' , tournament)
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

