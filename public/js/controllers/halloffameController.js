angular.module('quizRT')
    .controller('halloffameController',function($http,$scope,$rootScope,$routeParams , $location){
        $scope.imageLink=$rootScope.loggedInUser.imageLink;
        $scope.name=$rootScope.loggedInUser.name;
        var tournamentId = $routeParams.tournamentId
        $scope.tournamentTitle = tournamentId;

        var path = 'tournamentHandler/leaderBoard/' + tournamentId;
        $http.get(path)
          .success( function( hallOfFame ){
            $scope.data = hallOfFame;
            console.log($scope.data);
            console.log($scope.data.leaderBoard);
    });
  });
