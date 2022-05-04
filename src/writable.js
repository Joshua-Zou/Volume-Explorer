const api = require("./api.js")
const fs = require('fs');
const path = require("path");


module.exports = class Writable {
    constructor(baseUrl, name, volumePath, mode, mountname) {
        this.baseUrl = baseUrl;
        this.name = name;
        this.volumePath = volumePath;
        this.mode = mode;
        this.mountname = mountname;
    }
    /**
     * @param {string} path - The path in the volume to write to
     * @param {string} data - The data to be written
     * @param {string} [encoding=utf-8] - (Optional) The encoding to use - defaults to utf-8
     * @returns {boolean} - Returns true if the write was successful
     * @description - Writes data to a file inside of the volume
     */
    writeFile(path, data, encoding) {
        if (!path) throw ("Error: No path specified!");
        if (!data) throw ("Error: No data specified!");
        try {
            fs.writeFileSync(`${this.volumePath}/${this.mountname}/${path}`, data, encoding || "utf-8");
            return true;
        } catch (err) {
            throw ("Error: Could not write file! Check if the parent directory exists, or if you have the permission to write to it.\n    " + err.toString())
        }
    }
    /**
     * @param {string} path - The path in the volume to delete
     * @returns {boolean} - Returns true if the operation was successful
     * @description - Deletes a file inside of the volume
     */
    unlink(path) {
        if (!path) throw ("Error: No path specified!");
        try {
            fs.unlinkSync(`${this.volumePath}/${this.mountname}/${path}`);
            return true;
        } catch (err) {
            throw ("Error: Could not delete file! Check if the file exists, or if you have the permission to delete it.\n    " + err.toString())
        }
    }
    /**
     * @param {string} path - The path in the volume to create
     * @param {boolean} [mode=false] - (Optional) The mode to use for the directory (defaults to false)
     * @returns {boolean} - Returns true if the operation was successful
     * @description - Creates a directory inside of the volume
     */
    mkdir(path, mode) {
        if (!path) throw ("Error: No path specified!");
        try {
            fs.mkdirSync(`${this.volumePath}/${this.mountname}/${path}`, mode);
            return true;
        } catch (err) {
            throw ("Error: Could not create directory! Check if the parent directory exists, if the directory already exists, or if you have the permission to create it.\n    " + err.toString())
        }
    }
    /**
     * @param {string} path - The path in the volume to delete
     * @param {Object} [options={}] - (Optional) The options to use for the directory, can set to recursivly delete non-empty directory (defaults to {})
     * @returns {boolean} - Returns true if the operation was successful
     * @description - Deletes a directory inside of the volume
     */
    rmdir(path, options = {}) {
        if (!path) throw ("Error: No path specified!");
        try {
            fs.rmdirSync(`${this.volumePath}/${this.mountname}/${path}`, options);
            return true;
        } catch (err) {
            throw ("Error: Could not delete directory! Check if the directory exists, or if you have the permission to delete it.\n    " + err.toString())
        }
    }
    /**
     * @param {string} src - The path in the host to copy from
     * @param {string} dest - The path in the volume to copy to
     * @returns {boolean} - Returns true if the operation was successful
     * @description - Copies a file from the host to the volume
     */
    copyFileIntoVolume(src, dest) {
        if (!src) throw ("Error: No source path specified!");
        if (!dest) throw ("Error: No destination path specified!");
        try {
            fs.copyFileSync(src, `${this.volumePath}/${this.mountname}/${dest}`);
            return true;
        } catch (err) {
            throw ("Error: Could not copy file! Check if the source file exists, or if you have the permission to copy it.\n    " + err.toString())
        }
    }
}