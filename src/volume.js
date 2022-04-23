
const api = require("./api.js")
const fs = require('fs');
const path = require("path")


module.exports = class Volume {
    constructor(baseUrl, name, platform) {
        this.baseUrl = baseUrl;
        this.name = name;
        var platformPaths = {
            win32: "\\\\wsl$\\docker-desktop-data\\version-pack-data\\community\\docker\\volumes",
            linux: "/var/lib/docker/volumes/"
        }
        this.volumePath = platformPaths[platform];
    }
    /**
     * @returns {Object}
     * @description Returns volume information asynchronously
     */
    async inspect() {
        return await api.docker(this.baseUrl, "/volumes/" + this.name, "GET")
    }
    /**
     * @returns {string}
     * @description Returns where the volume is located on host machine asynchronously
     */
    async getLocalPath() {
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        return `${this.volumePath}/${mountname}`
    }
    /**
     * @param {string} [path=/] - The path to the directory to explore 
     * @description Returns an array of files and directories in path asynchronously
     */
    async readDir(path = "/") {
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            let f = fs.readdirSync(`${this.volumePath}/${mountname}${path}`, { withFileTypes: true })
            let result = [];
            f.forEach(entry => {
                if (entry.isDirectory()) {
                    result.push({
                        name: entry.name,
                        type: "directory"
                    })
                } else {
                    result.push({
                        name: entry.name,
                        type: "file"
                    })
                }
            })
            return result
        } catch (err) {
            throw ("Error: Could not read directory! Check if directory exists or if you have permissions to read it.\n    " + err.toString())
        }
    }
    /**
     * @param {string} path - The path to the file to read
     * @param {string} encoding - Encoding of the file to be read (utf-8)
     * @returns {Buffer|string}
     * @description Returns the contents of a file asynchronously
     */
    async readFile(path, encoding) {
        if (!path) throw ("Error: No path specified!")
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            return fs.readFileSync(`${this.volumePath}/${mountname}${path}`, encoding)
        } catch (err) {
            throw ("Error: Could not read file! Check if the file exists, or if you have the permission to read it.\n    " + err.toString())
        }
    }
    /**
    * @param {string} source - The path to the source file 
    * @param {string} destination - The path to the destination location.
    * @returns {boolean}
    * @description Copies a file from the volume into the host machine asynchronously
    */
    async copyFile(source, destination) {
        if (!source) throw ("Error: No source specified!")
        if (!destination) throw ("Error: No destination specified!")
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            fs.copyFileSync(`${this.volumePath}/${mountname}${source}`, `${destination}`);
            return true;
        } catch (err) {
            throw ("Error: Could not copy file! Check if the file exists, if you have the permission to copy it, or if the destination is valid\n    " + err.toString())
        }
    }
    /**
     * @param {string} [source=/] - The path to the source directory 
     * @param {string} destination - The path to the destination location.
     * @param {Function} [progressCallback] - [Optional] A callback function to be called everytime a **file** is copied. This function returns a progres object
     * @returns {boolean|Promise}
     * @description Copies an entire directory from the volume into the host machine asynchronously
     */
    async copyDir(source = "/", destination, progressCallback) {
        if (!source) throw ("Error: No source specified!")
        if (!destination) throw ("Error: No destination specified!")
        if (!progressCallback) progressCallback = function () { }
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            return copyDirectory(`${this.volumePath}/${mountname}${source}`, `${destination}`, progressCallback);
        } catch (err) {
            throw ("Error: Could not copy directory! Check if the directory exists, if you have the permission to copy it, or if the destination is valid\n    " + err.toString())
        }
    }
    /**
     * @param {string} [source=/] - The path to the source directory 
     * @param {string} destination - The path to the destination location.
     * @param {Function} [progressCallback] - [Optional] A callback function to be called everytime a **file** is copied. This function returns a progres object
     * @description Copies an entire directory from the volume into the host machine with status updates (useful for copying large directories) synchronously
     */
    async copyDirSync(source = "/", destination) {
        if (!source) throw ("Error: No source specified!")
        if (!destination) throw ("Error: No destination specified!")
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/");
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            return await copyDirectory(`${this.volumePath}/${mountname}${source}`, `${destination}`);
        } catch (err) {
            throw ("Error: Could not copy directory! Check if the directory exists, if you have the permission to copy it, or if the destination is valid\n    " + err.toString())
        }
    }
    /**
     * @param {string} path - The path to the file to read
     * @returns {Object}
     * @description returns the stats of a file asynchronously (like fs.stat)
     */
    async stat(path) {
        if (!path) throw ("Error: No path specified!")
        let mountpoint = await api.docker(this.baseUrl, "/volumes/" + this.name, "GET");
        mountpoint = mountpoint.Mountpoint.split("/")
        let mountname = mountpoint.slice([mountpoint.length - 2]).join("/")
        try {
            return fs.statSync(`${this.volumePath}/${mountname}${path}`)
        } catch (err) {
            throw ("Error: Could not read file! Check if the file exists, or if you have the permission to read it.\n    " + err.toString())
        }
    }
}
function copyDirectory(source, destination, progressCallback) {
    if (!progressCallback) {
        copyRecursiveSync(source, destination);
        function copyRecursiveSync(src, dest) {
            var exists = fs.existsSync(src);
            var stats = exists && fs.statSync(src);
            var isDirectory = exists && stats.isDirectory();
            if (isDirectory) {
                fs.mkdirSync(dest);
                let children = fs.readdirSync(src);
                children.forEach(function (childItemName) {
                    copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
                });
            } else {
                fs.copyFileSync(src, dest);
            }
        };
        return true
    } else {
        return new Promise((resolve, reject) => {
            var jobs = 0;
            var finished = -1;
            var runningOperations = 0;
            copyRecursive(source, destination);
            async function copyRecursive(src, dest) {
                runningOperations += 1;
                var exists = fs.existsSync(src);
                var stats = exists && fs.statSync(src);
                var isDirectory = exists && stats.isDirectory();
                if (isDirectory) {
                    fs.mkdirSync(dest);
                    fs.readdir(src, function (err, files) {
                        sendStatus();
                        files.forEach(function (childItemName) {
                            jobs += 1;
                            copyRecursive(path.join(src, childItemName),
                                path.join(dest, childItemName));
                        });
                        runningOperations -= 1;
                    });
                } else {
                    fs.copyFile(src, dest, function(){
                        runningOperations -= 1;
                        sendStatus();
                    })
                }
            };
            function sendStatus() {
                finished += 1;
                progressCallback({ finished, jobs, runningOperations, status: "working" });
                if (finished === jobs && runningOperations === 0) {
                    progressCallback({ finished, jobs, runningOperations, status: "done" });
                    resolve(true)
                }
            }
        })
    }
}