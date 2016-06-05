'use strict';

const debug = require('debug')('hello');

const fs = require('fs');
const readline = require('readline');
const parse = require('csv-parse');
const helper = require('./helper');

var filename = '/sample.csv';

// backlog #1
var readFileStream = fs.createReadStream(__dirname + filename);

// backlog #2
var parser = parse();

// backlog #4
function sendSms(line) {
    helper.sendSms(line, function (err, sendingStatus) {
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

// backlog #5
function logToS3(lineToLog) {
    helper.logToS3(lineToLog, function (err, loggingStatus) {
        if (err) {
            debug(err.message);
        }
    });
}

const rl = readline.createInterface({
    input: readFileStream,
});

parser.on('readable', () => {
    let line;
    while (line = parser.read()) {
        // backlog #3
        line = helper.transform(line);
        sendSms(line);
    }
});

rl.input.pipe(parser);

