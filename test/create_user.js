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


describe('User', function () {
    before(function () {
        console.log('removing user');
        MongoClient.connect('mongodb://localhost:27017/test').then(function (db) {
            db.collection('users').removeMany({'username': user_1.username});
            done();
        });
    });

    var url = 'http://localhost:5000';

    describe('Create', function () {
        it('should pass', function (done) {
            should(2).be.equal(2);
            done();
        });
        it('should return 201 creating user', function (done) {
            request(url)
                .post('/api/createUser')
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
                .post('/api/createUser')
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
                .post('/api/createUser')
                .send(user_1)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                });
            request(url)
                .post('/api/createUser')
                .send(user_1)
                .expect('Content-Type', /json/)
                .expect(HttpStatus.BAD_REQUEST)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    var keys = res.body.invalid_keys;
                    console.log(keys);
                    // should(res).have.property('status', HttpStatus.BAD_REQUEST);
                    // should(keys.location).containEql('invalid or missing');
                    // should(keys.phone).containEql('invalid or missing');
                    // should(keys.email).containEql('invalid or missing');
                    done();
                });
        });
    });
});