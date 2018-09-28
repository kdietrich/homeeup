const Logger = require('logplease');
const xmlrpc = require('xmlrpc');
const logger = Logger.create('XMLRPCServer');
const storage = require('node-persist');
const os = require('os');

export class XMLRPCServer {

    host: String;
    port: number;
    consumers = [];
    server;
    devices;

    constructor(host: String, port: number) {
        logger.debug('constructor(%s,%s)', host, port);
        this.host = host;
        this.port = port;
    }

    init(devices) {
        logger.debug('init(%s)', devices);
        logger.info('Initializing XMLRPCServer.');
        this.devices = devices;
        this.server = xmlrpc.createServer({ host: this.host, port: this.port, encoding: 'ISO-8859-1' });

        this.server.on('NotFound', this._onNotFound.bind(this));
        this.server.on('system.listMethods', this._onListMethods.bind(this));
        this.server.on('init', this._onInit.bind(this));
        this.server.on('ping', this._onPing.bind(this));
        this.server.on('putParamset', this._onPutParamset.bind(this));
        this.server.on('getParamset', this._onGetParamset.bind(this));
        this.server.on('getParamsetDescription', this._onGetParamsetDescription.bind(this));
        this.server.on('listDevices', this._onListDevices.bind(this));

        this._initConsumers();

        logger.info('XMLRPCServer listening on address %s and port %s.', this.host, this.port);
    }

    broadcastEvent(deviceName, name, value, explicitDouble=false) {
        logger.debug('broadcastEvent(%s,%s,%s)', deviceName, name, value);
        this.consumers.forEach(function(c) {
            var payload = [];
            if(explicitDouble) {
                payload.push({'methodName': 'event', 'params': [c.id, deviceName, name, {"explicitDouble": value}]});
            }
            else {
                payload.push({'methodName': 'event', 'params': [c.id, deviceName, name, value]});
            }
            logger.debug('rpc > method %s payload %s', 'system.multicall', JSON.stringify(payload));
            c.client.methodCall('system.multicall', [payload], function(err, value) {
                //TODO proper error handling
                if(err) {
                    logger.error(err);
                }
            });
        });
    }

    private _onNotFound(method, params) {
        logger.debug('_onNotFound(%s,%s)', method, params);
        logger.warn('Method %s does not exist', method);
    }

    private _onListMethods(err, params, callback) {
        logger.debug('rpc < system.listMethods %s', params);
        callback(null, ["system.listMethods","listDevices","getDeviceDescription","getLinks","getValue","setValue","getParamsetDescription","getParamsetId","getParamset","reportValueUsage","deleteDevice","getLinkPeers","system.methodHelp","putParamset","init","ping"]);
    }

    private _onInit(err, params, callback) {
        logger.debug('rpc < init %s', params);
        if(params[1]!==undefined && params[1]!=="") {
            logger.info('New connection request from %s', params[1]);
            if(this._removeConsumerByID(params[1])) {
                logger.info('Removed already existing consumer.');
            }

            var host = '';
            var port = '';
            var path = '';

            if(params[0].indexOf('http') > -1) {
              var d = params[0].replace('http://', '').split(':');
              host = d[0];
              port = d[1];
              if(port.indexOf('/') > -1) {
                d = port.split('/');
                port = d[0];
                path = '/' + d[1];
              }
            }
            else {
              var d = params[0].split(':');
              host = d[0];
              port = d[1];
            }
            var client = xmlrpc.createClient({host: host, port: port, path: path, encoding: 'ISO-8859-1'});
            this.consumers.push({'host': host, 'port': port, 'id': params[1], 'client': client});
            logger.info('Initiated new consumer: host %s port %s path %s id %s', host, port, path, params[1]);

            storage.initSync({dir: os.homedir() + '/.homeeup/persist/'});
            storage.setItemSync('homeeup-consumers', this.consumers);
        }
        callback(null,[]);
    }

    private _onPing(err, params, callback) {
        logger.debug('rpc < ping %s', params);

        if(params!==undefined) {
            this.consumers.forEach(function(c) {
                var payload = [];
                payload.push({'methodName': 'event', 'params': [c.id, 'CENTRAL', 'PONG', params[0]]});
                logger.debug('rpc > method %s payload %s', 'system.multicall', JSON.stringify(payload));
                c.client.methodCall('system.multicall', [payload], function(err, value) {
                    //TODO proper error handling
                    if(err) {
                        logger.error(err);
                        callback(err, value);
                    }
                });
            });
        }
        callback(null, 1);
    }

    private _onListDevices(err, params, callback) {
        logger.debug('rpc < listDevices %s', params);
        let that = this;
        let o = [];

        this.devices.forEach(function(d) {
            o = o.concat(d.getChannels());
        });
        logger.debug('rpc > %s', JSON.stringify(o));
        callback(null, o);

        //Hier gilt zu prüfen, ob es folgenden Geräte-Push noch braucht:
        setTimeout(function() {
            that.consumers.forEach(function(c) {
                var payload = [c.id, o];
                logger.debug('rpc > newDevices %s', payload);
                c.client.methodCall('newDevices', payload, function(err, value) {
                    //TODO proper error handling
                    if(err) {
                        logger.error(err);
                    }
                });
            });
        }, 500);
    }

    private _onGetParamset(err, params, callback) {
        logger.debug('rpc < getParamset %s', params);
        if(params[0].indexOf(':') == -1) {
            logger.debug('rpc > %s', JSON.stringify([]));
            callback(null, []);
            return;
        }
        else {
            var p = this._findParamset(params[0], params[1]);
            if(p!==null) {
                logger.debug('rpc > %s', JSON.stringify(p.value));
                callback(null, p.value);
                return;
            }
            else {
                logger.debug('rpc > %s', JSON.stringify({}));
                callback(null, {});
                return;
            }
        }
    }

    private _onGetParamsetDescription(err, params, callback) {
        logger.debug('rpc < getParamsetDescription %s', params);
        if(params[0].indexOf(':') == -1) {
            logger.debug('rpc > %s', JSON.stringify([]));
            callback(null, []);
            return;
        }
        else {
            var pd = this._findParamsetDescription(params[0], params[1]);
            if(pd!==null) {
                logger.debug('rpc > %s', JSON.stringify(pd.value));
                callback(null, pd.value);
                return;
            }
            else {
                logger.debug('rpc > %s', JSON.stringify({}));
                callback(null, {});
                return;
            }
        }
    }

    private _onPutParamset(err, params, callback) {
        logger.debug('rpc < putParamset %s', params);
        for(let i=0; i<this.devices.length; i++) {
            let d = this.devices[i];
            if(params[0].indexOf(d.deviceName+':') > -1) {
                d.putParamset(params);
                callback(null, '');
                return;
            }
        }
    }

    private _removeConsumerByID(id) {
        for(let i=0; i<this.consumers.length; i++) {
            if(this.consumers[i].id===id) {
                this.consumers.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    private _findParamset(name, type) {
        logger.debug('_findParamset(%s,%s)', name, type);
        for(let i=0; i<this.devices.length; i++) {
            var d = this.devices[i];
            var p = d.getParamset(name, type);
            if(p!==null)
                return p;
        };
        return null;
    }

    private _findParamsetDescription(name, type) {
        logger.debug('_findParamsetDescription(%s,%s)', name, type);
        for(let i=0; i<this.devices.length; i++) {
            var d = this.devices[i];
            var pd = d.getParamsetDescription(name, type);
            if(pd!==null)
                return pd;
        };
        return null;
    }

    private _initConsumers() {
        logger.debug('_initConsumers()');
        var that = this;

        storage.initSync({dir: os.homedir() + '/.homeeup/persist/'});
        let consumers = storage.getItemSync('homeeup-consumers');
        if(!consumers) {
            logger.info('No stored consumers found.');
            return;
        }
        for(let i=0; i<consumers.length; i++) {
            let c = consumers[i];

            let client = xmlrpc.createClient({host: c.host, port: c.port, path: c.path, encoding: 'ISO-8859-1'});
            that.consumers.push({'host': c.host, 'port': c.port, 'id': c.id, 'client': client});
            logger.info('Initiated new consumer from storage: host %s port %s path %s id %s', c.host, c.port, c.path, c.id);
        }

        logger.info('All consumers loaded from storage.');
    }

}

