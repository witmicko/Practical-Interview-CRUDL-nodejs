/**
 * Created by witmi on 13/05/2016.
 */
"use strict";
var HttpStatus = require('http-status-codes');
var db = require('../lib/db')();
var validator = require('../lib/user_validator');

exports.index = function (req, res) {
    res.status(HttpStatus.OK).json({'hello': 'world'});
};

/*
    Creates new user, checks if there a duplicate entry and validates incoming data.
    Duplication would be much better handled by indexing db on chosen fields, but as per spec:
 4. Minimal scaffolding / auto code generation
    -- we want you to show your ability and creative side so please keep this to a minimum
 */
exports.create_user = function (req, res) {
    var new_user  = req.body,
        valid = validator.validate_user(new_user),
        invalid_keys = {};

    db.findByUsername(new_user.username).then(function (users) {
        if (users.length > 0) {
            invalid_keys.username = 'duplicate user';
        }
    }).then(function () {
        return db.findByEmail(new_user.email).then(function (users) {
            if (users.length > 0) {
                invalid_keys.email = 'duplicate user';
            }
        });
    }).then(function () {
        return db.findByPPS(new_user.PPS).then(function (users) {
            if (users.length > 0) {
                invalid_keys.PPS = 'duplicate user';
            }
        });
    }).then(function () {
        if (true !== valid || Object.keys(invalid_keys).length > 0) {
            Object.keys(valid).forEach(function (key) {
                invalid_keys[key] = "invalid or missing";
            });
            res.status(HttpStatus.BAD_REQUEST).json({'invalid_keys': invalid_keys});
        } else {
            db.createUser(new_user).then(function (data) {
                var objectID = {'objectID': data.ops[0]._id};
                res.status(HttpStatus.CREATED).json(objectID);
            });
        }
    });
};

exports.get_user_by = function (req, res) {
    var query = req.query,
        not_found = HttpStatus.NOT_FOUND,
        response = {'result': "User not found", 'query': query};

    if (query.email) {
        console.log('email');
        db.findByEmail(query.email).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json(user[0]);
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.username) {
        db.findByUsername(query.username).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json(user[0]);
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.pps) {
        db.findByPPS(query.pps).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json(user[0]);
            } else {
                res.status(not_found).json(response);
            }
        });
    }
};

exports.populate = function (req, res) {
    var result = db.resetData();
    if (result.err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    } else {
        res.status(HttpStatus.OK).json(result);
    }
};

exports.init = function () {
    db.connect().then(function (result) {
    }).then(function () {
        db.resetData();
    });
};