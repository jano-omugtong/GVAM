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
        $scope.group1 = 0;
        $scope.group2 = 0;
        $scope.group3 = 0;
        $scope.group4 = 0;
        $scope.group5 = 0;
        $scope.group6 = 0;
        $scope.group7 = 0;
        $scope.unassigned = 0;

        $scope.current_warehouse = {};
        var isModalOpened = false;
        
		$scope.loading = true;
        
        // function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        getAllSchedule();
        getAllUsers();

        function getAllSchedule(){
            //get all Schedule
            MeetingService.getAllMeetings().then(function(schedule){
                if(schedule.length > 0){    
                    var i = 0, j = 0;
                        angular.forEach(schedule, function(value, key){
                            angular.forEach(value, function(value2, key2){
                                if (key2 == "Done"){
                                    if (value2 == "No"){
                                        $scope.sched[j++] = schedule[i];
                                    }
                                    i++;
                                }
                            });
                        });
                    //store to array
                    $scope.sched = $filter('orderBy')($scope.sched, 'schedule_date');
                }
                else{
                    //perform notification here
                    FlashService.Error("No schedule found");
                }
            })
            .catch(function(error){
                FlashService.Error(error);
            }).finally(function() {
				$scope.loading = false;
			});
        }

        var vm = this;
        vm.user = [];
        function getAllUsers() {
            UserService.GetAll().then(function (user) {
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

        $scope.Save = function() {
            $scope.sched[0].Done = "Yes";
            MeetingService.updateMeeting($scope.sched[0]).then(function(){
                
                for (var i = 0; i<(vm.user.length - 1);i++){
                    if ($scope.sched[0].Main_Hall == 'Ok'){
                        if(vm.user[i].username == $scope.sched[0].BReader1.student){
                            if ($scope.sched[0].brsub1){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else if (vm.user[i].assign_missed == 3){}
                                else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].BReader1.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].BReader1.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].MAssign1.student){
                            if ($scope.sched[0].sub1){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].MAssign1.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].MAssign1.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].MAssign2.student){
                            if ($scope.sched[0].sub2){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].MAssign2.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].MAssign2.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].MAssign3.student){
                            if ($scope.sched[0].sub3){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].MAssign3.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].MAssign3.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                    }
                    if ($scope.sched[0].Second_Hall == 'Ok'){
                        if(vm.user[i].username == $scope.sched[0].BReader2.student){
                            if ($scope.sched[0].brsub2){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].BReader2.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].BReader2.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].SAssign1.student){
                            if ($scope.sched[0].sub4){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].SAssign1.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].SAssign1.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].SAssign2.student){
                            if ($scope.sched[0].sub5){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].SAssign2.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].SAssign2.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                        if(vm.user[i].username == $scope.sched[0].SAssign3.student){
                            if ($scope.sched[0].sub6){
                                if (!vm.user[i].assign_missed){
                                    vm.user[i].assign_missed = 1;
                                } else {
                                    vm.user[i].assign_missed++;
                                }
                                UserService.Update(vm.user[i]);
                            }
                            else {
                                if (!vm.user[i].lessons_done){
                                    vm.user[i].lessons_done = $scope.sched[0].SAssign3.lesson;
                                } else {
                                    vm.user[i].lessons_done = vm.user[i].lessons_done + ", " + $scope.sched[0].SAssign3.lesson;
                                }
                                vm.user[i].assign_missed = 0;
                                UserService.Update(vm.user[i]);
                            }
                        }
                    }
                }
                FlashService.Success('Schedule Finalized');
                $scope.sched = [];
                resetInputfields();
                getAllSchedule();
                socket.emit('scheduleChange');
                
            })
            .catch(function(error){
                FlashService.Error(error);
            });
        }

        function resetInputfields() {
            $scope.brsub1 = false;
            $scope.brsub2 = false;
            $scope.sub1 = false;
            $scope.sub2 = false;
            $scope.sub3 = false;
            $scope.sub4 = false;
            $scope.sub5 = false;
            $scope.sub6 = false;
        }

        $scope.edit = false;
        $scope.EditFinished = function(){
            if (!$scope.edit)
                $scope.edit = true;
            else
                $scope.edit = false;
        }

        $scope.brsub1 = false;
        $scope.brsub2 = false;
        $scope.sub1 = false;
        $scope.sub2 = false;
        $scope.sub3 = false;
        $scope.sub4 = false;
        $scope.sub5 = false;
        $scope.sub6 = false;

        $scope.brshow1 = function(){
            if (!$scope.brsub1)
                $scope.brsub1 = true;
            else
                $scope.brsub1 = false;
        }
        $scope.brshow2 = function(){
            if (!$scope.brsub2)
                $scope.brsub2 = true;
            else
                $scope.brsub2 = false;
        }
        $scope.show1 = function(){
            if (!$scope.sub1)
                $scope.sub1 = true;
            else
                $scope.sub1 = false;
        }
        $scope.show2 = function(){
            if (!$scope.sub2)
                $scope.sub2 = true;
            else
                $scope.sub2 = false;
        }
        $scope.show3 = function(){
            if (!$scope.sub3)
                $scope.sub3 = true;
            else
                $scope.sub3 = false;
        }
        $scope.show4 = function(){
            if (!$scope.sub4)
                $scope.sub4 = true;
            else
                $scope.sub4 = false;
        }
        $scope.show5 = function(){
            if (!$scope.sub5)
                $scope.sub5 = true;
            else
                $scope.sub5 = false;
        }
        $scope.show6 = function(){
            if (!$scope.sub6)
                $scope.sub6 = true;
            else
                $scope.sub6 = false;
        }

       

    };

})();