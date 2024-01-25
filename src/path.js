const path = require('path');

module.exports = {
    MAIN_JS: __filename,
    MAIN_DIRECTORY: __dirname,
    RENFERER_DIRECTORY: path.join(__dirname, 'renferer'),
    HTML_DIRECTORY: path.join(__dirname, 'renferer', 'html'),
    PRELOAD_SCRIPT: path.join(__dirname, 'preload.js'),

    INDEX_HTML: path.join(__dirname, "main", 'renferer', 'html', 'index.html'),
    OVERLAY_HTML: path.join(__dirname, "main", 'renferer', 'html', 'overlay.html'),

    LOCAL_PIC: path.join(__dirname, "pic"),

};
