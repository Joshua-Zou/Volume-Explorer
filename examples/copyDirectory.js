const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

// Simply copying a directory
VolumeExplorer.volume("volume name").copyDirSync("/", "./output").then(data => {
    console.log("Completed: ", data)
})

// Copying a directory asynchronously with progress updates - ~40% performance improvement!
VolumeExplorer.volume("volume name").copyDir("/", "./output", function(status) {
    console.log(status)
}).then(status => {
    console.log("Completed: ", status)
})