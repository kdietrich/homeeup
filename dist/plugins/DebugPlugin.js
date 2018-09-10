"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('DebugPlugin');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var HMSECSC2_1 = require("../devices/HMSECSC2");
var HMSECMDIR2_1 = require("../devices/HMSECMDIR2");
var HMRC42_1 = require("../devices/HMRC42");
var HMLCBL1FM_1 = require("../devices/HMLCBL1FM");
var HMWDS40THI_1 = require("../devices/HMWDS40THI");
var DebugPlugin = /** @class */ (function () {
    function DebugPlugin() {
        this.name = 'DebugPlugin';
        this.devices = [];
    }
    DebugPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        var device = new HMLCSW1_1.HMLCSW1(p.deviceName + 'Switch');
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        device = new HMSECSC2_1.HMSECSC2(p.deviceName + 'DoorContact');
        this.devices.push(device);
        device = new HMSECMDIR2_1.HMSECMDIR2(p.deviceName + 'MotionSensor');
        this.devices.push(device);
        this.devices.push(new HMRC42_1.HMRC42(p.deviceName + 'Remote'));
        this.devices.push(new HMLCBL1FM_1.HMLCBL1FM(p.deviceName + 'Blinds'));
        this.devices.push(new HMWDS40THI_1.HMWDS40THI(p.deviceName + 'TempHumid'));
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    DebugPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Starting cleaning.');
    };
    DebugPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Pausing cleaning and sending back to base.');
    };
    return DebugPlugin;
}());
exports.DebugPlugin = DebugPlugin;
