const sharp = require('sharp');

function processImage() {
    const inputFilePath = '/Users/lg/soft/pic/screenshot.png';
    const outputFilePath = '/Users/lg/soft/pic/screenshot1.png';
    const compressionOptions = {
        quality: 80,
    };

    sharp(inputFilePath)
        .jpeg(compressionOptions)
        .toFile(outputFilePath, (err, info) => {
            if (err) {
                console.error(err);
            } else {
                console.log(info);
            }
        });
}

module.exports = {processImage};