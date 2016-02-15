angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentId=$routeParams.tournamentId;
      $rootScope.stylesheetName="rounds";
      $scope.levelCleared = 0;
      $scope.playedTournament = {};
      var path = '/tournamentHandler/tournament/'+$scope.tournamentId;

      /*
      $scope.$on( '$routeChangeSuccess', function(args) {
        // there's one watcher in quizPlayerController to show-hide the footer-nav
        // if footer-nav doesn't show/hide properly
        // use this watcher in every page where footer-nav should be visible
        // $rootScope.isPlayingAGame = false;
      });
      */

      // function to toggle the player details
      $scope.toggleLeaderBoardPlayerdetails = function( playerId ) {
        $('#' + playerId).slideToggle();
      };
      // function to calculate the rank of a player, also giving same rank to players with same score
      $scope.prevRank = 1;
      $scope.prevScore = 0;
      $scope.calculateRank = function( nextScore, runningIndex ) {
        if ( $scope.prevScore != nextScore ) {
          $scope.prevScore = nextScore;
          $scope.prevRank = runningIndex+1;
        }
        return $scope.prevRank;
      };
      $scope.refreshTournament = function( tournamentId ) {
        $http.get( '/tournamentHandler/tournament/' + tournamentId )
           .then(function( successResponse ) {
            successResponse.data.leaderBoard.sort( function(a,b) {
              return b.totalScore - a.totalScore;
            });
            console.log(successResponse.data.leaderBoard);
            successResponse.data.leaderBoard.forEach( function(player,index) {
              if ( player.userId && player.userId.local.username == $rootScope.loggedInUser.userId ) {
                $scope.userTournamentStats = player;
                $scope.userTournamentStats.rank = index+1;
              }
            });

            $scope.tournament = successResponse.data;
            $rootScope.playersPerMatch = successResponse.data.playersPerMatch;
            $rootScope.loggedInUser.tournaments.forEach(function(tournament){
              if(tournament.tournamentId == successResponse.data._id){
                $scope.playedTournament = tournament;
                $scope.levelCleared = tournament.levelCleared;
              }
            });
          }, function( errorResponse ) {
               console.log('Failed to refresh the leader board. Showing old data.');
          });
      }
      $scope.refreshTournament( $scope.tournamentId );// call for the first time

      $scope.play = function(levelId, topicId, title, topic_name) {
        $rootScope.levelId=levelId;
        $rootScope.title=title;
        $rootScope.tId=topicId;
        $rootScope.topicName=topic_name;
        $rootScope.roundCount = levelId.substring(levelId.lastIndexOf("_") + 1);
        $location.path('/quizPlayer');
        $rootScope.isPlayingAGame = true;
      };
 });
