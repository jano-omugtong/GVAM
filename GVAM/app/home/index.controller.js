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
        .controller('Home.IndexController', Controller);
 
     function Controller($window, ScheduleService, $scope, $interval, $filter, socket, FlashService) {
 
        //initialization
        $scope.sched = [];

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

        function getAllSchedule(){
            //get all Schedule
            ScheduleService.GetAll().then(function(schedule){
                if(schedule.length > 0){               
                    //store to array
                    $scope.sched = schedule;
                    $scope.sched = $filter('orderBy')($scope.sched, 'schedule_date');
                    console.log($scope.sched);
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

        $scope.Save = function() {
            console.log($scope.sched[0].Done);
            $scope.sched[0].Done = "Yes";
            console.log($scope.sched[0].Done);
            ScheduleService.updateSchedule($scope.sched[0]).then(function(){
                FlashService.Success('Schedule Finalized');
                $scope.sched = [];
                socket.emit('scheduleChange');
                
            })
            .catch(function(error){
                FlashService.Error(error);
            });
        }

        $scope.edit = false;
        $scope.EditFinished = function(){
            if (!$scope.edit)
                $scope.edit = true;
            else
                $scope.edit = false;
        }

        $scope.brsub = false;
        $scope.sub1 = false;
        $scope.sub2 = false;
        $scope.sub3 = false;
        $scope.sub4 = false;
        $scope.sub5 = false;
        $scope.sub6 = false;

        $scope.brshow = function(){
            if (!$scope.brsub)
                $scope.brsub = true;
            else
                $scope.brsub = false;
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