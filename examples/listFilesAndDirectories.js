const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

VolumeExplorer.volume("volume name").readDir("/").then(data => {
    console.log(data)
})