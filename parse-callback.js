'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const parse = require('csv-parse');
const helper = require('./helper');

// 0. Naïve

// backlog #1
function readFile(filename) {
    fs.readFile(__dirname + filename, readFileCallback);
}

function readFileCallback(err, loadedCsv) {
    if (err) {
        debug(err.message);
    }

    parseCsv(loadedCsv);
}

// backlog #2
function parseCsv(loadedCsv) {
    parse(loadedCsv, parseCsvCallback);
}

function parseCsvCallback(err, parsed) {
    if (err) {
        debug(err.message);
    }

    for (let index in parsed) {

        let line = parsed[index];

        // backlog #3
        line = helper.transform(line);

        if (index > 0) {
            debug(`sending data index: ${index - 1}`);

            sendSms(line);
        }

        index++;
    }
}

// backlog #4
function sendSms(line) {
    helper.sendSms(line, function (err, sendingStatus) {
        sendSmsCallback(err, line, sendingStatus);
    });
}

function sendSmsCallback(err, line, sendingStatus) {
    let lineToLog;
    if (err) {
        debug(err.message);

        lineToLog = {
            sendingStatus,
            line,
        };
    }

    if (lineToLog) {
        logToS3(lineToLog);
    }
}

// backlog #5
function logToS3(lineToLog) {
    helper.logToS3(lineToLog, logToS3Callback);
}

function logToS3Callback(err, loggingStatus) {
    if (err) {
        debug(err.message);
    }
}

// naive() is hard to read so break up into smaller functions to handle each part of the process
function naive() {
    readFile('/sample.csv');
}

naive();

