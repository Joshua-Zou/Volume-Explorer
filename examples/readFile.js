const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

VolumeExplorer.volume("volume name").readFile("/path/to/file.txt", "utf-8").then(data => {
    console.log("data: ", data)
})