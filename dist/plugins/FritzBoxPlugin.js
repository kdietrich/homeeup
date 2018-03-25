"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('FritzBoxPlugin');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var Fritz = require('fritzapi').Fritz;
var FritzBoxPlugin = /** @class */ (function () {
    function FritzBoxPlugin() {
        this.name = 'FritzBoxPlugin';
        this.devices = [];
    }
    FritzBoxPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.ipAddress = p.pluginParams.ipAddress;
        this.user = p.pluginParams.user;
        this.password = p.pluginParams.password;
        var device = new HMLCSW1_1.HMLCSW1();
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        this.fritzBox = new Fritz(this.user, this.password, this.ipAddress);
        var that = this;
        setInterval(function () {
            that._checkStatus(device, false);
        }, 10000);
        that._checkStatus(device, true);
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    FritzBoxPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Switching guest wifi on.');
        this.fritzBox.setGuestWlan(true).then(function (res) {
            logger.info('Guest wifi activated.');
        });
    };
    FritzBoxPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Switching guest wifi off.');
        this.fritzBox.setGuestWlan(false).then(function (res) {
            logger.info('Guest wifi deactivated.');
        });
    };
    FritzBoxPlugin.prototype._checkStatus = function (device, forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', device.deviceName);
        this.fritzBox.getGuestWlan().then(function (res) {
            if (res.activate_guest_access !== device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', device.deviceName, res.activate_guest_access);
                device.stateChanged(1, res.activate_guest_access);
            }
            else {
                logger.info('Status of %s has not changed.', device.deviceName);
            }
        });
    };
    return FritzBoxPlugin;
}());
exports.FritzBoxPlugin = FritzBoxPlugin;
