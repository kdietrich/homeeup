const Logger = require('logplease');
const logger = Logger.create('SimpleMQTTPlugin');
const mqtt = require('mqtt')
import { PluginInterface } from "./PluginInterface";

export class SimpleMQTTPlugin implements PluginInterface {

    name: String = 'SimpleMQTTPlugin';
    deviceType: String = 'HMLCSW1';
    device;

    //config
    mqttServer: String;
    mqttUserName: String;
    mqttPassword: String;
    mqttOnTopic: String;
    mqttOffTopic: String;

    //states and vars
    mqttAvailable: Boolean = false
    mqttConnection: any = null

    init(p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.mqttServer = p.pluginParams.mqttServer;
        this.mqttUserName = p.pluginParams.mqttUserName;
        this.mqttPassword = p.pluginParams.mqttPassword;
        this.mqttOnTopic = p.pluginParams.mqttOnTopic;
        if (p.pluginParams.mqttOffTopic) {
            this.mqttOffTopic = p.pluginParams.mqttOffTopic;
        } else {
            this.mqttOffTopic = p.pluginParams.mqttOnTopic;            
        }

        var that = this;

        this.mqttConnect();
        
        logger.info('Plugin %s initialized.', this.name);
    }

    onTurnOn() {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        this.mqttPublish(this.mqttOnTopic, '1')
    }

    onTurnOff() {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
        this.mqttPublish(this.mqttOffTopic, '0')
    }

    mqttConnect() {
        if (this.mqttUserName) {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {
                username: this.mqttUserName,
                password: this.mqttPassword
            })
        } else {
            this.mqttConnection = mqtt.connect('mqtt://' + this.mqttServer, {})
        }

        var that = this;        
        this.mqttConnection.on('connect', function () {
            logger.info('MQTT connected');
            that.mqttAvailable = true
            that.mqttSubscribe(that.mqttOnTopic)
            if (that.mqttOnTopic !== that.mqttOffTopic) {
                that.mqttSubscribe(that.mqttOffTopic)
            }
        })

        this.mqttConnection.on('message', function (topic, message) {
            that.handleIncommingSubscribedMqttMessage(that, topic, message)
        })
    }

    mqttPublish(mqttTopic, mqttMessage) {
        if(this.mqttAvailable) {
            logger.debug('publish to', mqttTopic, mqttMessage)
            this.mqttConnection.publish(mqttTopic, mqttMessage)
        }
    }
    
    mqttSubscribe(mqttTopic) {
        if (this.mqttAvailable) {
            this.mqttConnection.subscribe(mqttTopic, null, function (err) {
                if (err) {
                    logger.error(err, '" subscribe: "' + mqttTopic + '"')
                } else {
                    logger.info('"subscribe: "' + mqttTopic + '"')
                }
            })    
        }
    }

    handleIncommingSubscribedMqttMessage(that, topic, message) {
        logger.info("subscribed mqtt message received:", topic, message.toString())
        let val
        let messageString = message.toString().toLowerCase()
        if (messageString === 'true' || messageString === '1') {
            val = 1
        } else {
            val = 0            
        }

        if (val !== that.device.state1) {
            logger.info('Status of %s changed to %s.', that.device.deviceName, message);
            that.device.stateChanged(1, val);
        }
        else {
            logger.info('Status of %s has not changed.', that.device.deviceName);
        }
    }
}