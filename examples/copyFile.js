const volumeExplorer = require("../src/index.js");
const VolumeExplorer = new volumeExplorer();

VolumeExplorer.volume("volume name").copyFile("/path/to/file.txt", "./outputfile.txt").then(data => {
    console.log("Completed: ", data)
})