  angular.module("quizRT")
      .controller('tournamentController', function($scope, $http, $routeParams, $rootScope, $location){
        $scope.tournamentId=$routeParams.tournamentId;
        $rootScope.stylesheetName="tournament";
        $scope.levelCleared = 0;
        $scope.playedTournament = {};
        var path = '/tournamentHandler/tournament/'+$scope.tournamentId;

        /*
        $scope.$on( '$routeChangeSuccess', function(args) {
          // there's one watcher in quizPlayerController to show-hide the footer-nav when user is playing a quiz
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
              console.log('Leaderboard:');
              console.log(successResponse.data.leaderBoard);
              successResponse.data.leaderBoard.some( function(player,index) {
                if ( player.userId && player.userId == $rootScope.loggedInUser.userId ) {
                  $scope.userTournamentStats = player;
                  $scope.userTournamentStats.rank = index+1;
                  return true
                }
              });

              $scope.tournament = successResponse.data;
              $rootScope.playersPerMatch = successResponse.data.playersPerMatch;
              console.log('successResponse.data');
              console.log(successResponse.data);
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
          $rootScope.playGame = {};
          $rootScope.playGame.levelId = levelId;
          $rootScope.playGame.topicId = topicId;
          $rootScope.playGame.topicName = topic_name;
          $rootScope.playGame.tournamentTitle = title;
          $location.path( '/quizPlayer' );
          $rootScope.isPlayingAGame = true;
        };
   });
