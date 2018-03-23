var config = require('config.json');
var Q = require('q');
var _ = require('lodash');
//var mongoose = require('mongoose');
//var Device = mongoose.model('Device');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('rotations');

var service = {};

service.getAllRotations = getAllRotations;
service.addRotation = addRotation;
service.updateRotation = updateRotation;
service.delete = _delete;

module.exports = service;

function getAllRotations(){
    var deferred = Q.defer();
    db.rotations.find({}).toArray(function(err, rotations) {
        if(err) deferred.reject(err);

        //if documents are present
        if(rotations.length > 0) {
            deferred.resolve(rotations);
        }

        //empty collection
        else{
            deferred.resolve([]);
        }
    });

    return deferred.promise;
}

function addRotation(rotationParam){

    var deferred = Q.defer();

    db.rotations.findOne(
        { rotation_id : rotationParam['rotation_id'] },
        function (err, rotation) {
            if (err) deferred.reject(err);
 
            if (rotation) {
                deferred.reject('Rotation_id "' + rotationParam['rotation_id'] + '" is already taken');
            } else {
                insertRotation();
            }
    });

    function insertRotation(){
        db.rotations.insert(rotationParam, function(err){
            if (err) deferred.reject(err);
            deferred.resolve();
        });
            
        return deferred.promise;
    }
    return deferred.promise;
}

function updateRotation(_id, rotationParam){
    
        var deferred = Q.defer();
        
        var set = _.omit(rotationParam, '_id');
    
        db.rotations.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function(err){
            if(err) {
               deferred.reject(err);
            }
            deferred.resolve();
        });
    
        return deferred.promise;
    }

function _delete(_id) {
    var deferred = Q.defer();
 
    db.rotations.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}
