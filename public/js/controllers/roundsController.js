angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentID=$routeParams.tournamentID;
      $rootScope.stylesheetName="topic";
      var path = '/tournamentHandler/tournament/'+$scope.tournamentID;

 $http.get(path)
         .success(function(data, status, headers, config) {

              $scope.tournament = data;
              $rootScope.playersPerMatch=data.playersPerMatch;
        }).error(function(data, status, headers, config) {
             console.log(error);
           });

      $scope.play=function(levelId,topicId, title)
      {

        $rootScope.levelId =levelId;
        $rootScope.tId=topicId;
        $rootScope.title=title;

         var newpath="/quizPlayer";
        $location.path(newpath);
      };
   });
