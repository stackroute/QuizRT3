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
  .controller('authController',function(socket,$scope,$http,$rootScope,$location,$cookies){

    // redirect to login page if the user's isAuthenticated cookie doesn't exist
    if( $rootScope.isAuthenticatedCookie ) {
      $location.path('/userProfile');
      // $rootScope.initializeSockets(); // need to understand this requirement
    }
    $rootScope.stylesheetName="style";
    $scope.logInErrorMsg = '';
    $scope.dismissMsg = function() {
      $rootScope.logInLogOutErrorMsg = '';
      $rootScope.logInLogOutSuccessMsg = '';
      $scope.logInErrorMsg = '';
    }
    $scope.$watch('logInErrorMsg', function(nv,ov) {
      if (nv) {
        $('#errorDiv').slideDown();
      }else {
        $('#errorDiv').slideUp();
      }
    });
    $scope.user = {
      username:'',
      password:''
    };
    $scope.passportLogin = function(){
      $http.post('/auth/login', $scope.user).success(function( loginData ){
        if( loginData.error ){
          $scope.logInErrorMsg = loginData.error;
          $rootScope.isAuthenticatedCookie = false;
          $cookies.remove('isAuthenticated');
        } else{
          $cookies.put('isAuthenticated',true);
          $rootScope.isAuthenticatedCookie = true;
          $location.path('/userProfile');
          $rootScope.initializeSockets(); // initialize Sockets on successful login
        }
      });
    };

    $scope.register = function(){
      $http.post('/auth/register', $scope.user).success(function(data){
        if(data.state == 'success') {
          $rootScope.logInLogOutSuccessMsg = 'Registered sucessfully! Login and enjoy!!';
          $rootScope.logInLogOutErrorMsg = '';
          $location.path('/login');
        } else{
          $rootScope.logInLogOutErrorMsg = 'Could not register you at the moment. Kindly come back again.';
          $rootScope.logInLogOutSuccessMsg = '';
          $location.path('/login');
        }
      });
  };
});
