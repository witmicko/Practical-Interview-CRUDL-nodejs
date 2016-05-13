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
            console.log(data);
            var jj = {'result': data.result, 'user': data.ops[0]};
            res.status(HttpStatus.CREATED).json(jj);
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
    var obj = db.resetData();
    res.status(HttpStatus.OK).json(obj);
};

exports.init = function () {
    db.connect().then(function (result) {
        console.log(result);
    });
};