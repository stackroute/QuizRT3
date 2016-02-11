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
    .controller('userProfileController',function($http,$scope,$rootScope,$location,$cookies,socket){
      if(!$cookies.get('isAuthenticated')){
        $location.path('/login');
      }
      $rootScope.stylesheetName="userProfile";
      $scope.a=7;
      $scope.see = true;
      $scope.btnImg = "images/userProfileImages/seeall.jpg";

      $rootScope.redirectTo = function( location ) {
        $location.path( "/" + location);
      };
      $scope.showTournamentDetails = function( tournamentId ) {
        $location.path( '/tournament/' + tournamentId );
      };
      $scope.seeHide=function(length){
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
      .success( function( user ){
        $scope.data = user;
        $rootScope.loggedInUser = user;
        $scope.topicsFollowed = [];
        if($scope.data.topicsPlayed!=null) {
          for(var i = 0;i < $scope.data.topicsPlayed.length;i++){
            if($scope.data.topicsPlayed[i].isFollowed){
              $scope.topicsFollowed.push( $scope.data.topicsPlayed[i] );
            }
          }
        }
        $rootScope.myImage=$scope.data.imageLink;
        $rootScope.fakeMyName=$scope.data.name;
        $rootScope.topperImage=$scope.data.imageLink;
        $rootScope.userIdnew=$scope.data.userId;
        //console.log($scope.topicsFollowed);
        $scope.showFollowedTopic=function(topicID){
          var path = '/topic/'+topicID;
          $location.path(path);
        };
        $scope.play=function() {
          $location.path( "/categories" );
        }
      })
      .error( function( err ) {
        console.log('User profile could not be loaded!');
      });

    $http({method : 'GET',url:'/tournamentHandler/tournaments'})
      .success(function(data){
        $scope.tournaments = data;
      });

  })
  .controller('userSettingsController', function($rootScope, $scope, $http) {
    var $inputFile = $('#inputFile'),
			  $profilePic = $('#profilePic');
    $scope.passwordMessage = '';
    $scope.errorMessage = '';
    $scope.tempLoggedInUser = $rootScope.loggedInUser;
    $scope.tempLoggedInUser.oldPassword = '';
    $scope.tempLoggedInUser.newPassword = '';
    $scope.tempLoggedInUser.confirmPassword = '';

    $scope.onlineImageLink = '';
    $scope.loadOnlineImage = function() {
      if ( $scope.onlineImageLink ) {
        $scope.tempLoggedInUser.imageLink = $scope.onlineImageLink;
      }
    }
    $scope.updateUserProfile = function() {
      console.log('clicked');
      if ( !$scope.tempLoggedInUser.name) {
        $scope.errorMessage = 'Enter your Name.';
      }else if ( !$scope.tempLoggedInUser.country ) {
        $scope.errorMessage = 'Enter your Country.';
      }else if ( !$scope.tempLoggedInUser.age ) {
        $scope.errorMessage = 'Enter your Age.';
      }else if ( !$scope.tempLoggedInUser.emailID ) {
        $scope.errorMessage = 'Enter your Email-ID.';
      }else {
        $scope.errorMessage = '';
        alert('Profile updated successfully.');
      }
    };
    $scope.changePassword = function( tempLoggedInUser ) {
      if ( tempLoggedInUser.oldPassword ) {
        if ( tempLoggedInUser.newPassword ) {
          if ( tempLoggedInUser.newPassword === tempLoggedInUser.confirmPassword ) {
            $scope.passwordMessage = '';
            alert('Password Changed');
            tempLoggedInUser.oldPassword = '';
            tempLoggedInUser.newPassword = '';
            tempLoggedInUser.confirmPassword = '';
          }else {
            $scope.passwordMessage = 'Confirm password not same.'
          }
        } else {
          $scope.passwordMessage = 'Enter new password.'
        }
      }else {
        $scope.passwordMessage = 'Enter old password.';
      }
    };
    $scope.removeIcon = function() {
      $scope.tempLoggedInUser.imageLink = '';
      $profilePic.css('border', '1px solid #aaa');
    };
    $scope.slideToggle = function( id ) {
      if( id.indexOf('Password') >=0 ) {
        $scope.toggleVarPassword ? $scope.toggleVarPassword = false : $scope.toggleVarPassword = true;
      }else if ( id.indexOf('Image') >=0 ) {
        $scope.toggleVarOnlineImageLink ? $scope.toggleVarOnlineImageLink = false : $scope.toggleVarOnlineImageLink = true;
      }
      $( id ).slideToggle();
    };
    $scope.$watch('passwordMessage', function(nv,ov) {
      if (nv) {
        $('#changePasswordDiv .alert').slideDown();
      }else {
        $('#changePasswordDiv .alert').slideUp();
      }
    });
    $scope.$watch('errorMessage', function(nv,ov) {
      if (nv) {
        $('#userProfileForm').children('.alert').slideDown();
      }else {
        $('#userProfileForm').children('.alert').slideUp();
      }
    });

    // to pop-up the input dialog
  	$profilePic.on('click',function() {
  		$inputFile.click();
  	});
    // to handle the selected input file and upload it
  	$inputFile.on('change',function() {
  		var fileToUpload = this.files[0];
  		var formData = new FormData();
  		formData.append('userID', $rootScope.loggedInUser.userId );
  		formData.append('teamIcon', fileToUpload );
      var reqObj = {
        method: 'POST',
        url: 'userProfile/userSettings/profilePic',
        headers: { 'Content-Type': undefined}, // to reset to browser default Content-Type
        data: formData
      }
      $http( reqObj ).then( function( successResponse ){
        $profilePic.css('padding',0)
  									.css('border', '1px solid transparent');
        $rootScope.loggedInUser.imageLink = successResponse.data.tempUrl;
        $scope.tempLoggedInUser.imageLink = successResponse.data.tempUrl;
      }, function( errorResponse ){
        console.log('Error in uploading user profile picture.');
        alert('Error in uploading user profile picture.')
      });
  	});

  })
  .controller('userTournamentsController', function($scope,$location,$http) {
    $http({method : 'GET',url:'/tournamentHandler/tournaments'})
      .success(function(data){
        $scope.tournaments = data;
      });

    $scope.showTournamentDetails = function( tournamentId ) {
      $location.path( '/tournament/' + tournamentId );
    };
  });
