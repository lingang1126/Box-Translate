const {BrowserWindow, ipcMain, screen} = require('electron');

const windowManager = require('../common/windowManager.js');
const overlayWindowModule = require("../common/overlayWindowModule");
const paths = require('../../path.js');
const outputWindowName = 'outputWindow'

function startOutputSelecting() {
    // Create an overlay window for output selection
    createOutputOverlayWindow();
}

// 创建
function startOutputArea(mainWindow) {
    // 获取屏幕的大小
    const {width, height} = screen.getPrimaryDisplay().workAreaSize
    // 使用示例
    outputWindow = new BrowserWindow({
        name: outputWindowName,
        width: 500,
        height: 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: paths.PRELOAD_SCRIPT,
        },
    });


    outputWindow.loadFile(paths.OUTPUT_HTML);

    // 储存
    windowManager.saveWindows(outputWindowName, outputWindow);

    // Send screen information to overlay window
    // outputWindow.webContents.on('did-finish-load', () => {
    //     // 开始截图消息
    //     outputWindow.webContents.send('init-overlay', {type: 'selectArea', width, height});
    // });

    // Handle the 'stop-selecting-area' event from the renderer process
    // ipcMain.once('stop-selecting-area', () => {
    //   outputWindow.close();
    // });

    // // 清除并重新创建无监听window
    // ipcMain.on('overlay-stop-mouse-listening', (event, {x, y, width, height}) => {
    //     console.log("接收到 overlay-stop-mouse-listening 窗口释放消息")
    //     outputWindow.setPosition(x, y);
    //     outputWindow.setSize(width, height);
    //     mainWindow.restore();
    //     outputWindow.setIgnoreMouseEvents(false);
    // });

}


// 关闭
function closeOutputArea(mainWindow) {
    let outputWindow = windowManager.getWindowByName(outputWindowName)

    console.log("receive close-selecting-area msg")
    if (outputWindow && !outputWindow.isDestroyed()) {
        outputWindow.close();
        windowManager.deleteWindows(outputWindowName)
    }
    // 在主线程中发送消息到渲染进程
    mainWindow.webContents.send('update-is-selecting', false);
}

module.exports = {startOutputArea, closeOutputArea};