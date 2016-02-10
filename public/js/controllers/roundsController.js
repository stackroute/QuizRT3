angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentID=$routeParams.tournamentID;
      $rootScope.stylesheetName="rounds";
      $rootScope.roundScore="NO";
      var path = '/tournamentHandler/tournament/'+$scope.tournamentID;

 $http.get(path)
         .success(function(data, status, headers, config) {

              $scope.tournament = data;
              $rootScope.playersPerMatch=data.playersPerMatch;
        }).error(function(data, status, headers, config) {
             console.log(error);
           });
  $http.get("/userProfile/profileData")
                    .success(function(data, status, headers, config){
                     $rootScope.roundScore=
                    })

      $scope.play=function(levelId, topicId, title, topic_name)
      {
        $rootScope.levelId=levelId;
        $rootScope.title=title;
        $rootScope.tId=topicId;
        $rootScope.topicName=topic_name;
        $rootScope.roundCount = levelId.substring(levelId.lastIndexOf("_") + 1);
        $location.path('/quizPlayer');
      };
       // $scope.leaders(id)=function(){
      //   location.path('/leaderboard/id');
      // }
   });
