/*
    Name: Home Controller
    Date Created: ??/??/2018
    Author(s):
    
 */
(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router', 'ui.sortable', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'btford.socket-io'])
        .config(config)
        .run(run);
 
    /*
        Function name: config function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Declare the angular configuration (routes, injectors, etc)
        Parameter(s): $stateProvider, $urlRouteProvider, $httpProvider (dependencies)
        Return: none
    */
    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
 
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            
            //Added by Glenn
            .state('manageUsers', {
                url: '/manageUsers',
                templateUrl: 'manageUsers/index.html',
                controller: 'ManageUsers.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageUsers' }
            })

            //Added by Glenn
            .state('manageRotations', {
                url: '/manageRotations',
                templateUrl: 'rotation/index.html',
                controller: 'ManageRotations.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageRotations' }
            })
            
            //added by jeremy
            .state('schedule', {
                url: '/schedule',
                //schedule_tag parameter is optional and will not show in the url
                params: { 
                    schedule_date: null
                },
                templateUrl: 'schedule/index.html',
                controller: 'Schedule.IndexController',
                //not yet used
                controllerAs: 'vm',
                data: {activeTab: 'schedule'}
            })
            //parameter is always required
            .state('fields' ,{
                url: '/fields?name',
                templateUrl: 'fields/index.html',
                controller: 'Fields.IndexController',
                controllerAs: 'vm',
                data: {activeTab: 'fields'}
            });


        // added by jeremy
        // this is to intercept all errors. when 401 is received, must redirect to login
        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();

                    //401 is unauthorized error, meaning token has expired 
                    if(rejection.status == 401){
                        //this is done to imitate the returnUrl in app.controller.js 
                        //when accessing pages that requires login

                        //pathname only shows /app/ which is wrong
                        //so get fullpath first then get substring starting from pathname
                        var fullpath = $window.location.href;
                        var returnUrl = fullpath.substring(fullpath.indexOf($window.location.pathname));

                        //add expired query to explicitly state that the session has expired and not just trying to access via typing the address
                        $window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl) + '&expired=true';
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    /*
        Function name: run function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Executes when angular page is first loaded
        Parameter(s): $http, $rootScope, $window, UserService, $state (dependencies)
        Return: none
    */
    function run($http, $rootScope, $window, UserService, $state) {
        //initialize
        $rootScope.greet = false;
		$rootScope.changePasswordModal = false;

        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        //added by glenn
        //get current user and set details to rootScope
        $http.get('/api/users/isAdmin').success(function(response){
            //response is true if user is admin from api/users.controller.js
            //console.log(response);
            if(response){

                // Determine if user is admin
                if(true){
                    // User can manage users
                    $rootScope.isAdmin = true;
                } else {

                    //User cannot manage users
                    $rootScope.isAdmin = false;
                }
            }
            else{
                return false;
            }
        });
 
        //added by jeremy
        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //console.log($rootScope.isAdmin);
            //console.log(toState);
            //restrict 'Users' when accessing states other than the specified and redirect to login page
            if(!$rootScope.isAdmin && (toState.name != 'schedule' && toState.name != 'home' && toState.name != 'account')){
                event.preventDefault();
                //alert('Unauthorized');
                $state.transitionTo('home');
            }

            //get token from server every route change to determine if session in server is still alive
            $http.get('/app/token').then(function(res){
                //console.log(res);
                //if server restarts while app is in browser, clicking links will render the login page
                //inside the index.html
                //so check the res.data for '<html>'. if found, load whole login page
                if(res.data.indexOf('<html>') != -1){
                        var fullpath = $window.location.href;
                        var returnUrl = fullpath.substring(fullpath.indexOf($window.location.pathname));

                        //add expired query to explicitly state that the session has expired and not just trying to access via typing the address
                        $window.location.href = '/login?returnUrl=' + encodeURIComponent(returnUrl) + '&expired=true';
                }
            });
            
            //change active tab for the nav bar
            $rootScope.activeTab = toState.data.activeTab;
        });
      
        //execute when loaded
        getUserInfos();
  

        /*
            Function name: getUserInfos
            Author(s): Omugtong, Jano
            Date Modified: 02-06-18
            Description: get first name and last name of user for default avatar
                        get id to generate a unique background color for avatar
                        and also assign firstname in rootscope.
            Parameter(s): none
            Return: none
        */
        function getUserInfos() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                var str = user._id;
                $rootScope.lagot = false;
                $rootScope.fName = user.firstName;
                if (user.assign_missed > 2){
                    $rootScope.lagot = true;
                }

                if (user.firstName == null){
                    $rootScope.initials = "new";
                }
                else{
                    var initials = user.firstName.charAt(0) + user.lastName.charAt(0);
                    $rootScope.initials = initials.toUpperCase();

                    //get user profile pic
                    $rootScope.profilePic = '/' + user.profilePicUrl;
                    if(user.profilePicUrl == undefined || user.profilePicUrl == ''){
                        $rootScope.profilePic = '';
                    }
                }

                $rootScope.bgColor = {"background" : stringToColour(str)} ;

                function stringToColour(str) {
                    var hash = 0;
                    for (var i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var colour = '#';
                    for (var i = 0; i < 3; i++) {
                      var value = (hash >> (i * 8)) & 0xFF;
                      colour += ('00' + value.toString(16)).substr(-2);
                    }
                    return colour;
                  }
            }).finally(function(){
                $rootScope.greet = true;
            });
        }
    }
 
    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;
 
            angular.bootstrap(document, ['app']);
        });
    });
})();