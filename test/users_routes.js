/**
 * Created by witmi on 14/05/2016.
 */
'use strict';
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var HttpStatus = require('http-status-codes');
var MongoClient = require('mongodb').MongoClient;


var user_1 = {
    "gender": "male",
    "name": {
        "title": "mr",
        "first": "brad",
        "last": "doyle"
    },
    "location": {
        "street": "4486 o'connell avenue",
        "city": "Cashel",
        "state": "pennsylvania",
        "zip": 82940
    },
    "email": "uniquemochaemail@example.com",
    "username": "uniquemochaname",
    "password": "badgirl",
    "salt": "X7ITc4QM",
    "md5": "f37f3abdf6acb1b5e8725f88e3aa2c1a",
    "sha1": "268fce7a95e4dd1987dded7d00c78857dbac6249",
    "sha256": "e3f8d87f5e4b81b4157fe6a286a2ffa765aec75ec6b7c7ae332f6979abea9488",
    "registered": 1063092194,
    "dob": 732421954,
    "phone": "051-574-8454",
    "cell": "081-866-2008",
    "PPS": "uniquemochapps",
    "picture": {
        "large": "https://randomuser.me/api/portraits/men/10.jpg",
        "medium": "https://randomuser.me/api/portraits/med/men/10.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/men/10.jpg"
    }
};
var token_user = {username: 'gimme', password: 'token'};
var db_url = (process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
var url = 'http://localhost:5000',
    token;

describe('hooks', function() {
    console.log('connecting to: ' + db_url);
    var server;
    before(function (done) {
        server = require('../app');

        MongoClient.connect(db_url).then(function (db) {
            db.collection('users').insertOne(token_user);
        }).then(function () {
            request(url)
                .post('/api/authenticate')
                .send({username: token_user.username, password: token_user.password})
                .end(function (err, res) {
                    token = res.body.token;
                    done();
                });
        });
    });

    after(function (done) {
        server.close();
        MongoClient.connect(db_url, function(err, db) {
            var col = db.collection('users');
            col.deleteMany({username: token_user.username}, function(err, r) {
            });
            col.deleteMany({username: user_1.username}, function(err, r) {
                db.close();
                done();
            });
        });
    });

    describe('User', function () {
        describe('Create', function () {
            it('should pass', function (done) {
                should(2).be.equal(2);
                done();
            });
            it('should return 201 creating user', function (done) {
                request(url)
                    .post('/api/users')
                    .set('x-access-token', token)
                    .send(user_1)
                    .end(function (err, res) {
                        if (err) throw err;
                        should(res).have.property('status', HttpStatus.CREATED);
                        done();
                    });
            });
            it('should return BAD_REQUEST along with deleted fields', function (done) {
                var bad_user = JSON.parse(JSON.stringify(user_1));
                delete bad_user.email;
                delete bad_user.phone;
                delete bad_user.location;
                delete bad_user.username;
                delete bad_user.PPS;

                request(url)
                    .post('/api/users')
                    .set('x-access-token', token)
                    .send(bad_user)
                    .expect('Content-Type', /json/)
                    .expect(HttpStatus.BAD_REQUEST)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        var keys = res.body.invalid_keys;
                        should(res).have.property('status', HttpStatus.BAD_REQUEST);
                        should(keys.location).containEql('invalid or missing');
                        should(keys.phone).containEql('invalid or missing');
                        should(keys.email).containEql('invalid or missing');
                        should(keys.username).containEql('invalid or missing');
                        should(keys.PPS).containEql('invalid or missing');
                        done();
                    });
            });
            it('should return BAD_REQUEST along with duplicate fields fields', function (done) {
                request(url)
                    .post('/api/users')
                    .set('x-access-token', token)
                    .send(user_1)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                    });
                request(url)
                    .post('/api/users')
                    .set('x-access-token', token)
                    .send(user_1)
                    .expect('Content-Type', /json/)
                    .expect(HttpStatus.BAD_REQUEST)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        var keys = res.body.invalid_keys;
                        should(keys.email).containEql('duplicate user');
                        should(keys.username).containEql('duplicate user');
                        should(keys.PPS).containEql('duplicate user');
                        done();
                    });
            });
        });
        describe('Search', function () {
            it('should return user matching email', function (done) {
                request(url)
                    .get('/api/users/find')
                    .set('x-access-token', token)
                    .query({'email': user_1.email})
                    .end(function (err, res) {
                        if (err) throw err;
                        var usr = res.body.user;
                        should(usr.email).be.equal(user_1.email);
                        should(usr.username).be.equal(user_1.username);
                        should(usr.PPS).be.equal(user_1.PPS);
                        done();
                    });
            });
            it('should return user matching username', function (done) {
                request(url)
                    .get('/api/users/find')
                    .set('x-access-token', token)
                    .query({'username': user_1.username})
                    .end(function (err, res) {
                        if (err) throw err;
                        var usr = res.body.user;
                        should(usr.email).be.equal(user_1.email);
                        should(usr.username).be.equal(user_1.username);
                        should(usr.PPS).be.equal(user_1.PPS);
                        done();
                    });
            });
            it('should return user matching pps no.', function (done) {
                request(url)
                    .get('/api/users/find')
                    .set('x-access-token', token)
                    .query({'pps': user_1.PPS})
                    .end(function (err, res) {
                        if (err) throw err;
                        var usr = res.body.user;
                        should(usr.email).be.equal(user_1.email);
                        should(usr.username).be.equal(user_1.username);
                        should(usr.PPS).be.equal(user_1.PPS);
                        done();
                    });
            });
        });
    });
});
