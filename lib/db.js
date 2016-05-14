/**
 * Created by witmi on 13/05/2016.
 */
'use strict';
var Bluebird    = require("bluebird");
var MongoClient = Bluebird.promisifyAll(require('mongodb').MongoClient);
var fs          = Bluebird.promisifyAll(require("fs"));

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
        createUser: function (user) {
            return db.collection(USERS).insertOne(user);

        },
        deleteAll: function () {
            db.collection(USERS).deleteMany();
        },
        insertAllFromFile: function () {
            fs.readFileAsync('./data/users.json', 'utf8').then(function (data) {
                db.collection(USERS).deleteMany();
                var obj = JSON.parse(data);
                obj.results.forEach(function (result) {
                    db.collection(USERS).insertOne(result.user);
                });
                delete obj.results;
                db.collection(META).insertOne(obj);
            });
        },
        resetData: function () {
            try {
                this.deleteAll();
                this.insertAllFromFile();
                return {'reset': true};
            } catch (err) {
                console.log(err);
                return {'reset': true, 'err': err.message};
            }
        }
    };
};