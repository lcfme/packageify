#! /usr/bin/env node


var path = require('path');
var child_process = require('child_process');
var Gaze = require('gaze').Gaze;
var debounce = require('debounce');
var projectrcUtil = require('./projectrc-utils');
var projectrc = projectrcUtil.getProjectrc();

if (process.cwd() !== path.resolve(__dirname, '../')) throw new Error('script must run at project root folder');

function runBuild() {
    console.log('build start');
    var cprocess = child_process.exec('node ' + path.resolve(__dirname, './build.js')).on('close', function() {
        console.log('build complete');
    }).on('data', function(data) {
        console.log(data);
    })
    cprocess.stdout.pipe(process.stdout);
    cprocess.stderr.pipe(process.stderr);
}

console.log(`http-server ${projectrc.dist} -p 3000 -s\n`);
child_process.exec(`http-server ${projectrc.dist} -p 3000 -s\n`);

var gaze = new Gaze(path.resolve(process.cwd(), `${projectrc.src}/**/*`));

var delayBuild = debounce(runBuild, 1000);

gaze.on('ready', runBuild);

gaze.on('all', delayBuild);
