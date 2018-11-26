/*
    Name: Meetings Controller
    Date Created: 01/03/2018
    Author(s): Sanchez, Macku
               Flamiano, Glenn  
*/

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('ManageMeetings.IndexController', Controller)

        /*
            Function name: Object filter
            Author(s): Flamiano, Glenn
            Date Modified: December 2017
            Description: to order the rows of the table
            Parameter(s): none
            Return: Array
        */
        .filter('orderObjectBy', function() {
          return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
              filtered.push(item);
            });
            filtered.sort(function (a, b) {
              return (a[field] > b[field] ? 1 : -1);
            });
            if(reverse) filtered.reverse();
            return filtered;
          };
        })

        /*
            Function name: Pagination filter
            Author(s): Flamiano, Glenn
            Date Modified: December 2017
            Description: to slice table per page based on number of items
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });
 
    function Controller(MeetingService, $scope, FlashService, FieldsService, UserService, socket, $filter) {
        var vm = this;
 
        vm.meeting = [];
		
		$scope.loading = true;
        $scope.confirmPassword = {};

        /*
            Function name: Calculate Object size
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: to compute the size of an object
            Parameter(s): none
            Return: size
        */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        // initialize pages of meeting list
        $scope.currentPage = 1;
        $scope.pageSize = 10;

        // Scope for meetings data
        $scope.aMeetings = {};
        $scope.aMeetings.password = "";


        /*
            Function name: Reset Flash Messages
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: Hide flash messages of every modal
            Parameter(s): none
            Return: none
        */
        function resetModalFlash(){
            $scope.showMainFlash = true;
            $scope.showAddFlash = false;
            $scope.showEditFlash = false;
        }
        resetModalFlash();

        // Table sort functions
        // column to sort
        $scope.column = 'meeting_date';

        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse = true; 

        /*
            Function name: Sort Table Columns
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To sort the table by ascending/desending order by clicking the column header
            Parameter(s): column
            Return: none
        */
        $scope.sortColumn = function(col){
            $scope.column = col;
            if($scope.reverse){
                $scope.reverse = false;
                $scope.reverseclass = 'arrow-up';
            }else{
                $scope.reverse = true;
                $scope.reverseclass = 'arrow-down';
            }
        };

        /*
            Function name: Sort Class
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To change column sort arrow UI when meeting clicks the column
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(col){
            if($scope.column == col ){
                if($scope.reverse){
                    return 'arrow-down'; 
                }else{
                    return 'arrow-up';
                }
            }else{
                return 'arrow-dormant';
            }
        } 
        // End of Table Functions

        /*
            Function name: Set column width
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To set the fixed with of the specific columns in the table
            Parameter(s): none
            Return: none
        */
        $scope.setWidth = function(column){
            switch(column){
                case "role": return 'col-sm-1'; break;
                case "firstName": return 'col-sm-3'; break;
                case "lastName": return 'col-sm-3'; break;
                case "email": return 'col-sm-3'; break;
                default: return '';
            }
        };

        /*
            Function name: Reset meeting scope
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: To reinitialize the $scope.AMeetings variable used for CRUD
            Parameter(s): none
            Return: none
        */
        function resetAMeetings () {
            $scope.aMeetings = {};
            $scope.aMeetings.email = "";
            $scope.aMeetings.password = "";
            selected = [];
            $scope.confirmPassword = {};

            //Uncheck all checkboxes and radio
            var checkboxes = document.getElementsByTagName('input');    
            for (var i = 0; i < checkboxes.length; i++){
                if(checkboxes[i].type == 'checkbox' || checkboxes[i].type == 'radio'){
                    checkboxes[i].checked = false;
                }
            }
        }
 
        // get realtime changes
        socket.on('meetingChange', function(){
            initController();
        });

        initController();
        
        /*
            Function name: Initialize Controller
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: Retrieves all meeting data from meetings collection in mongoDB
            Parameter(s): none
            Return: none
        */
        function initController() {
            // get current meeting
            MeetingService.getAllMeetings().then(function (meeting) {
                vm.meeting = meeting;
                $scope.allMeetings = meeting;
                $scope.meetingLength = Object.size(meeting);
            }).finally(function() {
				$scope.loading = false;
			});
        }

        $scope.id = "";
        $scope.fields = [];
        $scope.fieldsUsr = [];
        $scope.name = 'meeting';
		
        /*
            Function name: Get all meeting fields 
            Author(s):
            Date Modified: January 2018
            Description: Retrieves fields array from meeting document from fields collection in mongoDB
            Parameter(s): none
            Return: none
        */
        function getAllFields(){

            FieldsService.GetAll("user").then(function(response){
                
                var fieldsLength = Object.size(response.fields);
                for (var i = 0, j = 0; i < fieldsLength; i++){
                    if (response.fields[i].type == "dropdown"){
                        if (response.fields[i].name != "role"){
                            if (response.fields[i].name == "rotation_done"){}
                            else
                                $scope.fieldsUsr[j++] = response.fields[i];
                        }
                    }
                }
			}).catch(function(err){
				alert(err.msg_error);
            });

            FieldsService.GetAll("meeting").then(function(response){
				$scope.fields = response.fields;
                $scope.id = response._id;
				$scope.fieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
            
            /*
            FieldsService.GetAll($scope.name).then(function(response){
    
               $scope.fields = response.fields;
               $scope.id = response._id;
              
               $scope.fieldsLength = Object.size(response.fields);
                
            }).catch(function(err){
                alert(err.msg_error);
            });
            */
        };

        vm.user = [];
        function getAllUsers() {
            UserService.GetAll().then(function (user) {
                $scope.allUsers = user;
                $scope.userLength = Object.size(user);
                for (var i = 0, j= 0; i<$scope.userLength;i++){
                    if (user[i].username != "admin")
                        if (user[i].service_status != 'W/Restrictions' && user[i].service_status != 'Pending' && user[i].service_status != 'Inactive')
                            vm.user[j++] = user[i];
                }
                vm.user = $filter('orderBy')(vm.user, 'username');
            }).finally(function() {
				$scope.loading = false;
			});
        }
        
        getAllFields();
        getAllUsers();

        /*
            Function name: Show different field types
            Author(s): Flamiano, Glenn
            Date Modified: 01/26/2018
            Description: To hide/show different input types
            Parameter(s): none
            Return: boolean
        */
        $scope.showTextBox = function(data){
            if(data == 'text'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showEmail = function(data){
            if(data == 'email'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showNumber = function(data){
            if(data == 'number'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showPassword = function(data){
            if(data == 'password'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showTextArea = function(data){
            if(data == 'textarea'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showCheckBox = function(data){
            if(data == 'checkbox'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDropDown = function(data){
            if(data == 'dropdown'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showRadio = function(data){
            if(data == 'radio'){
                return true;
            } else {
                return false;
            }
        };

        $scope.showDate = function(data){
            if(data == 'date'){
                return true;
            } else {
                return false;
            }
        };

        /*
            Function name: Array remove element function
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/24
            Description: Remove and element in an array
            Parameter(s): none
            Return: size
        */
        Array.prototype.remove = function() {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };

        /*
            Function name: Format date
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aMeetings
            Parameter(s): none
            Return: formatted date
        */
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        /*
            Function name: Insert formatted date to $scope.aMeetings
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To format a date and to be inserted to $scope.aMeetings
            Parameter(s): none
            Return: none
        */
        $scope.pushDateToAMeetings = function(fieldName, inputDate) {
            $scope.aMeetings[fieldName] = formatDate(inputDate);
        };

        /*
            Function name: Validate email inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: Check all email inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkEmails(){
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var myRows = document.getElementsByName('email');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                //console.log('aaaaaa', myRows[i].value);
                if(myRows[i].value != ''){
                    //console.log(myRows[i].value+' grrrr '+re.test(myRows[i].value.toLowerCase()));
                    if(!re.test(myRows[i].value.toLowerCase())){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate number inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all number inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkNumbers(){
            var myRows = document.getElementsByName('number');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(isNaN(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Validate password strength
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check password if it contains a lowercase, uppercase, number, and is 8 characters
            Parameter(s): none
            Return: boolean
        */
        function checkPasswordChars(password){
            var points = 0;
            var valid = false;

            // Validate lowercase letters
            var lowerCaseLetters = /[a-z]/g;
            if(password.match(lowerCaseLetters)) {  
                points += 1;
            }

            // Validate capital letters
            var upperCaseLetters = /[A-Z]/g;
            if(password.match(upperCaseLetters)) {  
                points += 1;
            }

            // Validate numbers
            var numbers = /[0-9]/g;
            if(password.match(numbers)) {  
                points += 1;
            }

            // Validate length
            if(password.length >= 8) {
                points += 1;
            }

            // if points = 4 return true
            if(points == 4){
                valid = true;
            }
            
            return valid;
        }

        /*
            Function name: Validate password inputs
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkPasswords(){
            var myRows = document.getElementsByName('password');
            var allValid = true;
            for(var i=0;i<myRows.length;i++){ 
                if(myRows[i].value != ''){
                    if(!checkPasswordChars(myRows[i].value)){
                        allValid = false;
                    }
                }
            } 
            return allValid;
        };

        /*
            Function name: Get all checkbox elements
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Get all checkbox elements and set dynamic temporary variables for checked items
            Parameter(s): none
            Return: none
        */
        var selected = [];
        var checkboxFields = [];
        var selectedLength = 0;
        $scope.declareSelected = function(){
            $scope.showMainFlash = false;
            checkboxFields = document.getElementsByName("checkBoxInput");
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
            }
        };

        /*
            Name: modify dropdown 
            Author(s):
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: initialize dropdown values if they are required
        */
        $scope.modifyDropdown = function(){
            //this is to initialize dropdowns that were added after adding meetings
            //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                if(value.type == 'dropdown' && value.required){
                    $scope.aMeetings[value.name] = value.options[0];
                }
            });
        };

        /*
            Function name: Insert radio button value to $scope.aMeetings
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: To insert radio button value to $scope.aMeetings, it is called
                when radio button is checked
            Parameter(s): option, fieldName
            Return: none
        */
        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.aMeetings[fieldName] = option;
        }

        /*
            Function name: Validate confirm passwords
            Author(s): Flamiano, Glenn
                       Reccion, Jeremy
            Date Modified: 2018/02/01
            Description: Check all password inputs in add/edit modal
            Parameter(s): none
            Return: boolean
        */
        function checkConfirmPasswords(){
            var allValid = true;
            for(var i in $scope.fields){
                var currentField = $scope.fields[i];
                
                //validation for password
                if(currentField.type == 'password'){
                    if($scope.aMeetings[currentField.name] != $scope.confirmPassword[currentField.name]){
                        allValid = false;
                    }
                }
            }
            return allValid;
        };

        /*
            Function name: isChecked
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the checkbox if checked
            Parameter(s): field.name, html input type
            Return: none
        */
        $scope.isChecked = function(field_name, option, type){
            if(type == 'checkbox'){
                if($scope.aMeetings[field_name] == undefined) $scope.aMeetings[field_name] = [];
                var isChecked = ($scope.aMeetings[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        /*
            Function name: isRadioSelected
            Author(s): Reccion, Jeremy
            Date Modified: 2018/01/31
            Description: Check an option of the radio button if checked
            Parameter(s): field.name, html input type
            Return: none
        */
        $scope.isRadioSelected = function(field_name, option, type){
            if(type == 'radio'){
                if($scope.aMeetings[field_name] == undefined) $scope.aMeetings[field_name] = [];
                var isChecked = ($scope.aMeetings[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in add modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToAMeetings = function(fieldName, option){
            var checkedOption = document.getElementsByName(option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }
            $scope.aMeetings[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/26
            Description: Check all password inputs in edit modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushEditToAMeetings = function(fieldName, option){

            var checkedOption = document.getElementsByName('edit '+option);
            //console.log(option+' field is '+checkedOption.checked);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            $scope.aMeetings[fieldName] = selected['checkBoxAdd '+fieldName];
        };


        /*
            Function name: Add Meeting Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Adds New Meeting and Assigns a Temporary Password to the New Meeting
        */
        $scope.addMeeting = function(){
            
            $scope.showAddFlash = true;

            var requiredTextField=0;
            var forDataBase=0;


            for(var h in $scope.fields){
                if($scope.fields[h].required==true){
                    requiredTextField++;
                    if($scope.aMeetings[$scope.fields[h].name]===undefined){
                        FlashService.Error("Please input all the required fields");
                        break;
                    }else{
                        forDataBase++;
                    }
                }
            }
            if(!checkEmails()){
                FlashService.Error("Please Input valid email");
            }else if(!checkNumbers()){
                FlashService.Error("Please Input numbers only to number fields");
            }else if(!checkPasswords()){
                FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
            }else if(!checkConfirmPasswords()){
                FlashService.Error("Confirm password/s does not match");
            }else{
                if(forDataBase===requiredTextField){
                    console.log($scope.aMeetings);
                    console.log("hi");
                    $scope.showAddFlash = false;
                    MeetingService.addMeeting($scope.aMeetings)
                        .then(function () {
                            console.log("hello");
                            // user update start
                            for (var i = 0; i<(vm.user.length - 1);i++){
                                angular.forEach($scope.aMeetings, function(value, key){
                                    if (key == "BReader1"){
                                        angular.forEach(value, function(value2, key2){
                                            if (key2 == "student"){
                                                if(vm.user[i].username == value2){
                                                    console.log(vm.user[i].username);
                                                    vm.user[i].rotation_done = "Yes";
                                                    vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                    vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                    UserService.Update(vm.user[i]);
                                                }
                                            }
                                        })
                                    }
                                    if (key == "MAssign1"){
                                        angular.forEach(value, function(value2, key2){
                                            if (key2 == "student"){
                                                if(vm.user[i].username == value2){
                                                    vm.user[i].rotation_done = "Yes";
                                                    vm.user[i].last_assistant = value.assistant;
                                                    vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                    vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                    UserService.Update(vm.user[i]);
                                                }
                                            }
                                            if (key2 == "assistant"){
                                                if(vm.user[i].username == value2){
                                                    vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                    UserService.Update(vm.user[i]);
                                                }
                                            }
                                        })
                                    }
                                    if (key == "MAssign2"){
                                            angular.forEach(value, function(value2, key2){
                                                if (key2 == "student"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].rotation_done = "Yes";
                                                        vm.user[i].last_assistant = value.assistant;
                                                        vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                        vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                                if (key2 == "assistant"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                            })
                                        }
                                    if (key == "MAssign3"){
                                            angular.forEach(value, function(value2, key2){
                                                if (key2 == "student"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].rotation_done = "Yes";
                                                        vm.user[i].last_assistant = value.assistant;
                                                        vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                        vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                                if (key2 == "assistant"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                            })
                                        }
                                    if (key == "BReader2"){
                                            angular.forEach(value, function(value2, key2){
                                                if (key2 == "student"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].rotation_done = "Yes";
                                                        vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                        vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                            })
                                        }
                                    if (key == "SAssign1"){
                                            angular.forEach(value, function(value2, key2){
                                                if (key2 == "student"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].rotation_done = "Yes";
                                                        vm.user[i].last_assistant = value.assistant;
                                                        vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                        vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                                if (key2 == "assistant"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                            })
                                        }
                                    if (key == "SAssign2"){
                                            angular.forEach(value, function(value2, key2){
                                                if (key2 == "student"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].rotation_done = "Yes";
                                                        vm.user[i].last_assistant = value.assistant;
                                                        vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                        vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                                if (key2 == "assistant"){
                                                    if(vm.user[i].username == value2){
                                                        vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                        UserService.Update(vm.user[i]);
                                                    }
                                                }
                                            })
                                        }
                                    if (key == "SAssign3"){
                                        angular.forEach(value, function(value2, key2){
                                            if (key2 == "student"){
                                                if(vm.user[i].username == value2){
                                                    vm.user[i].rotation_done = "Yes";
                                                    vm.user[i].last_assistant = value.assistant;
                                                    vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                    vm.user[i].scheduled_assign = $scope.aMeetings.meeting_date;
                                                    UserService.Update(vm.user[i]);
                                                }
                                            }
                                            if (key2 == "assistant"){
                                                if(vm.user[i].username == value2){
                                                    vm.user[i].assistant_sched = $scope.aMeetings.meeting_date;
                                                    UserService.Update(vm.user[i]);
                                                }
                                            }
                                        })
                                    }
                                })
                                
                            }
                            // user update end
                                initController();
                                $('#myModal').modal('hide');
                                FlashService.Success('Meeting Added');
                                resetModalFlash();
                                resetAMeetings();
                            }).catch(function (error) {
                                $scope.showAddFlash = true;
                                FlashService.Error(error);
                            });
                            initController();    
                }
            }
        };

        /*
            Function name: Filter Table Row by Index
            Author(s): Flamiano, Glenn
            Date Modified: January 2018
            Description: Retrieve specific table row by index
            Parameter(s): all table rows, index
            Return: none
        */
        function filterIndexById(input, id) {
            var i=0, len=Object.size(input);
            for (i=0; i<len; i++) {
                if (input[i]._id == id) {
                    return input[i];
                }
            }
        }

        /*
            Function name: edit Meeting
            Author(s):
            Date Modified: January 2018
            Description: When meeting clicks edit on the table, the selected row $scope is copied to $scope.aMeetings
            Parameter(s): index
            Return: none
        */
        $scope.editMeeting = function(index){
            console.log($scope.allMeetings);
            console.log($scope.aMeetings);
            $scope.aMeetings = angular.copy(filterIndexById($scope.allMeetings, index));
            console.log($scope.aMeetings);
        };
		
		vm.cancelEdit = function() {
			
			$scope.aMeetings = {};			
			initController();
		}
		
		/*
            Function name: Update Meeting Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Update Meeting
        */
		vm.updateMeeting = function() {
            for (var i = 0; i<(vm.user.length - 1);i++){
                if ($scope.aMeetings.Main_Hall == 'Ok'){
                    if(vm.user[i].username == $scope.aMeetings.BReader1.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.MAssign1.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.MAssign2.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.MAssign3.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                }
                if ($scope.aMeetings.Second_Hall == 'Ok'){
                    if(vm.user[i].username == $scope.aMeetings.BReader2.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.SAssign1.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.SAssign2.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                    if(vm.user[i].username == $scope.aMeetings.SAssign3.student){
                        vm.user[i].rotation_done = 'No';
                        UserService.Update(vm.user[i]);
                    }
                }
            }
            $scope.aMeetings.Done = 'Cancelled';
            MeetingService.updateMeeting($scope.aMeetings)
                .then(function () {
                    initController();
                    $('#editModal').modal('hide');
                    FlashService.Success('Meeting Cancelled');
                }).catch(function (error) {
                    FlashService.Error(error);
                }); 
                resetAMeetings();
                resetModalFlash();
        }		
		
		/*
            Function name: Delete Meeting Function
            Author(s): Sanchez, Macku
            Date Modified: January 2018
            Description: Delet eMeeting
        */
		vm.deleteMeeting = function(index) {
			
			
			 var toDel = filterIndexById($scope.allMeetings, index);
        

            if (confirm("Are you sure to delete this meeting?")){
				
             MeetingService.Delete(toDel._id)
                 .then(function () {
					resetModalFlash();
                    FlashService.Success('Meeting Deleted');
                    socket.emit('meetingChange');
					 
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
            }
        }


        /*
            Name: enable edit
            Author(s):
                    Flamiano, Glenn
                    Reccion, Jeremy
            Date modified: 2018/03/06
            Descrption: set the values of certain scope variables. also initialize dropdown values if they are required
        */
        vm.enableEditing = function() {
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                //console.log($scope.aMeetings[value.name])
                //when editing, non existing property may be undefined or ''
                if(value.type == 'dropdown' && value.required && ($scope.aMeetings[value.name] == undefined || $scope.aMeetings[value.name] == '')){
                    $scope.aMeetings[value.name] = value.options[0];
                }
            });
        }

         vm.restart = function() {
            initController();
            resetAMeetings();
            resetModalFlash();
            $scope.showMainFlash = false;
        }

    }
 
})();