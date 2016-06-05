'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');
const async = require('async');

function sendSms(line) {
    async.waterfall([
        function sendSms(sendSmsCallback) {
            helper.sendSms(line, sendSmsCallback);
        },

        function sendSmsCallback(sendingStatus) {
            // do nothing if no error
        },

    ], function (err, sendingStatus) {
        if (err) {
            debug(err.message);

            let lineToLog;
            lineToLog = {
                sendingStatus,
                line,
            };

            if (lineToLog) {
                logToS3(lineToLog);
            }
        }
    });
}

function logToS3(lineToLog) {
    async.waterfall([
        function (logToS3Callback) {
            helper.logToS3(lineToLog, logToS3Callback);
        },

        function logToS3Callback(loggingStatus) {
            // do nothing if no error
        },
    ], function (err) {
        if (err) {
            debug(err.message);
        }
    });
}

function readFile(filename, readFileCallback) {
    fs.readFile(__dirname + filename, readFileCallback);
}

function readFileCallback(loadedCsv, parseCsvCallback) {
    parse(loadedCsv, parseCsvCallback);
}

function parseCsvCallback(parsed) {
    for (let index in parsed) {

        let line = parsed[index];

        line = helper.transform(line);

        if (index > 0) {
            debug(`sending data index: ${index - 1}`);

            sendSms(line);
        }

        index++;
    }
}

function asyncParse() {
    async.waterfall([
        async.apply(readFile, '/sample.csv'),
        readFileCallback,
        parseCsvCallback,
    ], function (err) {
        if (err) {
            debug(err.message);
        }
    });
}

asyncParse();

