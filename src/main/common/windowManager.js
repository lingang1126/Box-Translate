// windowManager.js
const globalManager = require('./globalManager');

function saveWindows(name, newWindow) {
    console.log("saveWindows", name)
    globalManager.windowInstances[name] = newWindow;
}

function deleteWindows(name) {
    console.log("deleteWindows", name)
    delete globalManager.windowInstances[name];
}

function getWindowByName(name) {
    return globalManager.windowInstances[name];
}


module.exports = { saveWindows, deleteWindows, getWindowByName };
