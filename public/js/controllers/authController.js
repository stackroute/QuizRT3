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
  .controller('authController',function($scope,$http,$rootScope,$location,$cookies){
    $rootScope.stylesheetName="style";
    $scope.user = {username: '', password: ''};
    $scope.error_message = '';
    $scope.login = function(){
      $http.post('/auth/login', $scope.user).success(function(data){
        if(data.state == 'success'){
          $rootScope.authenticated = true;
          $rootScope.current_user = data.user.local.username;
          $location.path('/userProfile');
          $cookies.put('isAuthenticated',true);
        }
        else{
          $scope.error_message = data.message;
          $rootScope.authenticated = false;
          $cookies.remove('isAuthenticated');
        }
      });
    };

  

    $scope.register = function(){
    $http.post('/auth/register', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.current_user = data.user.local.username;
        console.log('Hello2');
        $location.path('/locallogin');
        console.log('Helo3');
      }
      else{
        $scope.error_message = data.message;
      }
    });

  };

   $rootScope.logout= function(){
    //console.log('+++++++++++++++++logout called');
    $cookies.put('isAuthenticated',false);
    $location.path('/login');
  }

  });
