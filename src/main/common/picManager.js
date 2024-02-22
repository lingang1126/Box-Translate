// picManager.js
const fs = require('fs');

const globalManager = require('./globalManager');
const {compressionImage, resetDir, imageHashCheck, tesseractUtil, grayscaleAndBinarizeImageAndSave} = require('./picUtil');
const {sendTencentCloudAPIRequest} = require('./txTranslate.js');
const windowManager = require("./windowManager");
const outputWindowName = 'outputWindow'

class PicInfo {
    // 构造方法
    constructor(id, picPath) {
        this.id = id;
        this.picPath = picPath;
    }
}

/**
 * 获取图片下个id
 * @returns {number}
 */
function getNextPicId() {
    globalManager.picId = globalManager.picId + 1;
    return globalManager.picId;
}

function getCurrentPicId() {
    return globalManager.picId;
}

/**
 * 上一个图片数据操作
 */
function getLastSuccessPicId() {
    return globalManager.lastSuccessPicId;
}

function setLastSuccessPicId(lastSuccessPicId) {
    globalManager.lastSuccessPicId = lastSuccessPicId;
}

/**
 *  PicInfos 数据操作
 */
function addPicInfo(picInfo) {
    globalManager.picInfos[picInfo.id] = picInfo;
}

function getPicInfoById(id) {
    return globalManager.picInfos[id];
}

function updatePicInfoById(id, picPath) {
    globalManager.picInfos[id].picPath = picPath;
}

function deletePicInfoById(id) {
    if (globalManager.picInfos[id]) {
        delete globalManager.picInfos[id];
    }
}

function getPicInfos() {
    return globalManager.picInfos;
}

/**
 * 图片后续处理 (处理 和 校验)
 */
async function processAndCheck(picId) {
    let picInfo = getPicInfoById(picId);
    if (picInfo === null || picInfo === undefined) {
        return;
    }

    let filePath = picInfo.picPath;
    // 1. 图片压缩 -- 先不进行图片压缩
    // const modifiedFilePath = filePath.replace('.jpg', '-compress.jpg');
    // const compressionOptions = {
    //     quality: 80,
    // };
    // let newPicPath = await compressionImage(filePath, compressionOptions, modifiedFilePath);
    // if (typeof newPicPath === 'string' && newPicPath.trim() !== '') {
    //     // 字符串是可用的，不是空字符也不是undefined 更新地址
    //     updatePicInfoById(picId, newPicPath)
    //     // 删除老的图片
    //     fs.unlinkSync(filePath);
    //     picInfo = newPicPath;
    // }

    // 2. 图片比对
    let lastSuccessPicId = getLastSuccessPicId();
    let hashCheckFlag = false;
    if (lastSuccessPicId !== 0) {
        let lastSuccessPicInfo = getPicInfoById(lastSuccessPicId);
        hashCheckFlag = imageHashCheck(filePath, lastSuccessPicInfo.picPath);
    }

    if (hashCheckFlag) {
        console.log("图片一致无需发送翻译处理 picId", picId)
        return;
    }


    // 3. 删除掉 所有id 小于lastSuccessPicId的图片数据 单独调用一个异步方法去做
    clearPic(lastSuccessPicId);

    // 4. 替换 lastId
    setLastSuccessPicId(picInfo.id);
    // 4. 图片数据传输的话 放外面调用 单独写一个方法

    // 图片预处理
    // 灰度 二值化 grayscaleAndBinarizeImageAndSave
    const modifiedFilePath = filePath.replace('.jpg', '-灰度二极化.jpg');
    await grayscaleAndBinarizeImageAndSave(filePath, modifiedFilePath, 128);

    // 5. ocr
    let promise = await tesseractUtil("jpn", modifiedFilePath);
    console.log("ocr结果", promise);
    // promise = promise.replace(/\s+/g, ' ')
    // console.log("ocr结果, 去除空格", promise)
    if (promise == null || typeof promise === 'undefined') {
        console.error("ocr 异常 直接返回")
        return;
    }

    // 准备要发送的数据
    const dynamicPayload = createTranslatePayload(promise, "zh");
    // 调用 sendTencentCloudAPIRequest 方法并传入回调函数
    sendTencentCloudAPIRequest(JSON.stringify(dynamicPayload), handleTranslate);

    let outputWindow = windowManager.getWindowByName(outputWindowName)
    outputWindow.send('translate-result-show', {promise})
    globalManager.isCaptureIng = false;
}

/**
 * 图片清理 id小于 lastSuccessPicId 都删除掉
 */
async function clearPic(lastSuccessPicId) {
    if (lastSuccessPicId === 0) {
        return;
    }
    let keysToDelete = [];

    try {
        // 遍历获取需要删除的
        Object.entries(getPicInfos()).forEach(([key, value]) => {
            if (key < lastSuccessPicId) {
                keysToDelete.push(value);
            }
        });

        // 删除收集到的键
        for (let keyToDelete of keysToDelete) {
            let delInfo = getPicInfoById(keyToDelete.id);
            fs.unlinkSync(delInfo.picPath);
            deletePicInfoById(delInfo.id);
        }
    } catch (e) {
        console.error("clearPic 图片失败", e)
    }
}

// 定义一个回调函数来处理请求结果或错误
function handleTranslate(error, data) {
    if (error) {
        console.error("发生错误:", error);
    } else {
        // 在这里处理响应数据
        console.log("请求成功，响应数据:", data);

        const responseObject = JSON.parse(data);
        const targetText = responseObject.Response.TargetText;
        console.log("数据解析后:", targetText);

        // 翻译结束
        globalManager.isCaptureIng = false;

        let outputWindow = windowManager.getWindowByName(outputWindowName)
        outputWindow.send('translate-result-show', {targetText})
    }
}

// 定义一个函数来动态生成 payload
function createTranslatePayload(sourceText, targetLanguage) {
    return {
        SourceText: sourceText,
        Source: "auto", // 或者根据需要指定源语言
        Target: targetLanguage,
        ProjectId: 0
    };
}



module.exports = {addPicInfo, getPicInfoById, getNextPicId, PicInfo, processAndCheck};
