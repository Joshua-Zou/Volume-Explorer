const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

VolumeExplorer.volume("your volume").stat("/myfile.txt").then(data => {
    console.log(data)
})