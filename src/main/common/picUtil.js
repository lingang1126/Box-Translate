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


// 引入模块
const tesseract = require('node-tesseract-ocr');

// 设置 Tesseract OCR 的选项
const config = {
    lang: 'chi_sim+jpn+eng',
    // lang: 'chi_sim+jpn+eng',
    oem: 1, // 使用 OEM Tesseract engine mode 1
    psm: 3, // 使用自动页面分割模式
    tessdata: "/Users/lg/soft/tes/tess"
};

/**
 * 调用 Tesseract OCR 进行图像识别
 *
 * @param lang
 * @param picPath
 */
async function tesseractUtil(lang, picPath) {
    const start = performance.now();
    process.env.TESSDATA_PREFIX = '/Users/lg/soft/tes/tess';
    if (typeof lang === 'string' && lang.trim() !== '') {
        config.lang = lang
    }

    return tesseract
        .recognize(picPath, config)
        .then(text => {
            // console.log('识别结果:', text);

            const end = performance.now();
            const executionTime = end - start;
            console.log('方法执行时间：', executionTime, '毫秒');
            console.log('识别结果：', text);
            return text;
        })
        .catch(error => {
            console.error('识别出错:', error);
        });
}

const {createCanvas, loadImage} = require('canvas');

/**
 * 灰度化
 * @param inputPath
 * @param outputPath
 * @return {Promise<void>}
 */
async function grayscaleImageAndSave(inputPath, outputPath) {
    // 加载图像
    const image = await loadImage(inputPath);

    // 创建 Canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 在 Canvas 上绘制图像
    ctx.drawImage(image, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 转换为灰度图像
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0);

    // 将处理后的图像保存到指定路径
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

}

/**
 * 二极化
 * @param inputPath
 * @param outputPath
 * @param threshold
 * @return {Promise<void>}
 */
async function binarizeImageAndSave(inputPath, outputPath, threshold) {
    // 加载图像
    const image = await loadImage(inputPath);

    // 创建 Canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 在 Canvas 上绘制图像
    ctx.drawImage(image, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 二值化处理
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        const binaryValue = gray < threshold ? 0 : 255;
        imageData.data[i] = binaryValue;
        imageData.data[i + 1] = binaryValue;
        imageData.data[i + 2] = binaryValue;
    }

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0);

    // 将处理后的图像保存到指定路径
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

/**
 * 灰度化并二值化图像，然后保存
 * @param inputPath
 * @param outputPath
 * @param threshold 二值化阈值
 * @return {Promise<void>}
 */
async function grayscaleAndBinarizeImageAndSave(inputPath, outputPath, threshold) {
    const start = performance.now();

    // 加载图像
    const image = await loadImage(inputPath);

    // 创建 Canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 在 Canvas 上绘制图像
    ctx.drawImage(image, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 转换为灰度图像并进行二值化处理
    for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const binaryValue = gray < threshold ? 0 : 255;
        data[i] = binaryValue;
        data[i + 1] = binaryValue;
        data[i + 2] = binaryValue;
    }

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0);

    // 将处理后的图像保存到指定路径
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    const end = performance.now();
    const executionTime = end - start;
    console.log('图片二值化结束 耗时：', executionTime, '毫秒');
}


/**
 * 边缘增强
 * @param inputPath
 * @param outputPath
 * @return {Promise<void>}
 */
async function enhanceEdgesAndLocateText(inputPath, outputPath) {
    // 加载图像
    const image = await loadImage(inputPath);

    // 创建 Canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 在 Canvas 上绘制灰度图像
    ctx.drawImage(image, 0, 0);

    // 边缘增强
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i]; // 灰度值
        const left = data[i - 4] || gray;
        const right = data[i + 4] || gray;
        const top = data[i - canvas.width * 4] || gray;
        const bottom = data[i + canvas.width * 4] || gray;

        const edge = Math.abs(gray * 4 - (left + right + top + bottom));
        data[i] = edge;
        data[i + 1] = edge;
        data[i + 2] = edge;
    }

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0);

    // 保存处理后的图像到输出路径
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}


module.exports = {
    compressionImage: compressionImage,
    resetDir,
    imageHashCheck,
    tesseractUtil,
    grayscaleImageAndSave,
    enhanceEdgesAndLocateText,
    binarizeImageAndSave,
    grayscaleAndBinarizeImageAndSave
};
