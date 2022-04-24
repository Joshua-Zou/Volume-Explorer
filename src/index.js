const fetch = require("node-fetch")
const Volume = require("./volume.js")
const api = require("./api.js")

var supportedPlatforms = ["linux", "win32"];
var platformSocketPaths = {
    "linux": "/var/run/docker.sock",
    "win32": "\\\\.\\pipe\\docker_engine"
}

module.exports = class Configure {
    /**
     * @param {Object} [config] - Configure Docker API location
     * @param {string} [config.protocol] - Protocol to use (http or https)
     * @param {string} [config.host] - Hostname to use (default: localhost)
     * @param {number} [config.port] - Port to use (default: 2375)
     * @param {string} [config.forcePlatformType] - Force the platform type to use (default: _blank)
     * @param {string} [config.socketPath] - Use a UNIX socket instead of a TCP connection (default)
     */
    constructor(config = {}) {
        this.platform = config.forcePlatformType || process.platform;
        if (supportedPlatforms.indexOf(this.platform) === -1) throw ("Error: Unsupported platform type");
        if (config.port || config.protocol || config.host) {
            this.protocol = config.protocol || "http";
            this.host = config.host || "localhost";
            this.port = config.port || 2375;
            this.apiUrl = `${this.protocol}://${this.host}:${this.port}`;
            if (this.protocol !== "http" && config.protocol !== "https") throw ("Error: Invalid protocol; must be http or https");
            this.mode = "TCP"
        } else {
            this.apiUrl = config.socketPath || platformSocketPaths[this.platform];
            this.mode = "SOCKET"
        }

        api.docker(this.apiUrl, "/version", "GET", this.mode)
    }
    /**
     * @param {Object} name - The name of the volume to explore
     */
    volume(name) {
        return new Volume(this.apiUrl, name, this.platform, this.mode)
    }
}



