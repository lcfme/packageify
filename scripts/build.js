#! /usr/bin/env node

var path = require('path');
var child_process = require('child_process');
var shell = require('shelljs');
var chalk = require('chalk');
var readdir = require('recursive-readdir');
var projectrcUtil = require('./projectrc-utils');
var projectrc = projectrcUtil.getProjectrc();
var log = console.log.bind(console);

if (process.cwd() !== path.resolve(__dirname, '../'))
    throw new Error('script must run at project root folder');

shell.rm('-rf', projectrc.dist);

function getDistName(filename) {
    var relative = path.relative(projectrc.src, filename);
    return path.resolve(projectrc.dist, relative);
}

function exec(cmd) {
    return child_process.exec(cmd).on('close', function(code) {
        if (code) {
            log(chalk.red(`failed run: ${cmd}`));
            throw new Error(`failed run: ${cmd}`);
        }
        log(chalk.green(`complete : ${cmd}`));
    });
}

var bundleLibJsCmd = (function(jsLib) {
    var targetName;
    if (!jsLib) return null;
    return Object.keys(jsLib).map(libName => {
        targetName = path.resolve(projectrc.browserify.libDir, libName);
        if (!/\.jsx?$/.test(targetName)) targetName = targetName + '.js';
        return (
            'browserify' +
            jsLib[libName].reduce((r, dep) => {
                return r + ' -r ' + dep;
            }, '') +
            ' > ' +
            targetName
        );
    });
})(projectrcUtil.getJsLib());

var jsLibInPlainArray = projectrcUtil.getJsLibInPlainArray();
var jsExternalString = (function() {
    var first;
    return jsLibInPlainArray.reduce((r, dep) => {
        first = dep.search(':');
        if (first > -1) dep = dep.substr(++first);
        return r + ' -x ' + dep;
    }, '');
})();

/**
 * 打包公用库
 */
shell.mkdir('-p', path.resolve(projectrc.browserify.libDir));
bundleLibJsCmd.forEach(cmd => {
    exec(cmd);
});

/**
 * 遍历文件
 */

readdir(projectrc.src, function(err, files) {
    if (err) throw new Error('Error happened when readdir error.');
    files.forEach(file => {
        var dirname = path.dirname(file),
            destname = getDistName(file);
        if (/\.entry\.jsx?$/i.test(file)) {
            destname = destname.replace(/\.entry\.jsx?$/i, '.js');
            var cmd = `browserify ${jsExternalString} -e ${file} > ${destname}`;
            var distdir = path.dirname(destname);
            shell.mkdir('-p', distdir);
            exec(cmd);
        } else if (/\.copy(\.\w+)$/i.test(file)) {
            destname = destname.replace(/\.copy(\.\w+)$/i, '$1');
            var distdir = path.dirname(destname);
            shell.mkdir('-p', distdir);
            shell.cp('-f', file, destname);
            log(chalk.yellow(`copy resorce: ${file}`));
        } else if (/\.less$/i.test(file)) {
            destname = destname.replace(/\.less$/i, '.css');
            var cmd = `lessc --clean-css ${file} > ${destname}`;
            var distdir = path.dirname(destname);
            shell.mkdir('-p', distdir);
            exec(cmd);
        } else if (/\.html$/i.test(file)) {
            var cmd = `html-img-loader -f ${file} -s 50 > ${destname}`;
            var distdir = path.dirname(destname);
            shell.mkdir('-p', distdir);
            exec(cmd);
        } else if (!/^\.(html)|(less)|(jsx?)$/.test(file)) {
            var distdir = path.dirname(destname);
            shell.mkdir('-p', distdir);
            shell.cp('-f', file, destname);
        } else {
            log(chalk.yellow(`unresolved resorce: ${file}`));
        }
    });
});
