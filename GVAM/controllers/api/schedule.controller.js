var express = require('express');
var router = express.Router();
var scheduleService = require('services/schedule.service');

//declare all routes that are to be called from client (angular)
router.get('/getAll', getAllSchedule);
router.post('/addSchedule', addSchedule);
router.put('/:_id', updateSchedule);
router.delete('/:_id', deleteSchedule);


module.exports = router;
/*
        Function name: get all Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: getter function for retrieving all Schedule
        Parameter(s):
        Return: none
    */
function getAllSchedule(req, res){
    scheduleService.getAll().then(function(schedule){
        //console.log('schedule.controller');
        //console.log(schedule);
        if(schedule){
            res.send(schedule);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
/*
        Function name: add Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for adding an Schedule
        Parameter(s): 
        Return: none
    */
function addSchedule(req, res){
    scheduleService.addSchedule(req.body).then(function(){

            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/*
        Function name: update Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for updating an Schedule
        Parameter(s): 
        Return: none
    */
function updateSchedule(req, res){
    scheduleService.updateSchedule(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}
/*
        Function name: delete Schedule
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for deleting an Schedule
        Parameter(s): 
        Return: none
    */
function deleteSchedule(req, res) {
    var scheduleId = req.params._id
 
 
    scheduleService.delete(scheduleId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}