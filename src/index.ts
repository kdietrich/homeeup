const Logger = require('logplease');
const logger = Logger.create('HomeeUp');
const fs = require('fs');
const os = require('os');
import { XMLRPCServer } from "./XMLRPCServer";
import { SimpleHTTPPlugin } from "./plugins/SimpleHTTPPlugin";
import { SimpleCMDPlugin } from "./plugins/SimpleCMDPlugin";
import { FritzBoxPlugin } from "./plugins/FritzBoxPlugin";
import { SimpleMQTTPlugin } from "./plugins/SimpleMQTTPlugin";
import { SimpleMQTTPluginDoor } from "./plugins/SimpleMQTTPluginDoor";
import { SimpleMQTTPluginMotion } from "./plugins/SimpleMQTTPluginMotion";
import { VorwerkKoboldPlugin } from "./plugins/VorwerkKoboldPlugin";
import { DebugPlugin } from "./plugins/DebugPlugin";
import { AqaraPlugin } from "./plugins/AqaraPlugin";
import { SimulatePlugin } from "./plugins/SimulatePlugin";

const pluginPresets = { SimpleHTTPPlugin, SimpleCMDPlugin, FritzBoxPlugin, SimpleMQTTPlugin, SimpleMQTTPluginDoor, SimpleMQTTPluginMotion, VorwerkKoboldPlugin, DebugPlugin, AqaraPlugin, SimulatePlugin };

class HomeeUp {

    hostAddress: string;
    hostPort: number = 2001;
    devices = [];
    xmlServer;
    config;

    start() {
        logger.info('Launching HomeeUp v0.1.5');
        logger.info('2018 by kdietrich');
        logger.info('running on node %s', process.version);
        logger.info('======================================');
        logger.debug('start()');

        this._loadConfig();

        this.hostAddress = this.config.hostAddress;
        this.xmlServer = new XMLRPCServer(this.hostAddress, this.hostPort);

        this._loadPlugins();
        this.xmlServer.init(this.devices);

    }

    private _loadConfig() {
        logger.debug('_loadConfig()');
        let fileLocation = os.homedir() + '/.homeeup/config.json';
        logger.info("Config file location: %s", fileLocation);
        try {
            let file = fs.readFileSync(fileLocation, 'utf8');
            this.config = JSON.parse(file);
        }
        catch(e) {
            logger.error('Could not find or parse config file %s', fileLocation);
            process.exit();
        }
    }

    private _loadPlugins() {
        logger.debug('_loadPlugins()');
        var that = this;
        that.config.plugins.forEach(function(p) {
            let plugin = new pluginPresets[p.type]();
            let devices = plugin.init(p);
            for(let i=0; i<devices.length; i++) {
                devices[i].init(p, plugin, that.xmlServer);
            }

            that.devices = that.devices.concat(devices);
        });
    }

}

export = function() {
    let homeeUp = new HomeeUp();
    homeeUp.start();
}()
