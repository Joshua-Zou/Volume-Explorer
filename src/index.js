const fetch = require("node-fetch")
const Volume = require("./volume.js")

module.exports = class Configure {
    /**
     * @param {Object} [config] - Configure Docker API location
     * @param {string} [config.protocol] - Protocol to use (http or https)
     * @param {string} [config.host] - Hostname to use (default: localhost)
     * @param {number} [config.port] - Port to use (default: 2375)
     * @param {string} [config.forcePlatformType] - Force the platform type to use (default: _blank)
     */
    constructor(config = {}) {
        this.protocol = config.protocol || "http";
        this.host = config.host || "localhost";
        this.port = config.port || 2375;
        this.apiUrl = `${this.protocol}://${this.host}:${this.port}`;
        this.platform = config.forcePlatformType || process.platform;

        if (this.protocol !== "http" && config.protocol !== "https") throw ("Error: Invalid protocol; must be http or https");
        var supportedPlatforms = ["linux", "win32"];
        if (supportedPlatforms.indexOf(this.platform) === -1) throw ("Error: Unsupported platform type");

        fetch(this.apiUrl).catch(err => {
            throw ("Error: Could not access docker API at " + this.apiUrl);
        })
    }
    /**
     * @param {Object} name - The name of the volume to explore
     */
    volume(name) {
        return new Volume(this.apiUrl, name, this.platform)
    }
}



