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

exports.createUser = function (req, res) {
    var user  = req.body,
        valid = validator.validate_user(user);

    if (true === valid) {
        db.createUser(user).then(function (data) {
            var objectID = {'objectID': data.ops[0]._id};
            res.status(HttpStatus.CREATED).json(objectID);
        });
    } else {
        var invalid_keys = [];
        Object.keys(valid).forEach(function (key) {
            invalid_keys.push(key);
        });
        res.status(HttpStatus.BAD_REQUEST).json({'invalid_keys': invalid_keys});
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
        console.log(result);
    });
};