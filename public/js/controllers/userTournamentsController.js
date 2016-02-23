//Copyright {2016} {NIIT Limited, Wipro Limited}
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//   Name of Developers  Anil Sawant, Venkat

angular.module('quizRT')
  .controller('userTournamentsController', function($rootScope,$scope,$location,$http) {
    // redirect to login page if the user's isAuthenticated cookie doesn't exist
    if( !$rootScope.isAuthenticatedCookie ){
      $rootScope.logInLogOutErrorMsg = 'You are logged out. Kindly Login...';
      $rootScope.logInLogOutSuccessMsg = '';
      $location.path('/login');
    } else {

      // get all the user tournaments
      if ( $rootScope.loggedInUser && $rootScope.loggedInUser.tournaments && $rootScope.loggedInUser.tournaments.length) {
        var reqObj = {
          method: 'POST', // since no. of tournamentIds can get large
          url: '/tournamentHandler/tournaments',
          data: { tournamentIds:[] },
          headers:{'Content-Type':'application/json'}
        };
        $rootScope.loggedInUser.tournaments.forEach( function( tournament ) {
          reqObj.data.tournamentIds.push( tournament.id );
        });
        $http( reqObj )
          .then( function( successResponse ){
            $scope.userTournaments = successResponse.data.userTournaments;
          }, function( errorResponse ) {
            console.log('Could not retrieve user tournaments from MongoDB');
          });
      }

      // GET all the tournaments
      if( !($scope.tournaments && $scope.tournaments.length) ) {
        var reqObj = {
          method: 'GET',
          url: '/tournamentHandler/tournaments'
        };
        $http( reqObj )
          .success(function(data){
            $scope.tournaments = data;
          })
          .error( function(err) {
            console.log('Could not retrieve tournaments from MongoDB');
          });
      } else {
        // $scope.$apply();
      }
      $scope.showTournamentDetails = function( tournamentId ) {
        $location.path( '/tournament/' + tournamentId );
      };
    }
  });
