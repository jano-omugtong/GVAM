var express = require('express');
var router = express.Router();
var rotationService = require('services/rotation.service');

router.get('/all', getAllRotations);
router.post('/addRotation', addRotation);
router.put('/:_id', updateRotation);
router.delete('/:_id', deleteRotation);


module.exports = router;

function getAllRotations(req, res){
    rotationService.getAllRotations().then(function(rotations){
        if(rotations){
            res.send(rotations);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
function addRotation(req, res){
    rotationService.addRotation(req.body).then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function updateRotation(req, res){
    rotationService.updateRotation(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}

function deleteRotation(req, res) {
    var rotationId = req.params._id
 
    rotationService.delete(rotationId).then(function () {
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}