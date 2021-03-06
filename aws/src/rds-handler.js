"use strict";

/*
** Lambda for RDS start/stop
** event description ->
** {
**   ids   : ids
**   action   : START | STOP
**   ? attrib : ?
** }
*/

const AWS = require('aws-sdk');
const rds = new AWS.RDS();

function rds_start(id)
{
    return new Promise((resolve, reject) => {
        const params = {
            DBInstanceIdentifier: id
        };
        rds.startDBInstance(params, function(err, data) {
            if (err)
                return reject(err);
            else
                return resolve("Success")
        });
    });
}

function rds_stop(id)
{
    return new Promise((resolve, reject) => {
        const params = {
            DBInstanceIdentifier: id
        };
        rds.stopDBInstance(params, function(err, data) {
            if (err)
                return reject(err);
            else
                return resolve("Success")
        });
    });
}

function rds_modifyInstanceClass(id, rclass)
{
    return new Promise((resolve, reject) => {
        const params = {
            DBInstanceIdentifier: id,
            ApplyImmediately: true,
            DBInstanceClass: rclass
        };
        rds.modifyDBInstance(params, function(err, data) {
            if (err)
                return reject(err);
            else
                return resolve("Success")
        });
    });
}

exports.handler = async (event, callback) =>
{
    var promised;
    var response = {
        statusCode: 500,
        body: "Bad data format",
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*'}
    };
    try {
        const ids = event.ids;
        const action = event.action;
        var attrib;
    } catch (err) {
        return callback(null, response);
    }
    /* If fault there is probably no problems */
    try { 
        const attrib = event.attrib;
    } catch (err) { 
        attrib = "unused";
    }

    for (let i in ids)
    {
        if (action === "START")
            promised = await rds_start(ids[i]);
        else if (action === "STOP")
            promised = await rds_stop(ids[i]);
        else if (action === "MODCLASS" && attrib != "unused")
            promised = await rds_modifyInstanceClass(ids[i], attrib);
        else
            return callback(null, response);
    }
    response.body = promised;
    if (promised == "Success")
        response.statusCode = 200;
    return callback(null, response);
};