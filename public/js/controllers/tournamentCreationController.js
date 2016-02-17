angular.module('quizRT')
    .controller('createTournamentController',function($http,$scope,$rootScope,$location,socket){

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


    });
