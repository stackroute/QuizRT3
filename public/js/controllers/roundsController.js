angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentID=$routeParams.tournamentID;
      $rootScope.stylesheetName="rounds";
      $scope.levelCleared = 0;
      $scope.playedTournament = [];
      var path = '/tournamentHandler/tournament/'+$scope.tournamentID;

      $scope.refreshLeaderBoard = function( tournamentId ) {
        $http.get( '/tournamentHandler/tournament/' + tournamentId )
           .success(function(data, status, headers, config) {
                data.leaderBoard.sort( function(a,b) {
                  return -(a-b);
                });
                $scope.tournament = data;
                $rootScope.playersPerMatch=data.playersPerMatch;
                console.log(data);
                $rootScope.loggedInUser.tournaments.forEach(function(tournament){
                  if(tournament.tournamentId == data._id){
                    $scope.playedTournament = tournament;
                    $scope.levelCleared = tournament.levelCleared;
                  }
                });
          })
          .error(function(data, status, headers, config) {
               console.log(error);
          });
      }

      $http.get(path)
         .success(function(data, status, headers, config) {
              $scope.tournament = data;
              $rootScope.playersPerMatch=data.playersPerMatch;
              var tournamentId = data._id;
              $rootScope.loggedInUser.tournaments.forEach(function(tournament){
                //console.log(tournament);
                if(tournament.tournamentId == tournamentId){
                  $scope.playedTournament = tournament;
                  $scope.levelCleared = tournament.levelCleared;
                }

              });

        }).error(function(data, status, headers, config) {
             console.log(error);
           });
    //  $http.get().success(function(data, status, headers, config){
    //         $scope.userDesc=data;
    //  }).error(function(data, status, header, config){
    //      console.log(error);
    //  });

      $scope.play=function(levelId, topicId, title, topic_name)
      {
        $rootScope.levelId=levelId;
        $rootScope.title=title;
        $rootScope.tId=topicId;
        $rootScope.topicName=topic_name;
        $rootScope.roundCount = levelId.substring(levelId.lastIndexOf("_") + 1);
        $location.path('/quizPlayer');
      };

    $scope.leaders=function(tournamentID){
      var path1 = 'tournamentHandler/leaderBoard/' + tournamentID;
      console.log(path1);
      $http.get(path1)
              .success(function(data, status, headers, config) {
          $scope.leaders = data;
          console.log($scope.viewLeader);
      });
   };
 });
