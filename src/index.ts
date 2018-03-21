const Logger = require('logplease');
const logger = Logger.create('HomeeUp');
const config = require('../config');
import { XMLRPCServer } from "./XMLRPCServer";
import { SimpleHTTPPlugin } from "./plugins/SimpleHTTPPlugin";
import { SimpleCMDPlugin } from "./plugins/SimpleCMDPlugin";
import { HMRC42 } from "./devices/HMRC42";
import { HMLCSW1 } from "./devices/HMLCSW1";

const pluginPresets = { SimpleHTTPPlugin, SimpleCMDPlugin };
const devicePresets = { HMRC42, HMLCSW1 };

class HomeeUp {

    hostAddress: string;
    hostPort: number = 2001;
    devices = [];
    xmlServer;

    start() {
        logger.info('Launching HomeeUp v0.1.0');
        logger.info('2018 by kdietrich');
        logger.info('running on node %s', process.version);
        logger.info('======================================');
        logger.debug('start()');

        logger.info("Config file location: %s", __dirname.replace('dist', 'config.js'));

        this.hostAddress = config.hostAddress;
        this.xmlServer = new XMLRPCServer(this.hostAddress, this.hostPort);

        this._loadPlugins();
        this.xmlServer.init(this.devices);

    }

    private _loadPlugins() {
        logger.debug('_loadPlugins()');
        var that = this;
        config.plugins.forEach(function(p) {

            var plugin = new pluginPresets[p.type]();
            var device = new devicePresets[plugin.deviceType]();
            plugin.init(p, device);
            device.init(p, plugin, that.xmlServer);

            that.devices.push(device);
        });
    }

}

export = function() {
    let homeeUp = new HomeeUp();
    homeeUp.start();
}()