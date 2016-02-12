angular.module('quizRT')
    .controller('halloffameController',function($http,$scope,$rootScope,$routeParams , $location){
        $scope.imageLink=$rootScope.loggedInUser.imageLink;
        $scope.name=$rootScope.loggedInUser.name;
        var tournamentID = $routeParams.tournamentID
        $scope.tournamentTitle = tournamentID;

        var path = 'tournamentHandler/leaderBoard/' + tournamentID;
        $http.get(path)
          .success( function( hallOfFame ){
            $scope.data = hallOfFame;
            console.log($scope.data);
            console.log($scope.data.leaderBoard);
    });
  });
