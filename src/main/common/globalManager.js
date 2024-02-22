// globalManager.js
const globalManager = {
    // 
    windowInstances: {},

    // 全局的图片处理
    picId: 0,
    lastSuccessPicId: 0,
    picInfos: {},

    // 是否在截图处理中
    isCaptureIng: false,
};


module.exports = globalManager;
