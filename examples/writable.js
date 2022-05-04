const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

VolumeExplorer.volume("test").writable().then(writableVolume => {

    // writing to a file
    writableVolume.writeFile("/test.txt", "testboiasdf");

    // deleting a file
    writableVolume.unlink("/test.txt");

    // creating a directory
    writableVolume.mkdir("/test");

    // deleting a directory
    writableVolume.rmdir("/test");

    // copying a file into the volume
    writableVolume.copyFileIntoVolume("./myFile.txt", "/destination.txt");
})

