/**
 * Created by witmi on 13/05/2016.
 */
'use strict';
var bluebird = require("bluebird");
var MongoClient = bluebird.promisifyAll(require('mongodb').MongoClient);
// var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;


module.exports = function () {
    var USERS_COLLECTION = 'users',
        db;

    return {
        connect: function () {
            var url = (process.env.MONGODB_URI || 'mongodb://localhost:27017/test'),
                result;

            return MongoClient.connect(url).then(function (dbConnection) {
                db = dbConnection;
                result = "yay";
            }).catch(function (err) {
                result = "nay";
            }).then(function () {
                // console.log(result);
                return result;
            });
        },
        getUser: function () {
            return "getUser.";
        }
    };
};