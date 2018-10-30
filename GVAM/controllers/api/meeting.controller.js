var express = require('express');
var router = express.Router();
var meetingService = require('services/meeting.service');

router.get('/all', getAllMeetings);
router.post('/addMeeting', addMeeting);
router.put('/:_id', updateMeeting);
router.delete('/:_id', deleteMeeting);


module.exports = router;

function getAllMeetings(req, res){
    meetingService.getAllMeetings().then(function(meetings){
        if(meetings){
            res.send(meetings);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
function addMeeting(req, res){
    meetingService.addMeeting(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function updateMeeting(req, res){
    meetingService.updateMeeting(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function deleteMeeting(req, res) {
    var meetingId = req.params._id
 
    meetingService.delete(meetingId).then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}