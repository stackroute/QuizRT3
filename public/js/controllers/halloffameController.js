angular.module('quizRT')
    .controller('halloffameController',function($http,$scope,$rootScope,$location,$cookies){


        $scope.imageLink=$rootScope.loggedInUser.imageLink;
        $scope.name=$rootScope.loggedInUser.name;
        console.log($rootScope.loggedInUser);

        $http({method : 'GET',url:'tournamentHandler/leaderBoard/hallOfFame:tId'})
          .success( function( hallOfFame ){
            $scope.data = hallOfFame;
            console.log($scope.data);
    });
  });
