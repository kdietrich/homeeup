"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimpleMQTTPlugin');
var mqtt = require('mqtt');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var SimpleMQTTPlugin = /** @class */ (function () {
    function SimpleMQTTPlugin() {
        this.name = 'SimpleMQTTPlugin';
        this.devices = [];
        //states and vars
        this.mqttAvailable = false;
        this.mqttConnection = null;
    }
    SimpleMQTTPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.mqttServer = p.pluginParams.mqttServer;
        this.mqttUserName = p.pluginParams.mqttUserName;
        this.mqttPassword = p.pluginParams.mqttPassword;
        this.mqttOnTopic = p.pluginParams.mqttOnTopic;
        if (p.pluginParams.mqttOffTopic) {
            this.mqttOffTopic = p.pluginParams.mqttOffTopic;
        }
        else {
            this.mqttOffTopic = p.pluginParams.mqttOnTopic;
        }
        var device = new HMLCSW1_1.HMLCSW1();
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        var that = this;
        this.mqttConnect();
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    SimpleMQTTPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        this.mqttPublish(this.mqttOnTopic, '1');
    };
    SimpleMQTTPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        this.mqttPublish(this.mqttOffTopic, '0');
    };
    SimpleMQTTPlugin.prototype.mqttConnect = function () {
        if (this.mqttUserName) {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {
                username: this.mqttUserName,
                password: this.mqttPassword
            });
        }
        else {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {});
        }
        var that = this;
        this.mqttConnection.on('connect', function () {
            logger.info('MQTT connected');
            that.mqttAvailable = true;
            that.mqttSubscribe(that.mqttOnTopic);
            if (that.mqttOnTopic !== that.mqttOffTopic) {
                that.mqttSubscribe(that.mqttOffTopic);
            }
        });
        this.mqttConnection.on('message', function (topic, message) {
            that.handleIncommingSubscribedMqttMessage(that, topic, message);
        });
    };
    SimpleMQTTPlugin.prototype.mqttPublish = function (mqttTopic, mqttMessage) {
        if (this.mqttAvailable) {
            logger.debug('publish to', mqttTopic, mqttMessage);
            this.mqttConnection.publish(mqttTopic, mqttMessage);
        }
    };
    SimpleMQTTPlugin.prototype.mqttSubscribe = function (mqttTopic) {
        if (this.mqttAvailable) {
            this.mqttConnection.subscribe(mqttTopic, null, function (err) {
                if (err) {
                    logger.error(err, '" subscribe: "' + mqttTopic + '"');
                }
                else {
                    logger.info('"subscribe: "' + mqttTopic + '"');
                }
            });
        }
    };
    SimpleMQTTPlugin.prototype.handleIncommingSubscribedMqttMessage = function (that, topic, message) {
        logger.info("subscribed mqtt message received:", topic, message.toString());
        var device = that.devices[0];
        var val;
        var messageString = message.toString().toLowerCase();
        if (messageString === 'true' || messageString === '1') {
            val = 1;
        }
        else {
            val = 0;
        }
        if (val !== device.state1) {
            logger.info('Status of %s changed to %s.', device.deviceName, message);
            device.stateChanged(1, val);
        }
        else {
            logger.info('Status of %s has not changed.', device.deviceName);
        }
    };
    return SimpleMQTTPlugin;
}());
exports.SimpleMQTTPlugin = SimpleMQTTPlugin;
