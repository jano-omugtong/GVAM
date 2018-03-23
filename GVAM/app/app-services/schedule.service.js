(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('ScheduleService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetAll = GetAll;
        service.addSchedule = addSchedule;
        service.updateSchedule = updateSchedule;
        service.Delete = Delete;
 
        return service;
 
        function GetAll() {
            return $http.get('/api/schedule/getAll').then(handleSuccess, handleError);
        }

        function addSchedule(schedule) {
            return $http.post('/api/schedule/addSchedule', schedule).then(handleSuccess, handleError);
        }

        function updateSchedule(schedule){
            return $http.put('/api/schedule/' + schedule._id, schedule).then(handleSuccess, handleError);
        }
		
		function Delete(_id) {
            return $http.delete('/api/schedule/' + _id).then(handleSuccess, handleError);
        }
  
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();