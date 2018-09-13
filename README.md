# homeeUp

## Use virtual devices in homee. <3

(C) 2018, Kevin Dietrich

homeeUp allows you to use virtual devices in the smart home hub homee by exposing them via a simulated Homematic CCU (don't worry - you don't need a physical CCU). homeeUp is based on plugins so feel free to add your own ones by providing pull requests.

Currently it is possible to simulate switches (HM-LC-Sw1-FM), motion sensors (HM-Sec-MDIR-2), door contacts (HM-Sec-SC-2) and remote controls (HM-RC-4-2).

## How-to

1. Install homeeUp: `sudo npm install -g homeeup`
2. Create a `config.json` file using the template below inside your user home: ~/.homeeup/config.json
3. Start it up: `LOG=info homeeup`
4. Add a new Homematic CCU to homee.

Alternatively you could use [**homeean**](https://himpler.com/homeean) to install homeeUp on a Raspberry Pi with a plain vanilla Raspbian installation. homeean is a web based buildtool, which generates an individual buildscript (Bash-Script) for user selected Smart Home Tools to be installed on a Raspberry Pi running on Raspbian. homeeUp is provided as an homeean install option.

## Sample config.js

```
{
        "hostAddress": "IP_OF_YOUR_DEVICE_RUNNING_HOMEEUP",
        "plugins": [
            {
                "deviceName": "HTTPSwitch",
                "type": "SimpleHTTPPlugin",
                "pluginParams": {
                    "onUrl": "http://www.google.de/on",
                    "offUrl": "http://www.google.de/off"
                }
            },
            {
                "deviceName": "CMDSwitch",
                "type": "SimpleCMDPlugin",
                "pluginParams": {
                    "onCmd": "touch /tmp/file",
                    "offCmd": "rm /tmp/file",
                    "statusCmd": "ls /tmp/file >> /dev/null; echo $?",
                    "checkInterval": 2000
                }
            }
        ]
}
```

This sample config exposes two switches to homee: HTTPSwitch and CMDSwitch. The former calls a http url when switched on or off. The latter one runs a cmd command when switched on or off. It also has a build in statusCmd that checks if the status has changed (outside of homee) and keeps it up-to-date.

## Plugins

### 1. SimpleHTTPPlugin

This plugin exposes a single switch to homee. When switched the given http url will be called.

```
{
        "deviceName": "HTTPSwitch",
        "type": "SimpleHTTPPlugin",
        "pluginParams": {
                "onUrl": "http://www.google.de/on",
                "offUrl": "http://www.google.de/off"
        }
}
```

### 2. SimpleCMDPlugin

This plugin exposes a single switch to homee. When switched the given cmd statement will be executed. It also provides a status cmd statement that will be called every seconds (defined in `checkInterval`). Depending on that result, the switch will be changed. This allows reflecting external changes in homee.

```
{
        "deviceName": "CMDSwitch",
        "type": "SimpleCMDPlugin",
        "pluginParams": {
                "onCmd": "touch /tmp/file",
                "offCmd": "rm /tmp/file",
                "statusCmd": "ls /tmp/file >> /dev/null; echo $?",
                "checkInterval": 2000
        }
}
```

### 3. FritzBoxPlugin (FritzBox Guest Wifi)

This plugin exposes a switch to homee that lets you de/activate your guest wifi using an AVM FritzBox.

```
{
        "deviceName": "FritzGuestWifi",
        "type": "FritzBoxPlugin",
        "pluginParams": {
                "ipAddress": "http://fritz.box/",
                "user": "username",
                "password": "password"
        }
}
```

### 4. SimpleMQTTPlugin

todo

### 5. VorwerkKoboldPlugin (Vorwerk Kobold VR200)

Exposes a switch to homee that lets you start/stop your Vorwerk Kobold VR200. It also exposes a door contact that shows if the robot is in the dock.

```
{
        "deviceName": "VorwerkKobold",
        "type": "VorwerkKoboldPlugin",
        "pluginParams": {
                "email": "your@email.com",
                "password": "password"
        }
}
```

## Troubleshooting

Feel free to open an issue if you experience any issues. However please start homeeUp using `LOG=debug homeeup` to generate debug output and attach it to your issue.

## Changes

#### v0.1.5 (2018-09-13)
- Install bugfix

#### v0.1.4 (2018-09-11)
- SimpleCMDPlugin: statusCmd is optional
- SimpleCMDPlugin: pauseCheckIntervalAfterSwitch
- New: Debug plugin
- Docker integration
- Bugfixes

#### v0.1.3 (2018-07-14)
- New: Vorwerk VR200 plugin
- Motion sensor and door contacts supported
- Changes to plugin architecture

#### v0.1.2 (2018-03-23)
- New: MQTT plugin
- New: FRITZ!Box plugin
- Config file is now in json format and stored in user home
- Bugfixes

#### v0.1.1 (2018-03-21)
- Installation made easier

#### v0.1.0 (2018-03-21)
- First version

## License

The MIT License (MIT)

Copyright (c) 2018 Kevin Dietrich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
