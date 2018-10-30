var config = require('config.json');
var Q = require('q');
var _ = require('lodash');
//var mongoose = require('mongoose');
//var Device = mongoose.model('Device');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('meetings');

var service = {};

service.getAllMeetings = getAllMeetings;
service.addMeeting = addMeeting;
service.updateMeeting = updateMeeting;
service.delete = _delete;

module.exports = service;

function getAllMeetings(){
    var deferred = Q.defer();
    db.meetings.find({}).toArray(function(err, meetings) {
        if(err) deferred.reject(err);

        //if documents are present
        if(meetings.length > 0) {
            deferred.resolve(meetings);
        }

        //empty collection
        else{
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function addMeeting(meetingParam){

    var deferred = Q.defer();

    db.meetings.findOne(
        { meeting_date : meetingParam['meeting_date'] },
        function (err, meeting) {
            if (err) deferred.reject(err);
 
            if (meeting) {
                deferred.reject('Meeting date "' + meetingParam['meeting_date'] + '" is already taken');
            } else {
                insertMeeting();
            }
    });

    function insertMeeting(){
        db.meetings.insert(meetingParam, function(err){
            if (err) deferred.reject(err);
            deferred.resolve();
        });
            
        return deferred.promise;
    }
    return deferred.promise;
}

function updateMeeting(_id, meetingParam){
    
        var deferred = Q.defer();
        
        var set = _.omit(meetingParam, '_id');
    
        db.meetings.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });
    
        return deferred.promise;
    }

function _delete(_id) {
    var deferred = Q.defer();
 
    db.meetings.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
