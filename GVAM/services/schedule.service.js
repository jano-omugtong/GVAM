var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser:true});
db.bind('schedule');

var service = {};

service.getAll = getAll;
service.addSchedule = addSchedule;
service.updateSchedule = updateSchedule;
service.delete = _delete;

module.exports = service;
/*
        Function name: get all Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for getting all Schedule
        Parameter(s): none
        Return: none
    */
function getAll(){
    //imitate angular promise. start by initializing this
    var deferred = Q.defer();

   // Schedule.find({}, {__v: false}, function(err, Schedule)
   //need to use toArray() when using find({})
   db.schedule.find({}).toArray(function(err, schedule){
        //console.log('schedule.service');
        //standard error
        //reject means error status is sent as response
        if(err) deferred.reject(err);

        //if documents are present
        //console.log(schedule);
        if(schedule.length > 0) {
            //resolve means ok status is sent as response
            deferred.resolve(schedule);
        }
        //empty collection
        else{
            //respond with an empty object
            deferred.resolve([]);
        }
    });

    //return the promise along with either resolve or reject
    return deferred.promise;
}
/*
        Function name: add Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for adding an Schedule
        Parameter(s): scheduleParam (object)
        Return: none
    */
function addSchedule(scheduleParam){
    var deferred = Q.defer();
    
    //check for duplicate 'schedule_tag' s
	 db.schedule.findOne({ schedule_date: scheduleParam['schedule_date'] },
        function (err, schedule) {
            if (err) deferred.reject(err);
 
            if (schedule) {
                deferred.reject('Tag already exists');
            } else {
                //if no duplicates, insert to database
                 db.schedule.insert(scheduleParam, function(err){
					if (err) deferred.reject(err);
					deferred.resolve();
				});
            }
    });


    // Schedule.create(scheduleParam, function(err){
        // if (err) deferred.reject(err);
        // console.log(err)
        // deferred.resolve();
    // });
        
    return deferred.promise;
}
/*
        Function name: update Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service for updating an Schedule
        Parameter(s): _id (String), scheduleParam (object)
        Return: none
    */
function updateSchedule(_id, scheduleParam){
	
	   var deferred = Q.defer();
        
       //remove the '_id' property from the object
		var set = _.omit(scheduleParam, '_id');
	

            //use mongo.helper.toObjectID() when using '_id' in queries
            // use $set to apply changes while retaining existing information in the database
            //not using $set and passing an object to update() 's second parameter will rewrite the whole document
                 db.schedule.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
					if(err) {
						deferred.reject(err);
						console.log(err);
					}
				
					deferred.resolve();
				});
            
        
        return deferred.promise;
    
      
    }

    /*
        Function name: delete Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: service function for adding an Schedule
        Parameter(s): 
        Return: none
    */
function _delete(_id) {
    var deferred = Q.defer();
 
     db.schedule.remove(
        { _id:mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
