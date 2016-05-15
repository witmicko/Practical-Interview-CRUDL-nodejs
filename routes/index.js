/**
 * Created by witmi on 13/05/2016.
 */
"use strict";
var HttpStatus = require('http-status-codes'),
    db  = require('../lib/db')(),
    jwt = require('jsonwebtoken'),
    validator = require('../lib/user_validator'),
    logger    = require('../lib/logger'),
    config    = require('../config');


exports.index = function (req, res) {
    res.status(HttpStatus.OK).json({'hello': 'world'});
};

/*
    Creates new user, checks if there a duplicate entry and validates incoming data.
    Duplication would be much better handled by indexing db on chosen fields, but as per spec:
 4. Minimal scaffolding / auto code generation
    -- we want you to show your ability and creative side so please keep this to a minimum
 */
exports.create_user = function (req, res) {
    var new_user  = req.body,
        valid = validator.validate_user(new_user),
        invalid_keys = {};

    db.find_by_username(new_user.username).then(function (users) {
        if (users.length > 0) {
            invalid_keys.username = 'duplicate user';
        }
    }).then(function () {
        return db.find_by_email(new_user.email).then(function (users) {
            if (users.length > 0) {
                invalid_keys.email = 'duplicate user';
            }
        });
    }).then(function () {
        return db.find_by_PPS(new_user.PPS).then(function (users) {
            if (users.length > 0) {
                invalid_keys.PPS = 'duplicate user';
            }
        });
    }).then(function () {
        if (true !== valid || Object.keys(invalid_keys).length > 0) {
            Object.keys(valid).forEach(function (key) {
                invalid_keys[key] = "invalid or missing";
            });
            res.status(HttpStatus.BAD_REQUEST).json({'invalid_keys': invalid_keys});
        } else {
            db.create_user(new_user).then(function (data) {
                var id = {'id': data.ops[0].id};
                logger.info("User added id:", id);
                res.status(HttpStatus.CREATED).json(id);
            });
        }
    });
};
exports.update_user = function (req, res) {
    var new_user = req.body,
        id = req.params.id,
        valid = validator.validate_user(new_user),
        invalid_keys = {};

    if (true !== valid) {
        Object.keys(valid).forEach(function (key) {
            invalid_keys[key] = "invalid or missing";
        });
        return res.status(HttpStatus.BAD_REQUEST).json({'invalid_keys': invalid_keys});
    }

    new_user.id = id;
    db.get_user(id).then(function (doc) {
        if (doc.length === 0) {
            return res.status(HttpStatus.NOT_FOUND).json({err: "User not found"});
        }
        var old_user = doc[0],
        //check if email, username or pps were changed
            uname_upd = new_user.username.localeCompare(old_user.username) !== 0,
            email_upd = new_user.email.localeCompare(old_user.email) !== 0,
            pps_upd = new_user.PPS.localeCompare(old_user.PPS) !== 0;

        if (uname_upd || email_upd || pps_upd) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({'err': 'Not allowed to change email, username or pps no.'});
        }
        db.update_user(id, new_user, {upsert: false}).then(function () {
            return res.status(HttpStatus.OK).json({ok: true});
        });
    });
};

exports.delete_user = function (req, res) {
    db.delete_user(req.params.id).then(function (r) {
        return res.status(HttpStatus.OK).json(r.result);
    }).catch(function (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({err: err.message});
    });
};
/*
    Simple find by: email, username, pps no. needs exact match to work
 */
exports.get_user_by = function (req, res) {
    var query = req.query,
        not_found = HttpStatus.NOT_FOUND,
        response = {'result': "User not found", 'query': query};
    if (query.email) {
        db.find_by_email(query.email).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.username) {
        db.find_by_username(query.username).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    } else if (query.pps) {
        db.find_by_PPS(query.pps).then(function (user) {
            if (user.length > 0) {
                res.status(HttpStatus.OK).json({'user': user[0]});
            } else {
                res.status(not_found).json(response);
            }
        });
    }
};

exports.get_all_users = function (req, res) {
    db.get_all_users().then(function (users) {
        res.status(HttpStatus.OK).json(users);
    });
};

exports.get_user = function (req, res) {
    db.get_user(req.params.id).then(function (arr) {
        if (arr.length === 0) {
            res.status(HttpStatus.NOT_FOUND).json({id: req.params.id + " Not found"});
        } else if (arr.length > 1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({id: req.params.id + " multiple users with the same id"});
        } else {
            res.status(HttpStatus.OK).json(arr[0]);
        }
    });
};

exports.populate = function (req, res) {
    var result = db.reset_data();
    if (result.err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    } else {
        res.status(HttpStatus.OK).json(result);
    }
};

exports.init = function () {
    db.connect();
};

exports.authenticate = function (req, res) {
    var usr = req.body.username,
        pwd = req.body.password;
    
    db.find_by_username(usr).then(function (user) {
        if (user.length === 0 || user[0].password.localeCompare(pwd) !== 0) {
            res.status(HttpStatus.FORBIDDEN).json({err: "invalid password or username"});
            logger.info("Failed auth u:", usr, "p:", pwd);
        } else {
            var token = jwt.sign(user[0], config.secret, {expiresIn: '1d'});
            res.status(HttpStatus.OK).json({token: token});
        }
    });
};

exports.jwt_middleware = function (req, res, next) {
    var token = req.body.token ||
        req.query.token ||
        req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                res.status(HttpStatus.FORBIDDEN).json({err: "not authenticated"});
            } else {
                req.decoded  = decoded;
                next();
            }
        });
    } else {
        res.status(HttpStatus.FORBIDDEN).json({err: "no token"});
    }
};