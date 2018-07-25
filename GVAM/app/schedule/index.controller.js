/*
    Name: Schedule Controller
    Date Created: 01/03/2018
    Author(s): Ayala, Jenny
               Flamiano, Glenn
               Omugtong, Jano
               Reccion, Jeremy
    
 */

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Schedule.IndexController', Controller)
        /*
            Function name: Custom pagination filter
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: removes schedule from the table after the start index
            Parameter(s): none
            Return: Array
        */
        .filter('pagination', function(){
            return function(data, start){
                //data is an array. slice is removing all items past the start point
                return data.slice(start);
            };
        });
 
    function Controller($window, ScheduleService, FlashService, $scope, $interval, $filter, socket, FieldsService, $stateParams, RotationService, UserService) {
 
        /* Initialization of scope variables */
		
		$scope.loading = true;

        //schedule variables
        $scope.newSchedule = {};
        $scope.schedule = [];
        $scope.type = "add";
		$scope.isNull = false;
		$scope.readOnly = true;

        //fields variable
        $scope.fields = [];
        $scope.fieldsUsr = [];


        //for filtersearch publishers
        

        //pagination variables
        $scope.currentPage = 1;
        $scope.pageSize = 10;

        //sort variables
        $scope.reverse = true;
        $scope.sortColumn = "schedule_date";

        //filter/search variables
        $scope.searchColumn = "";
        $scope.searchDate = null;
        $scope.search = {};
        $scope.filtered_Schedule = {};
        //$scope.format = "yyyy-MM-dd";

        //CSV variables
        $scope.reportColumns = [];

        //confirm passwords all inputs
        $scope.confirmPassword = {};


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
        }
        resetModalFlash();
		
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
        
        /*
            Function name: Get All fields
            Author(s):  Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: gets all fields to be used in Schedule Page
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
        
		  FieldsService.GetAll("schedule").then(function(response){
				$scope.fields = response.fields;
                $scope.id = response._id;
				$scope.fieldsLength = Object.size(response.fields);
								
			}).catch(function(err){
				alert(err.msg_error);
            });
        };
        

        //call this function to get all fields when Schedule page is loaded
        getAllFields();


        //check if the url has schedule_tag parameter. this is executed upon loading of Schedule page
        if($stateParams.schedule_date){
            //console.log('schedule_date query', $stateParams.schedule_date)
            $scope.searchColumn = 'schedule_date';
            $scope.search['schedule_date'] = $stateParams.schedule_date;

            //forcibly remove modal backdrop when moving from warehouse modal to Schedule page via link
            //since there is no flag to determine if a modal is open, this will always execute
            $('.modal-backdrop').hide();
        }
		
        
        /*
            Function name: Sorting - sorted column and order
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: sets the column to be sorted and its order
            Parameter(s): column (String)
            Return: none
        */
        $scope.setTo = function(column){

            //when switching columns, sort in ascending order.
            $scope.reverse = (column != $scope.sortColumn) ? false : !$scope.reverse;
            $scope.sortColumn = column;  
        };

        /*
            Function name: Sort Class
            Author(s): Flamiano, Glenn
            Date Modified: December 2018
            Description: To change column sort arrow UI when user clicks the column
            Parameter(s): column
            Return: none
        */
        $scope.sortClass = function(column){
            if($scope.sortColumn == column){
                if($scope.reverse){
                    return 'arrow-down'; 
                }else{
                    return 'arrow-up';
                }
            }else{
                return 'arrow-dormant';
            }
        }; 
        ////////////////////////////////////////////////////////
        /*
            Function name: $watch functions for sort & search
            Author(s): Reccion, Jeremy
            Date Modified: 02/13/2018
            Description: when specific scope variables change, it filters and sorts the table in html
            Paramter(s): none
            Return: none
        */
        //var counter = 0;
        $scope.$watch('searchDate', function(){
            //valid date format (from datepicker)
            if($scope.searchDate != null && $scope.searchDate != undefined){
                $scope.search['updated_date'] = $filter('date')(new Date($scope.searchDate), "yyyy-MM-dd");
            }
            //to avoid emptying the schedule when the datepicker has no value
            else if($scope.searchDate == null){
                delete $scope.search['updated_date'];
            }
        });
        $scope.$watchGroup(['sortColumn', 'reverse'], function(){evalSchedule();});
        $scope.$watchCollection('schedule', function(){evalSchedule();});
        $scope.$watchCollection('search', function(){evalSchedule();});


        function evalSchedule(){
            //console.log('Times evalSchedule() was fired: ', counter++);
            //call $eval to execute search and sort commands
            $scope.filtered_schedule = $scope.$eval("schedule | filter: search | orderBy: sortColumn : reverse ");
        }
        ////////////////////////////////////////////////////////

        // get realtime changes
        socket.on('scheduleChange', function(){
            getAllSchedule();
        });

        /*
            Function name: Get all Schedule
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: retrieves all Schedule from the database
            Paramter(s): none
            Return: none
        */
        function getAllSchedule(){
            //get all Schedule
            ScheduleService.GetAll().then(function(schedule){
                if(schedule.length > 0){               
                    //store to array
                    $scope.schedule = schedule;
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

        /*
            Function name: getAllWH
            Author(s): Ayala, Jenny
			Date modified: 2-6-2018
			Description: get all data for rotation
		*/
		function getAllRotation() {
            RotationService.getAllRotations().then(function (rotation) {
                $scope.rotations = rotation;
                $scope.rotationLength = Object.size(rotation);
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

        //get all Schedule & rotations when controller is first loaded
        getAllSchedule();
        getAllRotation();
        getAllUsers()

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
            Description: To iformat a date and to be inserted to Schedule scope
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
            Function name: Insert formatted date to Selected scope
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to Schedule scope
            Parameter(s): none
            Return: none
        */
        $scope.pushDateToASchedule = function(fieldName, inputDate) {
            $scope.newSchedule[fieldName] = formatDate(inputDate);
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
                if(myRows[i].value != ''){
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
            //for add/edit checkboxes
            checkboxFields = document.getElementsByName("checkBoxInput");
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
            }
        };

        /*
            Function name: Insert radio button value to $scope.aUsers
            Author(s): Flamiano, Glenn
            Date Modified: February 2018
            Description: To insert radio button value to $scope.aUsers, it is called
                when radio button is checked
            Parameter(s): option, fieldName
            Return: none
        */
        $scope.putToModel = function(option, fieldName){
            //console.log(option);
            $scope.newSchedule[fieldName] = option;
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
                    if($scope.confirmPassword[currentField.name] == undefined){
                        $scope.confirmPassword[currentField.name] = '';
                    }
                    if($scope.newSchedule[currentField.name] != $scope.confirmPassword[currentField.name]){
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
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.isChecked = function(field_name, option, type){
            if(type == 'checkbox'){
                //console.log(type);
                if($scope.newSchedule[field_name] == undefined) $scope.newSchedule[field_name] = [];
                var isChecked = ($scope.newSchedule[field_name].indexOf(option) != -1) ? true : false;
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
                //console.log(type);
                if($scope.newSchedule[field_name] == undefined) $scope.newSchedule[field_name] = [];
                var isChecked = ($scope.newSchedule[field_name].indexOf(option) != -1) ? true : false;
                return isChecked;
            }
        };

        /*
            Function name: Insert checkbox checked values to
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/31
            Description: Check all password inputs in add modal
            Parameter(s): field.name, checkbox element
            Return: none
        */
        $scope.pushToASchedule = function(fieldName, option){
            var checkedOption = document.getElementsByName(option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            $scope.newSchedule[fieldName] = selected['checkBoxAdd '+fieldName];
        };

        /*$scope.pushEditToASchedule = function(fieldName, option){
            //console.log('pushed '+fieldName+' '+option);
            //selected.push(option);

            var checkedOption = document.getElementById('edit '+option);
            //console.log(option+' field is '+checkedOption.checked);
            if(checkedOption.checked){
                selected.push(option);
            }else{
                selected.remove(option);
            }

            //console.log('Selected options', selected);
            $scope.newSchedule[fieldName] = selected;
        };*/

        /*
            Function name: Schedule - add
            Author(s):  Flamiano, Glenn
                        Reccion, Jeremy
            Date Modified: 2018/03/06
            Description: performs validation when adding an Schedule. Serves also has function to toggle readonly property
            Paramter(s): none
            Return: none
        */
        $scope.addOrUpdateSchedule = function(){
            console.log($scope.newSchedule);
			if($scope.type == "add"){
				for (var i = 0; i < $scope.fieldsLength; i++){
                    if ($scope.newSchedule[$scope.fields[i].name] == undefined){
                        if($scope.fields[i].required){
                            $scope.isNull = true;
                        }
                        else{
                            $scope.newSchedule[$scope.fields[i].name] = "";
                        }
                    }
                }

				if($scope.isNull) {
                    $scope.showAddFlash = true;
				    FlashService.Error('Please fill up the required textfields');
				    //$scope.newSchedule = {};
				    $scope.isNull = false;
				} else {
                    $scope.showAddFlash = true;
                    if(!checkEmails()){
                        FlashService.Error("Please Input valid email");
                    }else if(!checkNumbers()){
                        FlashService.Error("Please Input numbers only to number fields");
                    }else if(!checkPasswords()){
                        FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error("Confirm password/s does not match");
                    }else{
                        $scope.newSchedule.created_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                        $scope.newSchedule.updated_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");                        
                        ScheduleService.addSchedule($scope.newSchedule).then(function(){
                        for (var i = 0; i<(vm.user.length - 1);i++){
                            angular.forEach($scope.newSchedule, function(value, key){
                                if (value == "BReader1"){
                                    angular.forEach(value, function(value2, key2){
                                        if (key2 == "student"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].rotation_done = "Yes";
                                                vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                    })
                                }
                                if (value == "MAssign1"){
                                    angular.forEach(value, function(value2, key2){
                                        if (key2 == "student"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].rotation_done = "Yes";
                                                vm.user[i].last_assistant = value.assistant;
                                                vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                    })
                                }
                            if (value == "BReader2"){
                                    angular.forEach(value, function(value2, key2){
                                        if (key2 == "student"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].rotation_done = "Yes";
                                                vm.user[i].last_assign = vm.user[i].scheduled_assign;
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
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
                                                vm.user[i].scheduled_assign = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                        if (key2 == "assistant"){
                                            if(vm.user[i].username == value2){
                                                vm.user[i].assistant_sched = $scope.newSchedule.schedule_date;
                                                UserService.Update(vm.user[i]);
                                            }
                                        }
                                    })
                                }
                            })
                            
                        }
                        //  get all schedule to refresh the table
                        $('#myModal').modal('hide');
                        FlashService.Success('Schedule Added');
                        $scope.newSchedule = {};
                        socket.emit('scheduleChange');
                        
                        resetModalFlash();
                        })
                        .catch(function(error){
                            FlashService.Error(error);
                        });
                    }
                    $scope.confirmPassword = {};
				}
			} else {
                $scope.readOnly = false;					
                //this is to initialize dropdowns that were added after adding Schedule
                //loop the fields to initialize value of a dropdown to the first item of its options if it is undefined
                angular.forEach($scope.fields, function(value, key){
                    //initialize if the dropdown is required
                    //console.log($scope.newSchedule[value.name]);
                    //when editing, non existing property may be undefined or ''
                    if(value.type == 'dropdown' && value.required && ($scope.newSchedule[value.name] == ''|| $scope.newSchedule[value.name] == undefined)){
                        //for location, the options are rotation_id
                        if(value.name == 'location'){
                            $scope.newSchedule['location'] = $scope.rotations[0].rotation_id;
                        }
                        else{
                            $scope.newSchedule[value.name] = value.options[0];
                        }
                    }
                });
			}
          
        };
		
		
		
		 $scope.saveUpdate = function(){
			for (var i = 0; i < $scope.fieldsLength; i++){
                //console.log($scope.newSchedule[$scope.fields[i].name]);
				if ($scope.newSchedule[$scope.fields[i].name] == undefined){
                    if($scope.fields[i].required){
                        $scope.isNull = true;
                        break;
                    }
                    else{
                        $scope.newSchedule[$scope.fields[i].name] = "";
                    }
				}
			}
			
			if($scope.isNull) {
                    $scope.showAddFlash = true;
					FlashService.Error('Please fill up the required textfields');
					//$scope.newSchedule = {};
					$scope.isNull = false;
					
			} else {
                    $scope.showAddFlash = true;
                    if(!checkEmails()){
                        FlashService.Error("Please Input valid email");
                    }else if(!checkNumbers()){
                        FlashService.Error("Please Input numbers only to number fields");
                    }else if(!checkPasswords()){
                        FlashService.Error("Passwords should contain lowercase, uppercase, numbers and at least 8 characters");
                    }else if(!checkConfirmPasswords()){
                        FlashService.Error("Confirm password/s does not match");
                    }else{
                        $scope.newSchedule.updated_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");                        
                            ScheduleService.updateSchedule($scope.newSchedule).then(function(){
                                for (var i = 0; i<(vm.user.length - 1);i++){
                                    var exist = false;
                                    if ($scope.newSchedule.schedule_date == vm.user[i].scheduled_assign){
                                        if ($scope.newSchedule.Main_Hall == "Ok"){
                                            if ($scope.newSchedule.BReader1.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.MAssign1.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.MAssign2.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.MAssign3.student == vm.user[i].username)
                                                exist = true;
                                        }
                                        if ($scope.newSchedule.Second_Hall == "Ok"){
                                            if ($scope.newSchedule.BReader2.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.SAssign1.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.SAssign2.student == vm.user[i].username)
                                                exist = true;
                                            else if ($scope.newSchedule.SAssign3.student == vm.user[i].username)
                                                exist = true;
                                        }
                                        
                                        if (!exist){
                                            vm.user[i].scheduled_assign = "";
                                            vm.user[i].rotation_done = "No";
                                            UserService.Update(vm.user[i]);
                                        }
                                    }
                                    if ($scope.newSchedule.schedule_date == vm.user[i].assistant_sched){
                                        if ($scope.newSchedule.Main_Hall == "Ok"){
                                            if ($scope.newSchedule.MAssign1.assistant){
                                                if ($scope.newSchedule.MAssign1.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                            if ($scope.newSchedule.MAssign2.assistant){
                                                if ($scope.newSchedule.MAssign2.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                            if ($scope.newSchedule.MAssign3.assistant){
                                                if ($scope.newSchedule.MAssign3.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                        }
                                        if ($scope.newSchedule.Second_Hall == "Ok"){
                                            if ($scope.newSchedule.SAssign1.assistant){
                                                if ($scope.newSchedule.SAssign1.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                            if ($scope.newSchedule.SAssign2.assistant){
                                                if ($scope.newSchedule.SAssign2.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                            if ($scope.newSchedule.SAssign3.assistant){
                                                if ($scope.newSchedule.SAssign3.assistant == vm.user[i].username)
                                                exist = true;
                                            }
                                        }
                                        if (!exist) {
                                            vm.user[i].assistant_sched = "";
                                            UserService.Update(vm.user[i]);
                                        }
                                    }
                                }
                            $('#myModal').modal('hide');
                            FlashService.Success('Schedule Updated');
                            $scope.newSchedule = {};
                            socket.emit('scheduleChange');
                            
                            resetModalFlash();
                        })
                        .catch(function(error){
                            FlashService.Error(error);
                        });
                    }
                    $scope.confirmPassword = {};
			} 
        };

        /*
            Function name: Schedule - edit
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: sets the schedule to be edited
            Paramter(s): schedule (Object)
            Return: none
        */
        $scope.editModal = function(schedule){
			$scope.readOnly = true;
            $scope.type = "edit";

            //copy instead of assigning to new schedule to avoid binding (changes text as you type)
            angular.copy(schedule, $scope.newSchedule);
        };

        /*
            Function name: Modal - reset scope variables
            Author(s): Reccion, Jeremy
            Date Modified: 03/06/2018
            Description: initialize scope variables when adding a new schedule
            Paramter(s): none
            Return: none
        */
        $scope.resetModal = function(){
            $scope.type = "add";
            $scope.newSchedule = {};
            selected = [];

            //loop the fields to initialize value of a dropdown to the first item of its options
            angular.forEach($scope.fields, function(value, key){
                //initialize if the dropdown is required
                if(value.type == 'dropdown' && value.required){
                    //for location, the options are rotation_id
                    if(value.name == 'rotation_id'){
                        $scope.newSchedule['rotation_id'] = $scope.rotations[0].rotation_id;
                    }
                    else{
                        $scope.newSchedule[value.name] = value.options[0];
                    }
                }
            });
        };		

        /*
            Function name: Schedule - delete
            Author(s): Reccion, Jeremy
            Date Modified: 01/29/2018
            Description: deletes schedule from the database
            Paramter(s): schedule (Object)
            Return: none
        */
		$scope.deleteSchedule = function(schedule) {
            
            if (confirm("Are you sure to delete schedule " + schedule['schedule_date'] + "?")){
				ScheduleService.Delete(schedule._id).then(function () {
                    resetModalFlash();
                    FlashService.Success('Schedule Deleted');
                    socket.emit('scheduleChange');
                })
                .catch(function(error){
                    FlashService.Error(error);
                });
            }
        };

        $scope.restart = function() {
            resetModalFlash();
            $scope.showMainFlash = false;
        }

        
    };

    
})();