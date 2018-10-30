(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('MeetingService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.getAllMeetings = getAllMeetings;
        service.addMeeting = addMeeting;
        service.updateMeeting = updateMeeting;
        service.Delete = Delete;
 
        return service;
 
        function getAllMeetings() {
            return $http.get('/api/meetings/all').then(handleSuccess, handleError);
        }

        function addMeeting(meeting) {
            return $http.post('/api/meetings/addMeeting', meeting).then(handleSuccess, handleError);
        }

        function updateMeeting(meeting){
            return $http.put('/api/meetings/' + meeting._id, meeting).then(handleSuccess, handleError);
        }
        
        function Delete(_id) {
            return $http.delete('/api/meetings/' + _id).then(handleSuccess, handleError);
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