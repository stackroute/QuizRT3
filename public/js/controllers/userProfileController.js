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
        var k = 0;
        if($scope.data.topicsPlayed!=null)
        {
        for(var i = 0;i < $scope.data.topicsPlayed.length;i++){
          if($scope.data.topicsPlayed[i].isFollowed){
            $scope.topicsFollowed[k] =$scope.data.topicsPlayed[i];
            k++;
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
});
