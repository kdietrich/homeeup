"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimulatePlugin');
var HMCCTC_1 = require("../devices/HMCCTC");
var SimulatePlugin = /** @class */ (function () {
    function SimulatePlugin() {
        this.name = 'SimulatePlugin';
        this.devices = [];
    }
    SimulatePlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.type = p.pluginParams.type;
        this.count = p.pluginParams.count;
        for (var i = 0; i < this.count; i++) {
            if (this.type == 'HMCCTC') {
                this.devices.push(new HMCCTC_1.HMCCTC(p.deviceName + "_" + i));
            }
        }
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    return SimulatePlugin;
}());
exports.SimulatePlugin = SimulatePlugin;
