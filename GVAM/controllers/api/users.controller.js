var config = require('config.json');
var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var userService = require('services/user.service');
 
// routes
router.get('/isAdmin', getAdminUser);
router.get('/all', getAllUsers);
router.get('/all/:gender', getAllByGender);
router.post('/authenticate', authenticateUser);
router.post('/accountOn', accountOn);       // added by dyan0
router.post('/addUser', addUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/:_id', getById);
router.put('/:_id', updateUser);
router.post('/uAll', updateAll);
router.delete('/:_id', deleteUser);
router.post('/upload', uploadPic);
router.put('/deleteProfilePic/:_id', deleteProfilePic);
 
module.exports = router;

/*
    Function name: User Controller Delete Profile Picture
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/08
    Update Date: 2018/03/08
    Description: current user parameters is received and sends it to backend service
    Parameter(s): request, response
    Return: response.status
*/
function deleteProfilePic(req, res) {
    userService.deleteProfilePic(req, res)
       .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/*
    Function name: User Controller Upload Picture
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Description: input file is received as req and uploadPic function from services/user.service.js
        is called to begin the upload using multer
    Parameter(s): request, response
    Return: response.status
*/
function uploadPic(req, res) {
    userService.uploadPic(req, res)
       .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllUsers(req, res) {
    userService.getAll(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllByGender(req, res) {
    userService.getAllByGender(req.params.gender)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
// added by dyan0
function accountOn(req, res) {
    userService.accountOn(req.body)
        .then(function (accountDBstat) {
            res.status(200).send(accountDBstat);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
// end of add - dyan0


function addUser(req, res) {
    userService.insert(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.insert(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 

function getById(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/*
    Function name: User Controller Get Admin User
    Author(s): Flamiano, Glenn
    Date Modified: 2018/03/01
    Description: Determines if user is admin or not
    Parameter(s): none
    Return: none
*/
function getAdminUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if(user) {
                if (user.role == 'Admin') {
                    res.send(true);
                } else {
                    res.send(false);
                }
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function updateUser(req, res) {
    var userId = req.params._id
 
    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateAll(req, res) {
 
    userService.updateAll()
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function deleteUser(req, res) {
    var userId = req.params._id;
 
 
    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}