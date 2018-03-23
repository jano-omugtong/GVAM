(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('RotationService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.getAllRotations = getAllRotations;
        service.addRotation = addRotation;
        service.updateRotation = updateRotation;
        service.Delete = Delete;
 
        return service;
 
        function getAllRotations() {
            return $http.get('/api/rotations/all').then(handleSuccess, handleError);
        }

        function addRotation(rotation) {
            return $http.post('/api/rotations/addRotation', rotation).then(handleSuccess, handleError);
        }

        function updateRotation(rotation){
            return $http.put('/api/rotations/' + rotation._id, rotation).then(handleSuccess, handleError);
        }
        
        function Delete(_id) {
            return $http.delete('/api/rotations/' + _id).then(handleSuccess, handleError);
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