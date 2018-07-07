"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('VorwerkKoboldPlugin');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var HMSECSC2_1 = require("../devices/HMSECSC2");
var kobold = require('node-kobold');
var VorwerkKoboldPlugin = /** @class */ (function () {
    function VorwerkKoboldPlugin() {
        this.name = 'VorwerkKoboldPlugin';
        this.devices = [];
    }
    VorwerkKoboldPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.email = p.pluginParams.email;
        this.password = p.pluginParams.password;
        var device = new HMLCSW1_1.HMLCSW1(p.deviceName + 'OnOff');
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        device = new HMSECSC2_1.HMSECSC2(p.deviceName + 'Dock');
        this.devices.push(device);
        var that = this;
        this.koboldClient = new kobold.Client();
        this.koboldClient.authorize(this.email, this.password, false, function (err) {
            if (err) {
                logger.error('Could not connect to Vorwerk cloud. Check your credentials.');
                return;
            }
            that.koboldClient.getRobots(function (err, robots) {
                if (err || robots.length == 0) {
                    logger.error('Could not find any robots.');
                    return;
                }
                that.koboldRobot = robots[0];
                setInterval(function () {
                    that._checkStatus(false);
                }, 10000);
                that._checkStatus(true);
            });
        });
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    VorwerkKoboldPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Starting cleaning.');
        this.koboldRobot.startCleaning(this.koboldRobot.eco, this.koboldRobot.navigationMode, function (err, res) {
            if (err) {
                logger.error('Could not start cleaning.');
                return;
            }
            logger.info('Started cleaning.');
        });
    };
    VorwerkKoboldPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Pausing cleaning and sending back to base.');
        var that = this;
        this.koboldRobot.pauseCleaning(function (err, res) {
            if (err) {
                logger.error('Could not pause cleaning.');
                return;
            }
            that.koboldRobot.sendToBase(function (err, res) {
                if (err) {
                    logger.error('Could not send robot back to base.');
                    return;
                }
                logger.info('Paused cleaning and sent back to base.');
            });
        });
    };
    VorwerkKoboldPlugin.prototype._checkStatus = function (forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', that.name);
        this.koboldRobot.getState(function (err, state) {
            if (err) {
                logger.error('Could not get state of robot.');
                logger.error(err);
                return;
            }
            var isCleaning = state.state === 2 && state.action !== 4; //returning to base is not cleaning
            var isDocked = !that.koboldRobot.isDocked; //opposit, because isDocked means closed
            if (isCleaning !== that.devices[0].state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', that.devices[0].deviceName, isCleaning);
                that.devices[0].stateChanged(1, isCleaning);
            }
            else {
                logger.info('Status of %s has not changed.', that.devices[0].deviceName);
            }
            if (isDocked !== that.devices[1].state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', that.devices[1].deviceName, isDocked);
                that.devices[1].stateChanged(1, isDocked);
            }
            else {
                logger.info('Status of %s has not changed.', that.devices[1].deviceName);
            }
        });
    };
    return VorwerkKoboldPlugin;
}());
exports.VorwerkKoboldPlugin = VorwerkKoboldPlugin;
