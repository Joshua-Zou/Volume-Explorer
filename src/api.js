const fetch = require("node-fetch")
module.exports.docker = async function docker(baseUrl, endpoint, method, body) {
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
}