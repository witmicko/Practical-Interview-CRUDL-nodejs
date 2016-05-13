/**
 * Created by witmi on 13/05/2016.
 */
'use strict';
var is = require('validator.js').Assert;
var validator = require('validator.js');

var constraint = validator.constraint({
    gender: [is.notBlank(), is.NotNull(), is.Required()],
    name: {
        title: [is.notBlank(), is.NotNull(), is.Required()],
        first: [is.notBlank(), is.NotNull(), is.Required()],
        last: [is.notBlank(), is.NotNull(), is.Required()]
    },
    location: {
        street: [is.notBlank(), is.NotNull(), is.Required()],
        city: [is.notBlank(), is.NotNull(), is.Required()],
        state: [is.notBlank(), is.NotNull(), is.Required()],
        zip: is.GreaterThan(0)
    },

    email: [is.email(), is.NotNull(), is.Required()],
    username: [is.notBlank(), is.NotNull(), is.Required()],
    password: [is.notBlank(), is.NotNull(), is.Required()],
    salt: [is.notBlank(), is.NotNull(), is.Required()],
    md5: [is.notBlank(), is.NotNull(), is.Required()],
    sha1: [is.notBlank(), is.NotNull(), is.Required()],
    sha256: [is.notBlank(), is.NotNull(), is.Required()],
    registered: is.GreaterThan(0),
    dob: is.GreaterThan(0),
    
    //todo phone regex
    phone: [is.notBlank(), is.NotNull(), is.Required()],
    cell: [is.notBlank(), is.NotNull(), is.Required()],
    PPS: [is.notBlank(), is.NotNull(), is.Required()],
    picture: {
        large: [is.notBlank(), is.NotNull(), is.Required()],
        medium: [is.notBlank(), is.NotNull(), is.Required()],
        thumbnail: [is.notBlank(), is.NotNull(), is.Required()],
    }
}, { deepRequired: true });
var nested_constrains = {
    name:     is.Required(),
    location: is.Required(),
    picture:  is.Required()
};

exports.validate_user = function (user) {
    return constraint.check(user);
    // return validator..validate(user, constraint);
};

