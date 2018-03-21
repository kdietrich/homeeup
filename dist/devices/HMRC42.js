"use strict";
var Logger = require('logplease');
var logger = Logger.create('HMRC42');
var fs = require('fs');
var HMRC42 = (function () {
    function HMRC42() {
        this.templatePath = 'HM-RC-4-2.json';
    }
    HMRC42.prototype.init = function (plugin) {
        logger.debug('init(%s)', JSON.stringify(plugin));
        this.plugin = plugin;
        this.deviceName = plugin.deviceName;
        var jsonPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../src/devices/');
        var file = fs.readFileSync(jsonPath + this.templatePath, 'utf8');
        file = file.replace(/%ADDRESS%/g, this.deviceName);
        this.template = JSON.parse(file);
        logger.info('Device %s of plugin %s initialized.', this.deviceName, this.plugin.name);
    };
    HMRC42.prototype.getChannels = function () {
        return this.template.channels;
    };
    HMRC42.prototype.getParamset = function (name, type) {
        logger.debug('getParamset(%s,%s)', name, type);
        for (var i = 0; i < this.template.paramsets.length; i++) {
            var p = this.template.paramsets[i];
            if ((p.name.indexOf(name) > -1) && p.type === type) {
                return p;
            }
        }
        ;
        return null;
    };
    HMRC42.prototype.getParamsetDescription = function (name, type) {
        logger.debug('getParamsetDescription(%s,%s)', name, type);
        for (var i = 0; i < this.template.paramsetDescriptions.length; i++) {
            var pd = this.template.paramsetDescriptions[i];
            if ((pd.name.indexOf(name) > -1) && pd.type === type) {
                return pd;
            }
        }
        ;
        return null;
    };
    HMRC42.prototype.putParamset = function (ps) {
        //TODO
    };
    return HMRC42;
}());
exports.HMRC42 = HMRC42;
