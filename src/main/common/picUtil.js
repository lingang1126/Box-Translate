const fs = require('fs');
const sharp = require('sharp');
const imageHash = require('image-hash');
const {promisify} = require('util');

// 内部引用
const paths = require('../../path.js');

/**
 * 图片压缩
 */
// async function processImage(inputFilePath) {
//     // const inputFilePath = '/Users/lg/IdeaProjects/Box-Translate/src/pic/2.jpg';
//     // const outputFilePath = '/Users/lg/IdeaProjects/Box-Translate/src/pic/2-3.jpg';
//
//     const modifiedFilePath = inputFilePath.replace('.jpg', '-compress.jpg');
//
//     const compressionOptions = {
//         quality: 80,
//     };
//
//     let flag = false;
//     await sharp(inputFilePath)
//         .jpeg(compressionOptions)
//         .toFile(modifiedFilePath, (err, info) => {
//             if (err) {
//                 console.error(err);
//             } else {
//                 console.log(info);
//                 flag = true;
//             }
//         });
//     return true ? modifiedFilePath : '';
// }

// 将 sharp.toFile 方法转换为 Promise

const toFileAsync = promisify(sharp().toFile);

async function compressionImage(inputFilePath, compressionOptions, modifiedFilePath) {
    try {
        // 使用 await 等待异步操作完成
        const info = await sharp(inputFilePath).jpeg(compressionOptions).toFileAsync(modifiedFilePath);

        // 处理成功，打印信息或执行其他逻辑
        console.log(info);
        return true;
    } catch (err) {
        // 处理错误，打印错误信息或执行其他错误处理逻辑
        console.error(err);
        return false;
    }
}

// 调用函数
// let flag = await compressionImage(inputFilePath, compressionOptions, modifiedFilePath);


/**
 * 重置图片文件夹
 */
function resetDir() {
    // 检查文件夹是否存在
    if (fs.existsSync(paths.LOCAL_PIC)) {
        // 如果存在，则删除文件夹及其内容
        fs.rmSync(paths.LOCAL_PIC, {recursive: true});
    }

    // 创建新的文件夹
    fs.mkdirSync(paths.LOCAL_PIC);
}


/**
 * 读取图片文件并计算哈希值
 * @param firPic
 * @param secPic
 * @return true 一致 false 不一致
 */
function imageHashCheck(firPic, secPic) {
    // const oldSrc = '/Users/lg/IdeaProjects/Box-Translate/src/pic/1.jpg';
    // const oldSrc2 = '/Users/lg/IdeaProjects/Box-Translate/src/pic/2-2.jpg';

    const buffer1 = fs.readFileSync(firPic);
    const buffer2 = fs.readFileSync(secPic);

    const bufferObject1 = {data: buffer1};
    const bufferObject2 = {data: buffer2};

    try {
        imageHash.imageHash(bufferObject1, 16, true, (error, hash1) => {
            if (error) throw error;

            imageHash.imageHash(bufferObject2, 16, true, (error, hash2) => {
                if (error) throw error;

                // 比较哈希值
                if (hash1 === hash2) {
                    console.log('图片一致');
                    return true;
                } else {
                    console.log('图片不一致');
                    return false;
                }
            });
        });
    } catch (e) {
        console.error("imageHashCheck 图片校验失败", e);
    }
    return false;
}


module.exports = {compressionImage: compressionImage, resetDir, imageHashCheck};