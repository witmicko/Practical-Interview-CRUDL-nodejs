/**
 * Created by witmi on 13/05/2016.
 */
"use strict";

exports.index = function (req, res) {
    res.status(200).json({'hello': 'world'});
};