/**
 * Created by witmi on 14/05/2016.
 */
'use strict';
var should = require('should');
var assert = require('assert');
var request = require('supertest');

var user_1 = {
    "gender" : "male",
    "name" : {
        "title" : "mr",
        "first" : "brad",
        "last" : "doyle"
    },
    "location" : {
        "street" : "4486 o'connell avenue",
        "city" : "Cashel",
        "state" : "pennsylvania",
        "zip" : 82940
    },
    "email" : "brad.doyle@example.com",
    "username" : "smallduck162",
    "password" : "badgirl",
    "salt" : "X7ITc4QM",
    "md5" : "f37f3abdf6acb1b5e8725f88e3aa2c1a",
    "sha1" : "268fce7a95e4dd1987dded7d00c78857dbac6249",
    "sha256" : "e3f8d87f5e4b81b4157fe6a286a2ffa765aec75ec6b7c7ae332f6979abea9488",
    "registered" : 1063092194,
    "dob" : 732421954,
    "phone" : "051-574-8454",
    "cell" : "081-866-2008",
    "PPS" : "6168927T",
    "picture" : {
        "large" : "https://randomuser.me/api/portraits/men/10.jpg",
        "medium" : "https://randomuser.me/api/portraits/med/men/10.jpg",
        "thumbnail" : "https://randomuser.me/api/portraits/thumb/men/10.jpg"
    }
};

describe('Routing', function () {
    var url = 'http://localhost:5000';
    describe('User', function () {
        it('should return 201 creating user', function (done) {
            var profile = {
                username: 'vgheri',
                password: 'test',
                firstName: 'Valerio',
                lastName: 'Gheri'
            };
            // once we have specified the info we want to send to the server via POST verb,
            // we need to actually perform the action on the resource, in this case we want to
            // POST on /api/profiles and we want to send some info
            // We do this using the request object, requiring supertest!
            request(url)
                .post('/api/profiles')
                .send(profile)
                // end handles the response
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    // this is should.js syntax, very clear
                    res.should.have.status(400);
                    done();
                });
        });
        it('should correctly update an existing account', function (done) {
            var body = {
                firstName: 'JP',
                lastName: 'Berd'
            };
            request(url)
                .put('/api/profiles/vgheri')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body.should.have.property('_id');
                    res.body.firstName.should.equal('JP');
                    res.body.lastName.should.equal('Berd');
                    res.body.creationDate.should.not.equal(null);
                    done();
                });
        });
    });
});