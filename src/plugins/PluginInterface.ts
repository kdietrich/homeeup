
export interface PluginInterface {

    name: String;
    deviceType: String;
    device;

    init(initParams, device) : void;

    onTurnOn() : void;
    onTurnOff() : void;
}