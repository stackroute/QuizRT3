angular.module("quizRT")
    .controller('roundsController', function($scope, $http, $routeParams, $rootScope, $location){
      $scope.tournamentId=$routeParams.tournamentId;
      $rootScope.stylesheetName="rounds";
      $scope.levelCleared = 0;
      $scope.playedTournament = {};
      var path = '/tournamentHandler/tournament/'+$scope.tournamentId;

      $rootScope.loggedInUser = {
        "_id":{"$oid":"56a613d504eb49492b745f3f"},
        "totalGames":0,
        "wins":0,
        "imageLink":"/images/userProfileImages/akshayk.jpg",
        "badge":"Beginner",
        "name":"Anil",
        "age":24,
        "country":"India",
        "userId":"anilsawant",
        "topicsPlayed":[],
        "__v":0,
        "tournaments":[{
          "tournamentId":'Bigest-Hollywood-Fan',
          status:"PLAYING",
          levelCleared:1,
          finalLevel:5,
          levelPoints:[20],
          currentRank:2,
          isFollowed:true
        },{
          "tournamentId":'Lord-Of-Series',
          status:"PLAYING",
          levelCleared:1,
          finalLevel:5,
          levelPoints:[20],
          currentRank:2,
          isFollowed:true
        }]
      };

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
      $scope.refreshLeaderBoard = function( tournamentId ) {
        $http.get( '/tournamentHandler/tournament/' + tournamentId )
           .then(function( successResponse ) {
              successResponse.data.leaderBoard = [{
               "_id": "56bc786168352fb00fe9da8f",
               "totalScore": 20,
               "userId": {
                 "_id":"56bc12dd35ef5e90193caba2",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"anilsawant2"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 40,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 40,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              }];
            successResponse.data.leaderBoard.sort( function(a,b) {
              return b.totalScore - a.totalScore;
            });

            successResponse.data.leaderBoard.forEach( function(player,index) {
              if ( player.userId.local.username == $rootScope.loggedInUser.userId ) {
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
      $scope.refreshLeaderBoard( $scope.tournamentId );// call for the first time


      $scope.refreshLeaderBoard2 = function( tournamentId ) {
        $http.get( '/tournamentHandler/tournament/' + tournamentId )
           .then(function( successResponse ) {
              successResponse.data.leaderBoard = [{
               "_id": "56bc786168352fb00fe9da8f",
               "totalScore": 10,
               "userId": {
                 "_id":"56bc12dd35ef5e90193caba2",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"anilsawant"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              },{
               "_id": "56bc786168352fb00fe9da91",
               "totalScore": 30,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab92",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"abhinavkareer"}
               }
              },{
               "_id": "56bc786168352fb00fe9da93",
               "totalScore": 15,
               "userId": {
                 "_id":"56bc12dd35ef5e90193cab94",
                 "local": { password:"$2a$10$fGvS3G/cgoDhfbzbm.../qwYtH4GRMMmCMpnUrMtZs.",  username:"sunilmekal"}
               }
              }];
            successResponse.data.leaderBoard.sort( function(a,b) {
              return b.totalScore - a.totalScore;
            });
            successResponse.data.leaderBoard.forEach( function(player,index) {
              if ( player.userId.local.username == $rootScope.loggedInUser.userId ) {
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
            console.log($scope.playedTournament);
          }, function( errorResponse ) {
               console.log('Failed to refresh the leader board. Showing old data.');
          });
      }


      $scope.play=function(levelId, topicId, title, topic_name)
      {
        $rootScope.levelId=levelId;
        $rootScope.title=title;
        $rootScope.tId=topicId;
        $rootScope.topicName=topic_name;
        $rootScope.roundCount = levelId.substring(levelId.lastIndexOf("_") + 1);
        $location.path('/quizPlayer');
      };

    $scope.leaders=function(tournamentId){
      var path1 = 'tournamentHandler/leaderBoard/' + tournamentId;
      console.log(path1);
      $http.get(path1)
              .success(function(data, status, headers, config) {
          $scope.leaders = data;
          console.log($scope.viewLeader);
      });
   };
 });
