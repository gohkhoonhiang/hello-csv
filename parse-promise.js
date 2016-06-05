'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');
const Promise = require('promise');

// backlog #1
function readFile(filename) {
    return new Promise(function (fulfill, reject) {
        fs.readFile(__dirname + filename, function thenParse(err, loadedCsv) {
            if (err) {
                reject(err);
            } else {
                fulfill(loadedCsv);
            }
        });
    });
}

// backlog #2
function parseCsv(loadedCsv) {
    return new Promise(function (fulfill, reject) {
        parse(loadedCsv, function transformEachLine(err, parsed) {
            if (err) {
                reject(err);
            } else {
                fulfill(parsed);
            }
        });
    });
}

function readLines(parsed) {
    for (let index in parsed) {

        let line = parsed[index];

        // backlog #3
        line = helper.transform(line);

        if (index > 0) {
            debug(`sending data index: ${index - 1}`);

            sendSms(line).catch(logToS3).catch(printDebug);
        }

        index++;
    }
}

// backlog #4
function sendSms(line) {
    return new Promise(function (fulfill, reject) {
        helper.sendSms(line, function afterSending(err, sendingStatus) {
            let lineToLog;
            if (err) {
                printDebug(err);
                lineToLog = {
                    sendingStatus,
                    line,
                };
                reject(lineToLog);
            } else {
                fulfill();
            }
        });
    });
}

// backlog #5
function logToS3(lineToLog) {
    return new Promise(function (fulfill, reject) {
        helper.logToS3(lineToLog, function afterLogging(err, loggingStatus) {
            if (err) {
                reject(err);
            } else {
                fulfill();
            }
        });
    });
}

function printDebug(err) {
    debug(err.message);
}

function promiseParse() {
    readFile('/sample.csv')
        .then(parseCsv, printDebug)
        .then(readLines, printDebug);
}

promiseParse();

