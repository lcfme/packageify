var path = require('path');
var _ = require('lodash');
var readJson = require('readjson');
var cwd = process.cwd();
var projectrc;

try {
    projectrc = readJson.sync(resolve('./projectrc.json'));
} catch (err) {
    throw new Error(
        `Cannot find projectrc.json in current work dir. Please ensure your are in project root folder.`
    );
}

/**
 * valid projectrc
 */
if (!_.isPlainObject(projectrc) || !projectrc.src || !projectrc.dist)
    throw new Error(
        `projectrc.json is invalid. projectrc must has dist, src schema to specify your source foler and output folder`
    );
projectrc.src = resolve(projectrc.src);
projectrc.dist = resolve(projectrc.dist);

if (_.isPlainObject(projectrc.browserify)) {
    (function() {
        var config = projectrc.browserify;
        if (!config.libDir)
            throw new Error(
                'projectrc.browserify is invalid. Please ensure it has libDir schema to specify output lib dir.'
            );
        config._libDir = resolve(projectrc.src, config.libDir);
        config.libDir = resolve(projectrc.dist, config.libDir);
        if (_.isPlainObject(config.lib)) {
            Object.keys(config.lib).forEach(libName => {
                if (!_.isArray(config.lib[libName]))
                    throw new Error(
                        'projectrc.lib[libNare] must be type Array'
                    );
                config.lib[libName] = config.lib[libName].map(depsName => {
                    if (!depsName)
                        throw new Error('depsName cannot be undefined');
                    try {
                        require.resolve(depsName);
                        return depsName;
                    } catch (err) {
                        return resolve(projectrc.src, depsName);
                    }
                });
            });
        }
    })();
}

function resolve(...args) {
    return path.resolve(cwd, ...args);
}

exports.getProjectrc = function() {
    return projectrc;
};

exports.getJsLib = function() {
    try {
        return projectrc.browserify.lib;
    } catch (err) {
        return null;
    }
};

exports.getJsLibInPlainArray = function() {
    try {
        return Object.keys(projectrc.browserify.lib).reduce((result, deps) => {
            return [].concat(result, projectrc.browserify.lib[deps]);
        }, []);
    } catch (err) {
        return null;
    }
};
