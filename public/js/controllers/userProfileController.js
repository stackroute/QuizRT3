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
    .controller('userProfileController',function($http,$scope,$rootScope,$location,$cookies){
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

    $http({method : 'GET',url:'/userProfile/profileData'})
      .success(function(data){
        $scope.data = data;
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
        $scope.play=function()
        {
          var path="/categories";
          $location.path(path);
        }
      });

    $http({method : 'GET',url:'/tournamentHandler/tournaments'})
      .success(function(data){
        $scope.tournaments = data;
      });

  })
  .controller('userSettingsController', function($scope, $http) {
    var $inputFile = $('#inputFile'),
			  $profilePic = $('#profilePic');
    $scope.passwordMessage = '';
    $scope.errorMessage = '';
    $scope.user = {
      displayName : '',
      country:'',
      age:'',
      emailID:'',
      imageSrc:'',
      oldPassword:'',
      newPassword:'',
      confirmPassword:''
    };
    $scope.removeIcon = function() {
      $scope.user.imageSrc = '';
      $profilePic.css('padding','12px 12px')
    						 .css('border', '1px solid #aaa');
    };
    $scope.changePassword = function(user) {
      if ( user.oldPassword ) {
        if ( user.newPassword ) {
          if ( user.newPassword === user.confirmPassword ) {
            $scope.passwordMessage = '';
            alert('Password Changed');
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

    // to pop-up the input dialog
  	$profilePic.on('click',function() {
  		$inputFile.click();
  	});
    // to handle the selected input file and upload it
  	$inputFile.on('change',function() {
  		var fileToUpload = this.files[0];
  		var formData = new FormData();
  		formData.append('userID', 'user1');
  		formData.append('teamIcon', fileToUpload );
      var reqObj = {
        method: 'POST',
        url: 'userProfile/userSettings/profilePic',
        headers: { 'Content-Type': undefined},
        data: formData
      }
      $http( reqObj ).then( function( successResponse ){
        $profilePic.css('padding',0)
  									.css('border', 'none');
        $scope.user.imageSrc = successResponse.data.tempUrl;
      }, function( errorResponse ){
        console.log('Error in uploading user profile picture.');
      });
  	});

  });
