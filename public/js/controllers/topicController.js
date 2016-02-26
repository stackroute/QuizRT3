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
//

angular.module('quizRT')
  .controller('topicController', function( $scope, $rootScope, $routeParams, $http, $location) {
     $scope.topicId = $routeParams.topicId;
     $scope.topic = {};
     $scope.userTopicFollowState = false;
     $scope.topicFollowers = 0;
     $rootScope.stylesheetName = "topic";
     var path = '/topicsHandler/topic/'+ $scope.topicId;

     /*
        HTTP methods are used as follows:
        GET: to retrieve topic details along with userStats
        PUT: to follow-unFollow a topic
        POST: to update the topic and userStats when user hits Play Now!
     */
     $http.get(path)
         .then( function( successResponse) {
           $scope.topic = successResponse.data.topicWithUserStats;
           $scope.topicFollowers = successResponse.data.topicWithUserStats.topicFollowers;
           $scope.userTopicFollowState = successResponse.data.topicWithUserStats.userStats.isFollowed;
           // levelId is defined for Tournaments only hence resetting it
           $rootScope.levelId = null;
         }, function( errorResponse ) {
           if ( errorResponse.status === 401 ) {
            //  $rootScope.isAuthenticatedCookie = false;
             console.log('User not authenticated by Passport.');
           }
           $rootScope.serverErrorMsg = errorResponse.data.error;
           $rootScope.serverErrorStatus = errorResponse.status;
           $rootScope.serverErrorStatusText = errorResponse.statusText;
           $location.path('/error');
           console.log('Topic with userStats could not be loaded!');
         });

     $scope.followUnfollow = function() {
       $http.put( '/topicsHandler/topic/'+ $scope.topicId )
         .then( function( successResponse ) {
           $scope.userTopicFollowState = successResponse.data.userTopicFollowState;
           successResponse.data.userTopicFollowState ? $scope.topicFollowers++ : $scope.topicFollowers--;
         }, function( errorResponse ) {
           console.log('Topic could not be followed!');
         });
    };

    $scope.playGame = function( topicId ) {
      $rootScope.playGame = {};
      $rootScope.playGame.topicId = topicId;
      $rootScope.playGame.topicName = $scope.topic.topicName;
      $rootScope.hideFooterNav = true; // to hide the footer-nav while playing a game
      $http.post( '/topicsHandler/topic/'+ $scope.topicId )
        .then( function( successResponse ) {
          $location.path( '/quizPlayer' );
        }, function( errorResponse ) {
          console.log(errorResponse.data.error);
        });
    }
  });
