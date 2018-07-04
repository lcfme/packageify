console.log(process.env.NODE_ENV);
var api =
    process.env.NODE_ENV === 'production'
        ? require('./productionapi')
        : require('./developmentapi');
exports.api = api;
