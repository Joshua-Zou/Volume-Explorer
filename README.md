# Docker Volume Explorer

## Table of Contents
- [About](#about)
- [Quickstart](#quickstart)
- [Examples](#examples)
- [Documentation](#documentation)
  * [Configuration Object](#configuration-object)
  * [Volume Object](#volume-object)
  * [Writable Volume object](#writable-volume-object)

## About
Docker Volume Explorer allows you to easily interact with Docker volumes in Windows and Linux systems (Macos support coming soon). You can read, copy, and list all files inside of the volume.
## Quickstart
Simply initialize the `VolumeExplorer` object with your desired parameters (see documentation), access a volume, and perform your desired operation.
```js
const volumeExplorer = require("volume-explorer");
const VolumeExplorer = new volumeExplorer();

const myVolume = VolumeExplorer.volume("your docker volume name")
myVolume.readDir("/").then(data => {
	console.log(data)
})
```
## Examples
[Click here](https://github.com/Joshua-Zou/Volume-Explorer/tree/main/examples)
## Documentation
### Configuration Object
When initializing the `VolumeExplorer` object, a configuration object such as below can be passed in (not required).
```js
const VolumeExplorer = new volumeExplorer({
	protocol: "http" || "https", // (optional) - specify Docker API endpoint protocol
	host: "localhost" || "127.0.0.1", // (optional) - specify Docker API hostname,
	port: 2375, // (optional) - specify Docker API port
	forcePlatformType: "win32" || "linux", // (optional),
	socketPath: "/path/to/socket/docker.sock" // (optional) - specify Docker socket path
})
```
### Volume Object
**Initialization** 
```js
const volume = VolumeExplorer.volume("volume name")
```
*Important:* This does not query the API or do anything with the volume name. If the volume name doesn't exist, it WILL NOT fail here. Instead, it will fail when attempting an operation on this volume object.\
\
**.inspect**\
Inspect  a volume and return information on it
```js
volume.inspect().then(data => {
	console.log(data)
})
```
Returns an object similar to below: 
```json
{
	"Name": "tardis",
	"Driver": "custom",
	"Mountpoint": "/var/lib/docker/volumes/tardis",
	"Status": {
		"hello": "world"
	},
	"Labels": {
		"com.example.some-label": "some-value",
		"com.example.some-other-label": "some-other-value"
	},
	"Scope": "local",
	"CreatedAt": "2016-06-07T20:31:11.853781916Z"
}
```
**.getLocalPath**\
Returns the location of the volume on the host machine
```js
volume.getLocalPath().then(path => {
	console.log(path)
})
```
**.readDir**\
Returns an array of files and directories in the specified path in the volume\
Arguments:

 - path (default="/") - Specify the path to the directory in the volume. Must begin with "/"
```js
volume.readDir("/path/to/directory").then(entries => {
	console.log(entries)
})
```
Returned array may look like below:
```js
[ { name: 'file.txt', type: 'file' }, { name: 'folder', type: 'directory' }]
```
**.readFile**\
Returns a Buffer or string representing the data in the file\
Arguments:
 - path (required) - The path to the file to be read
 - encoding (required) - The encoding used to read the file (utf-8)
```js
volume.readFile("/myfile.txt", "utf-8").then(data => {
	console.log(data)
})
```
**.copyFile**\
Returns `true` if it successfully copied the file from the volume into the host machine\
Arguments:
 - Source (required) - The path to the file to be copied in the volume
 - Destination (required) - The path to the destination file in the host machine
```js
volume.copyFile("./configuration.txt", "./hello.txt").then(status => {
	console.log(status)
})
```
**.copyDirSync**\
Copying a directory using standard synchronous functions. However, this function is *still asynchronous*! So, this is not recommended and users should consider using `copyDir` as this function is much faster.
Arguments:
 - Source (required) - The path to the file to be copied in the volume
 - Destination (required) - The path to the destination file in the host machine
```js
volume.copyDirSync("/", "./output").then(status=> {
    console.log("Completed: ", status)
})
```

**.copyDir**\
Copying a directory using custom asynchronous computing, resulting in a 40-50% performance improvement in large folders with many sub-folders (like node_modules). *Recommended over `copyDirSync`*
Arguments:
 - Source (required) - The path to the file to be copied in the volume
 - Destination (required) - The path to the destination file in the host machine
 - Status callback (optional) - A function callback that gets executed to update the status (percentage discovered, percentage completed, and amount of queued up/running operations)
```js
volume.copyDir("/", "./output", function(status) {
   // this gets run many times to update you on the current status.
    console.log(status.finished, status.jobs, status.runningOperations, status.status)
}).then(status => {
   // this gets run when everything is done
    console.log("Completed: ", status)
})
```
**.stat**\
Returns an object describing the file's metadata. Returns an fs.stat() object\
Arguments:
 - Path (required) - The path to the file
 ```js
 volume.stat("/myfile.txt").then(data => {
    console.log(data)
 })
 ```

**.writable**\
Returns a WritableVolume object asynchronously
Arguments:
- None
### Writable Volume object

**.writeFile**\
Synchronously writes a file into the docker volume. Returns a boolean regarding status.\
Arguments:
 - path (required) - The path in the volume to write to
 - data (required) - The data to be written
 - encoding (default=`utf-8`) - The encoding to use
```js
VolumeExplorer.volume("my volume name").writable().then(writableVolume => {
    writableVolume.writeFile("/myfile.txt", "hello world!");
})
```
**.unlink**\
Synchronously removes a file from your volume. Returns a boolean regarding its status.\
Arguments:
 - path (required) - The path to the file in the volume to remove
```js
VolumeExplorer.volume("my volume name").writable().then(writableVolume => {
    writableVolume.unlink("/myfile.txt");
})
```
**.mkdir**\
Synchronously creates a directory in your volume. Returns a boolean regarding its status.\
Arguments:
 - path (required) - The path to the file in the volume to remove
 - mode (default=`false`) - If `true`, will recursivly create the directory (see `fs` documentation)
```js
VolumeExplorer.volume("my volume name").writable().then(writableVolume => {
    writableVolume.mkdir("/myfolder");
})
```
**.rmdir**\
Synchronously removes a directory from your volume. Returns a boolean regarding its status.\
Arguments:
 - path (required) - The path to the file in the volume to remove
 - mode (default=`{}`) - If `{recursive: true}`, will delete a non-empty directory
```js
VolumeExplorer.volume("my volume name").writable().then(writableVolume => {
    writableVolume.rmdir("/myfolder");
})
```
**.copyFileIntoVolume**\
Synchronously copies a file from host system into your volume. Returns a boolean regarding its status.\
Arguments:
 - src (required) - The path in the host to copy from
 - dest (required) - The path in the volume to copy to
```js
VolumeExplorer.volume("my volume name").writable().then(writableVolume => {
	writableVolume.copyFileIntoVolume("./myFile.txt", "/destination.txt");
})
```
 ![](https://analytics-server-orpin.vercel.app/api/npm_package?name=volume-explorer)