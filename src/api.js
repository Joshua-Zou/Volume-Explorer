const fetch = require("node-fetch")
const http = require('http');

module.exports.docker = async function docker(baseUrl, endpoint, method, mode, body) {
    if (mode === "TCP") {
        const url = `${baseUrl}/${endpoint}`;
        var options = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        }
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
        const json = await response.json();
        if (response.status !== 200) throw (`${response.status} error: ${json.message}`);
        return json;
    } else if (mode === "SOCKET") {
        let response = await socketFetch(baseUrl, endpoint, method, body);
        let json = JSON.parse(response[0]);
        if (response[1] !== 200) throw (`${response[1]} error: ${json.message}`);
        return json;
    }
}
function socketFetch(socketUrl, endpoint, method, body) {
    return new Promise((resolve, reject) => {
        var options = {
            socketPath: socketUrl,
            path: encodeURIComponent(endpoint).replace(/%2F/g, "/"),
            method: method
        };
        if (body) options.body = JSON.stringify(body);

        const callback = res => {
            res.setEncoding('utf8');
            res.on('data', data => resolve([data, res.statusCode]));
            res.on('error', data => reject([data, res.statusCode]));
        };

        const clientRequest = http.request(options, callback);
        clientRequest.end();
    })
}   