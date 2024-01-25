// picManager.js
const fs = require('fs');

const globalManager = require('./globalManager');
const {compressionImage, resetDir, imageHashCheck} = require('./picUtil');

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
    // 1. 图片压缩
    const modifiedFilePath = filePath.replace('.jpg', '-compress.jpg');
    const compressionOptions = {
        quality: 80,
    };
    let newPicPath = await compressionImage(filePath, compressionOptions, modifiedFilePath);
    if (typeof newPicPath === 'string' && newPicPath.trim() !== '') {
        // 字符串是可用的，不是空字符也不是undefined 更新地址
        updatePicInfoById(picId, newPicPath)
        // 删除老的图片
        fs.unlinkSync(filePath);
        picInfo = newPicPath;
    }

    // 2. 图片比对
    let lastSuccessPicId = getLastSuccessPicId();
    let hashCheckFlag = false;
    if (lastSuccessPicId !== 0) {
        let lastSuccessPicInfo = getPicInfoById(lastSuccessPicId);
        hashCheckFlag = imageHashCheck(filePath, lastSuccessPicInfo.picPath);
    }

    if (hashCheckFlag) {
        console.log("图片一致无需发送翻译处理 picId", picId)
    }


    // 3. 删除掉 所有id 小于lastSuccessPicId的图片数据 单独调用一个异步方法去做
    clearPic(lastSuccessPicId);

    // 4. 替换 lastId
    setLastSuccessPicId(picInfo.id);
    // 4. 图片数据传输的话 放外面调用 单独写一个方法
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


module.exports = {addPicInfo, getPicInfoById, getNextPicId, PicInfo, processAndCheck};
