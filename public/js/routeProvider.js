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

angular.module('quizRT', ['ngRoute', 'ngCookies']).run(function($cookies, $rootScope,$http,$location) {
      if($cookies.get('isAuthenticated')) $location.path('/userProfile');

      $rootScope.stylesheetName = "index";

      $rootScope.authenticated = $cookies.get('isAuthenticated');
      // $rootScope.authenticated = false;
      $rootScope.current_user = '';

      $rootScope.logout = function(){
          console.log('logout called');
          $http.post('auth/logout').success(function(){
            console.log('success function of logout called');
            $cookies.remove('isAuthenticated');
            $rootScope.authenticated = false;
            $rootScope.current_user = '';
            $location.path('/login');
          });
          // $rootScope.authenticated = false;
          // $rootScope.current_user = '';
          // delete req.session.user;
          // $location.path('/login');
          // delete req.session.user;
      };
})
  .factory('socket', function ($rootScope) {
          var socket = io.connect('http://172.23.238.200:3000');
    return {
      on: function (eventName, callback) {
       socket.on(eventName, function () {
       var args = arguments;
       $rootScope.$apply(function () {
         callback.apply(socket, args);
        });
       });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
         var args = arguments;
         $rootScope.$apply(function () {
          if (callback) {
          callback.apply(socket, args);
          }
         });
        })
       }
     }
    })
   .config(function($routeProvider){
     $routeProvider
       .when('/',{
         'templateUrl' : 'html/loginregister.html'
       })
       .when('/login', {
      			'templateUrl': 'html/login.html',
            'controller':'authController'
      		})
      .when('/locallogin', {
         			'templateUrl': 'html/locallogin.html',
         			'controller': 'authController'
         		})
      .when('/register', {
      			'templateUrl': 'html/register.html',
      			'controller': 'authController'
      		})
          .when('/userProfile',{
               'templateUrl': 'html/userProfile.html',
               'controller': 'userProfileController'
             })
         .when('/categories',{
               'templateUrl': 'html/categories.html',
               'controller': 'categoriesController'
             })

         .when('/category/:categoryID',{
               'templateUrl': 'html/category.html',
               'controller': 'categoryController'
             })

         .when('/topic/:topicID',{
               'templateUrl': 'html/topic.html',
               'controller': 'topicController'
             })
       .when('/quizPlayer',{
            'templateUrl': 'html/quizPlayer.html',
            'controller': 'quizPlayerController',
            'reload':true
          })
          .when('/quizResult',{
               'templateUrl': 'html/result.html',
               'controller': 'resultController'
             });



});
