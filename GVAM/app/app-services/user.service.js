(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('UserService', Service);
 
    function Service($http, $q) {
        var service = {};
 
        service.GetCurrent = GetCurrent;
        service.GetAdmin = GetAdmin;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.UpdateAll = UpdateAll;
        service.Delete = Delete;
        service.Insert = Insert;
        service.UploadFile = UploadFile;
        service.deleteProfilePic = deleteProfilePic;
        service.GetAllByGender = GetAllByGender;
 
        return service;

        /*
            Function name: Delete profile picture
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/08
            Description: returns http update on deleting the user profile picture
            Parameter(s): user
            Return: http post response
        */
        function deleteProfilePic(user) {
            return $http.put('/api/users/deleteProfilePic/' + user._id, user).then(handleSuccess, handleError);
        }

        /*
            Function name: User App Service Upload File
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: appends current user id and email and input file to form data and
                sends it to controllers/user.controller.js to return correct http response
            Parameter(s): input file, user scope
            Return: http post response
        */
        function UploadFile(file, user) {
            var fd = new FormData();
            fd.append('id', user._id);
            fd.append('username', user.username);
            fd.append('myfile', file.upload);
            return $http.post('/api/users/upload', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined}}).then(handleSuccess, handleError);
        }
        
        /*
            Function name: User App Service Get current user
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves the user info of the currently logged in user
            Parameter(s): none
            Return: none
        */
        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        /*
            Function name: User App Service Get Admin
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves the role of the user if it is Admin or User
            Parameter(s): none
            Return: none
        */
        function GetAdmin() {
            return $http.get('/api/users/isAdmin').then(handleSuccess, handleError);
        }
        
        /*
            Function name: User App Service Get Admin
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves all the users
            Parameter(s): none
            Return: none
        */
        function GetAll() {
            return $http.get('/api/users/all').then(handleSuccess, handleError);
        }

       function GetAllByGender(gender) {
        return $http.get('/api/users/all/' + gender).then(handleSuccess, handleError);
    }
        
        /*
            Function name: User App Service Get By Id
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves one user by _id
            Parameter(s): none
            Return: none
        */
        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }
 
        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }
 
        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }
 
        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }
        
        function UpdateAll() {
            return $http.post('/api/users/uAll').then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function Insert(user){
            return $http.post('/api/users/addUser', user).then(handleSuccess, handleError);
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