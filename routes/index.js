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

    db.find_by_username(new_user.username).then(function (users) {
        if (users.length > 0) {
            invalid_keys.username = 'duplicate user';
        }
    }).then(function () {
        return db.find_by_email(new_user.email).then(function (users) {
            if (users.length > 0) {
                invalid_keys.email = 'duplicate user';
            }
        });
    }).then(function () {
        return db.find_by_PPS(new_user.PPS).then(function (users) {
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
            db.create_user(new_user).then(function (data) {
                var id = {'id': data.ops[0].id};
                res.status(HttpStatus.CREATED).json(id);
            });
        }
    });
};

/*
    Simple find by: email, username, pps no. needs exact match to work
 */
exports.get_user_by = function (req, res) {
    var query = req.query,
        not_found = HttpStatus.NOT_FOUND,
        response = {'result': "User not found", 'query': query};
    if (query.email) {
        db.find_by_email(query.email).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.username) {
        db.find_by_username(query.username).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.pps) {
        db.find_by_PPS(query.pps).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    }
};

exports.get_all_users = function (req, res) {
    db.get_all_users().then(function (users) {
        res.status(HttpStatus.OK).json(users);
    });
};

exports.get_user = function (req, res) {
    db.get_user(req.params.id).then(function (arr) {
        if (arr.length === 0) {
            res.status(HttpStatus.NOT_FOUND).json({id: req.params.id + " Not found"});
        } else if (arr.length > 1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({id: req.params.id + " multiple users with the same id"});
        } else {
            res.status(HttpStatus.OK).json(arr[0]);
        }
    });
};

exports.populate = function (req, res) {
    var result = db.reset_data();
    if (result.err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    } else {
        res.status(HttpStatus.OK).json(result);
    }
};

exports.init = function () {
    db.connect().then(function (result) {
    }).then(function () {
        db.reset_data();
    });
};