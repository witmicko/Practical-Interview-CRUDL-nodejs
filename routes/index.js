/**
 * Created by witmi on 13/05/2016.
 */
"use strict";

var db = require('../lib/db')();

exports.index = function (req, res) {
    res.status(200).json({'hello': 'world'});
};

exports.createUser = function (req, res) {
    res.status(200).json({'hello': 'world'});
};

exports.populate = function (req, res) {
    var obj = db.resetData();
    res.status(200).json(obj);
};

exports.init = function () {
    db.connect().then(function (result) {
        console.log(result);
    });
};