/**
 * Created by witmi on 13/05/2016.
 */
'use strict';
var bluebird = require("bluebird");
var MongoClient = bluebird.promisifyAll(require('mongodb').MongoClient);
var fs          = bluebird.promisifyAll(require("fs"));

var assert   = require('assert');
var ObjectId = require('mongodb').ObjectID;


module.exports = function () {
    var USERS = 'users',
        META = 'users.meta',
        db;

    return {
        connect: function () {
            var url = (process.env.MONGODB_URI || 'mongodb://localhost:27017/test'),
                result;

            return MongoClient.connect(url).then(function (dbConnection) {
                db = dbConnection;
                result = "connected to " + url;
            }).catch(function (err) {
                result = "connection failed to " + url;
            }).then(function () {
                return result;
            });
        },
        getUser: function () {
            db.findOne();
            return "getUser.";
        },
        resetData: function () {
            var obj;
            fs.readFileAsync('./data/users.json', 'utf8').then(function (data) {
                db.collection(USERS).deleteMany();
                obj = JSON.parse(data);
                obj.results.forEach(function (result) {
                    db.collection(USERS).insertOne(result.user);
                });
                delete obj.results;
                db.collection(META).insertOne(obj);
            });
        }
    };
};