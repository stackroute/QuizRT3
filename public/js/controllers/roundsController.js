angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentID=$routeParams.tournamentID;
      // console.log("Hi, How are you?");
      $rootScope.stylesheetName="topic";
      var path = '/tournamentHandler/tournament/'+$scope.tournamentID;

 $http.get(path)
         .success(function(data, status, headers, config) {
              console.log(data);
              $scope.tournament = data;
              $rootScope.maxPlayer=data.playersPerMatch;
              $rootScope.totalMatches=data.matches;
          }).error(function(data, status, headers, config) {
             console.log(error);
           });

      $scope.play=function(id)
      {
        $rootScope.tournamentID =id;

       var newpath="/quizPlayer";
        $location.path(newpath);
      };
   });
