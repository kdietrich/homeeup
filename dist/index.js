"use strict";
var Logger = require('logplease');
var logger = Logger.create('HomeeUp');
var config = require('../config');
var XMLRPCServer_1 = require("./XMLRPCServer");
var SimpleHTTPPlugin_1 = require("./plugins/SimpleHTTPPlugin");
var SimpleCMDPlugin_1 = require("./plugins/SimpleCMDPlugin");
var HMRC42_1 = require("./devices/HMRC42");
var HMLCSW1_1 = require("./devices/HMLCSW1");
var pluginPresets = { SimpleHTTPPlugin: SimpleHTTPPlugin_1.SimpleHTTPPlugin, SimpleCMDPlugin: SimpleCMDPlugin_1.SimpleCMDPlugin };
var devicePresets = { HMRC42: HMRC42_1.HMRC42, HMLCSW1: HMLCSW1_1.HMLCSW1 };
var HomeeUp = (function () {
    function HomeeUp() {
        this.hostPort = 2001;
        this.devices = [];
    }
    HomeeUp.prototype.start = function () {
        logger.info('Launching HomeeUp v0.1.0');
        logger.info('2018 by kdietrich');
        logger.info('running on node %s', process.version);
        logger.info('======================================');
        logger.debug('start()');
        logger.info("Config file location: %s", __dirname.replace('dist', 'config.js'));
        this.hostAddress = config.hostAddress;
        this.xmlServer = new XMLRPCServer_1.XMLRPCServer(this.hostAddress, this.hostPort);
        this._loadPlugins();
        this.xmlServer.init(this.devices);
    };
    HomeeUp.prototype._loadPlugins = function () {
        logger.debug('_loadPlugins()');
        var that = this;
        config.plugins.forEach(function (p) {
            var plugin = new pluginPresets[p.type]();
            var device = new devicePresets[plugin.deviceType]();
            plugin.init(p, device);
            device.init(p, plugin, that.xmlServer);
            that.devices.push(device);
        });
    };
    return HomeeUp;
}());
module.exports = function () {
    var homeeUp = new HomeeUp();
    homeeUp.start();
}();
