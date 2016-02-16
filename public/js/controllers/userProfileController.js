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
//   Name of Developers  Raghav Goel, Kshitij Jain, Lakshay Bansal, Ayush Jain, Saurabh Gupta, Akshay Meher
//                        + Anil Sawant

angular.module('quizRT')
    .controller('userProfileController',function($http,$scope,$rootScope,$location,socket){

      // redirect to login page if the user's isAuthenticated cookie doesn't exist
      if( !$rootScope.isAuthenticatedCookie ){
        $rootScope.logInLogOutErrorMsg = 'You are logged out. Kindly Login...';
        $location.path('/login');
      } else {
        $rootScope.stylesheetName="userProfile";
        $scope.a=7;
        $scope.see = true;
        $scope.btnImg = "images/userProfileImages/seeall.jpg";

        $scope.showTournamentDetails = function( tournamentId ) {
          $location.path( '/tournament/' + tournamentId );
        };
        $scope.seeHide = function(length){
         if($scope.see){
           $scope.see = false;
           $scope.btnImg = "images/userProfileImages/hide.jpg";
           $scope.a=length;
         }
         else{
           $scope.see = true;
           $scope.btnImg = "images/userProfileImages/seeall.jpg";
           $scope.a=7;
         }
        }

      // refresh the user profile
      // socket.on('refreshUser', function( user ) {
      //   $rootScope.loggedInUser = user;
      // });

      $http({method : 'GET',url:'/userProfile/profileData'})
        .then( function( successResponse ){
          $scope.data = successResponse.data.user;
          $rootScope.loggedInUser = successResponse.data.user;
          $scope.topicsFollowed = [];
          if($rootScope.loggedInUser.topicsPlayed != null) {
            for(var i = 0;i < $rootScope.loggedInUser.topicsPlayed.length;i++){
              if( $rootScope.loggedInUser.topicsPlayed[i].isFollowed){
                $scope.topicsFollowed.push( $rootScope.loggedInUser.topicsPlayed[i] );
              }
            }
          }
          $rootScope.myImage = $rootScope.loggedInUser.imageLink;
          $rootScope.fakeMyName = $rootScope.loggedInUser.name;
          $rootScope.topperImage = $rootScope.loggedInUser.imageLink;
          $rootScope.userIdnew = $rootScope.loggedInUser.userId;
          //console.log($scope.topicsFollowed);

        }, function( errorResponse ) {
          if ( errorResponse.status === 401 ) {
            $rootScope.isAuthenticatedCookie = false;
            console.log('User not authenticated by Passport.');
          }
          $rootScope.serverErrorMsg = errorResponse.data.error;
          $rootScope.serverErrorStatus = errorResponse.status;
          $rootScope.serverErrorStatusText = errorResponse.statusText;
          $location.path('/error');
          console.log('User profile could not be loaded!');
        });

        $scope.showFollowedTopic = function(topicID){
          var path = '/topic/'+topicID;
          $location.path(path);
        };
        $scope.play = function() {
          $location.path( "/categories" );
        }

        $http({method : 'GET',url:'/tournamentHandler/tournaments'})
        .success(function(data){
          $scope.tournaments = data;
        });
      }
  });
