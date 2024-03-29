// ipcHandlers.js
const {ipcMain} = require('electron');

// 内部文件导入
const {startSelectingArea, closeSelectingArea} = require('../function/selectArea');
const {startOutputArea, closeOutputArea} = require('../function/outputArea');
// const overlayWindowModule = require('../common/overlayWindowModule.js');
const windowManager = require('../common/windowManager');

function setupIPCHandlers(mainWindow) {

    // 创建选择框
    ipcMain.on('start-selecting-area', () => {
        console.log("receive start-selecting-area msg")
        startSelectingArea(mainWindow);
    });

    // 关闭选择框
    ipcMain.on('close-selecting-area', () => {
        console.log("receive close-selecting-area msg")
        closeSelectingArea(mainWindow);
    });

    // // 定时任务发送截图通知
    // ipcMain.on('auto-notify-start-capture', () => {
    //     console.log("receive close-selecting-area msg")
    //     closeSelectingArea(mainWindow);
    // });


    // 创建输出框
    ipcMain.on('notify-start-output-selecting', () => {
        startOutputArea(mainWindow);
    });

    // 关闭输出框
    ipcMain.on('notify-stop-output-selecting', () => {
        closeOutputArea(mainWindow);
    });


    // ipcMain.on('update-capture-box', (event, { x, y, width, height }) => {
    //     mainWindow.webContents.send('update-capture-box', { x, y, width, height });
    // });

    // ipcMain.on('update-output-box', (event, { x, y, width, height }) => {
    //     mainWindow.webContents.send('update-output-box', { x, y, width, height });
    // });

    // ipcMain.on('handle-output-result', (event, result) => {
    //     mainWindow.webContents.send('handle-output-result', result);
    // });

    ipcMain.on('custom-adsorption', (event, res) => {
        // console.log("接收到消息", res);
        let x = res.appX;
        let y = res.appY;
        let dynamicWindow = windowManager.getWindowByName(res.windowName);
        dynamicWindow.setPosition(res.appX, res.appY)
    });

    // // 定时截图功能
    // ipcMain.on('start-shot-timer', (event, interval) => {
    //     // 如果任务正在运行，则不执行
    //     if (isShotTaskRunning) {
    //         console.log('Previous task is still running. Skipping...');
    //         return;
    //     }
    //
    //     // 标记任务开始
    //     isShotTaskRunning = true;
    //     // 开启定时器
    //     intervalId = setInterval(captureScreen, interval);
    //     console.log('Timer started with interval:', interval);
    // });
    //
    // ipcMain.on('stop-timer', () => {
    //     // 关闭定时器
    //     clearInterval(intervalId);
    //     console.log('Timer stopped.');
    // });

}

module.exports = {setupIPCHandlers};