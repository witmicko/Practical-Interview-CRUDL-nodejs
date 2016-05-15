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
        db,
        id = 1;

    return {
        connect: function () {
            var url = (process.env.MONGODB_URI || 'mongodb://localhost:27017/test'),
                result;
            console.log('app db:', url);
            return MongoClient.connect(url).then(function (dbConnection) {
                db = dbConnection;
                result = "connected to " + url;
                this.get_meta_id();
            }).catch(function (err) {
                result = "connection failed to " + url;
            }).then(function () {
                return result;
            });
        },
        increment_id: function () {
            id += 1;
            db.collection('users.meta').findOneAndUpdate(
                {},
                {'$inc': {'curr_id': 1}}
            );
        },
        get_meta_id: function () {
            db.collection(META).find({}).toArray().then(function (doc) {
                id = doc[0].curr_id;
            });
        },
        create_user: function (user) {
            this.increment_id();
            user.id = id;
            return db.collection(USERS).insertOne(user);
        },
        get_all_users : function () {
            return db.collection(USERS).find({}).toArray();
        },
        get_user : function (id) {
            return db.collection(USERS).find({id: parseInt(id)}).toArray();
        },
        update_user: function (id, user) {
            user.id = id;
            return db.collection(USERS).findOneAndUpdate({id: parseInt(id)}, user).then(function (result) {
                console.log(result);
            });
        },
        find_by_username: function (username) {
            return db.collection(USERS).find({'username': username}).toArray();
        },
        find_by_email: function (email) {
            return db.collection(USERS).find({'email': email}).toArray();
        },
        find_by_PPS: function (pps) {
            return db.collection(USERS).find({'PPS': pps}).toArray();
        },
        delete_user: function (id) {
            return db.collection(USERS).removeMany({id: parseInt(id)});
        },
        delete_all: function () {
            db.collection(USERS).deleteMany({});
        },
        insert_all_from_file: function () {
            fs.readFileAsync('./data/users.json', 'utf8').then(function (data) {
                db.collection(META).removeMany({});
                var obj = JSON.parse(data);
                obj.curr_id = 1;
                obj.results.forEach(function (result) {
                    result.user.id = id;
                    id += 1;
                    db.collection(USERS).insertOne(result.user);
                });
                delete obj.results;
                obj.curr_id = id;
                db.collection(META).insertOne(obj);
            });
        },
        reset_data: function () {
            try {
                this.delete_all();
                this.insert_all_from_file();
                return {'reset': true};
            } catch (err) {
                return {'reset': true, 'err': err.message};
            }
        }
    };
};