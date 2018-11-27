/*
    Name: Home Controller
    Date Created: ??/??/2018
    Author(s):
               Omugtong, Jano
               Reccion, Jeremy
    
 */

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('ManageGroups.IndexController', Controller);
 
     function Controller($window, MeetingService, $scope, $interval, $filter, socket, FlashService, UserService) {
 
        //initialization
        $scope.sched = [];
        $scope.publishers = [];
        
		$scope.loading = true;
        
        // function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        // get realtime changes
        socket.on('userChange', function(){
            getAllUsers();
        });

        getAllUsers();

        var vm = this;
        vm.user = [];
        function getAllUsers() {
            UserService.GetAll().then(function (user) {
                $scope.group1 = 0;
                $scope.group2 = 0;
                $scope.group3 = 0;
                $scope.group4 = 0;
                $scope.group5 = 0;
                $scope.group6 = 0;
                $scope.group7 = 0;
                $scope.unassigned = 0;
                $scope.allUsers = user;
                $scope.userLength = Object.size(user);
                for (var i = 0; i<$scope.userLength;i++){
                    if (user[i].username != "admin")
                        if (user[i].service_status != 'Dis-Fellow')
                            if (user[i].group == '1')
                                $scope.group1++;
                            if (user[i].group == '2')
                                $scope.group2++;
                            if (user[i].group == '3')
                                $scope.group3++;
                            if (user[i].group == '4')
                                $scope.group4++;
                            if (user[i].group == '5')
                                $scope.group5++;
                            if (user[i].group == '6')
                                $scope.group6++;
                            if (user[i].group == '7')
                                $scope.group7++;
                            if (user[i].group == 'unassigned')
                                $scope.unassigned++;
                            vm.user[i] = user[i];
                }
                vm.user = $filter('orderBy')(vm.user, 'username');
                $scope.publishers = vm.user;
            }).finally(function() {
				$scope.loading = false;
			});
        }


        vm.rotationDone = function(index){
            UserService.GetById(index).then(function(user){
                user.rotation_done = 'No';
                UserService.Update(user).then(function(){
                    FlashService.Success("Rotation Refreshed");
                }).catch(function (error) {
                    FlashService.Error(error);
                });
                socket.emit('userChange');
            }).catch(function (error) {
                FlashService.Error(error);
            });
            getAllUsers();
        }

        vm.changeAsAssistant = function(user, stat) {
            if (stat == null){
                user.asAssistant = 'Yes';
                UserService.Update(user)
                    .then(function () {
                        FlashService.Success('User updated');
                    }).catch(function (error) {
                        FlashService.Error(error);
                    }); 
            } else if (stat == 'Yes'){
                user.asAssistant = 'No';
                UserService.Update(user)
                    .then(function () {
                        FlashService.Success('User updated');
                    }).catch(function (error) {
                        FlashService.Error(error);
                    }); 
            } else {
                user.asAssistant = 'Yes';
                UserService.Update(user)
                    .then(function () {
                        FlashService.Success('User updated');
                    }).catch(function (error) {
                        FlashService.Error(error);
                    }); 
            }
            socket.emit('userChange');
            getAllUsers();
        }


    };

})();