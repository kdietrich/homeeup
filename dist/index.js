"use strict";
var Logger = require('logplease');
var logger = Logger.create('HomeeUp');
var fs = require('fs');
var os = require('os');
var XMLRPCServer_1 = require("./XMLRPCServer");
var SimpleHTTPPlugin_1 = require("./plugins/SimpleHTTPPlugin");
var SimpleCMDPlugin_1 = require("./plugins/SimpleCMDPlugin");
var FritzBoxPlugin_1 = require("./plugins/FritzBoxPlugin");
var SimpleMQTTPlugin_1 = require("./plugins/SimpleMQTTPlugin");
var VorwerkKoboldPlugin_1 = require("./plugins/VorwerkKoboldPlugin");
var DebugPlugin_1 = require("./plugins/DebugPlugin");
var pluginPresets = { SimpleHTTPPlugin: SimpleHTTPPlugin_1.SimpleHTTPPlugin, SimpleCMDPlugin: SimpleCMDPlugin_1.SimpleCMDPlugin, FritzBoxPlugin: FritzBoxPlugin_1.FritzBoxPlugin, SimpleMQTTPlugin: SimpleMQTTPlugin_1.SimpleMQTTPlugin, VorwerkKoboldPlugin: VorwerkKoboldPlugin_1.VorwerkKoboldPlugin, DebugPlugin: DebugPlugin_1.DebugPlugin };
var HomeeUp = /** @class */ (function () {
    function HomeeUp() {
        this.hostPort = 2001;
        this.devices = [];
    }
    HomeeUp.prototype.start = function () {
        logger.info('Launching HomeeUp v0.1.5');
        logger.info('2018 by kdietrich');
        logger.info('running on node %s', process.version);
        logger.info('======================================');
        logger.debug('start()');
        this._loadConfig();
        this.hostAddress = this.config.hostAddress;
        this.xmlServer = new XMLRPCServer_1.XMLRPCServer(this.hostAddress, this.hostPort);
        this._loadPlugins();
        this.xmlServer.init(this.devices);
    };
    HomeeUp.prototype._loadConfig = function () {
        logger.debug('_loadConfig()');
        var fileLocation = os.homedir() + '/.homeeup/config.json';
        logger.info("Config file location: %s", fileLocation);
        try {
            var file = fs.readFileSync(fileLocation, 'utf8');
            this.config = JSON.parse(file);
        }
        catch (e) {
            logger.error('Could not find or parse config file %s', fileLocation);
            process.exit();
        }
    };
    HomeeUp.prototype._loadPlugins = function () {
        logger.debug('_loadPlugins()');
        var that = this;
        that.config.plugins.forEach(function (p) {
            var plugin = new pluginPresets[p.type]();
            var devices = plugin.init(p);
            for (var i = 0; i < devices.length; i++) {
                devices[i].init(p, plugin, that.xmlServer);
            }
            that.devices = that.devices.concat(devices);
        });
    };
    return HomeeUp;
}());
module.exports = function () {
    var homeeUp = new HomeeUp();
    homeeUp.start();
}();
