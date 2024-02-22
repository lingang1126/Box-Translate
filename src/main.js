'use strict';
// main.js
const {app, BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer} = require('electron');
const {createCanvas, Image} = require('canvas')
const path = require('path');
const fs = require('fs');
// 内部文件
const {setupIPCHandlers} = require('./main/ipcHandle/ipchandles.js');
const {processImage, resetDir, imageHashCheck, tesseractUtil, grayscaleAndBinarizeImageAndSave} = require('./main/common/picUtil');
const overlayWindowModule = require('./main/common/overlayWindowModule.js');
const paths = require('./path.js');

let mainWindow;
let lyricWindow;
let screenShotWindow;
let intervalId;
let isShotTaskRunning = false;


app.whenReady().then(() => {
    // 创建初始窗口
    mainWindow = createWindow();

    // 注册事件监听
    setupIPCHandlers(mainWindow);

    // 重设图片文件夹
    resetDir();


    // 灰度 二值化 grayscaleAndBinarizeImageAndSave
    // grayscaleAndBinarizeImageAndSave("/Users/lg/IdeaProjects/Box-Translate/src/pic/4.jpg", "/Users/lg/IdeaProjects/Box-Translate/src/pic/4-灰度二极化.jpg", 128);

    // tesseractUtil("eng", "/Users/lg/IdeaProjects/Box-Translate/src/pic/4-灰度二极化.jpg");
    // 识别
    // measureExecutionTimeAndLogMain(tesseractUtil);

    // 监听窗口关闭事件
    mainWindow.on('closed', () => {
        quitApp();
    });
});

app.on('window-all-closed', () => {
    quitApp();
    // darwin 代表mac系统 如果是windows 则是win32
    // if (process.platform !== 'darwin') {
    // app.quit();
    // }
});

app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: paths.PRELOAD_SCRIPT,
        },
    });

    win.loadFile(paths.INDEX_HTML);
    win.webContents.openDevTools();

    return win;
}


ipcMain.handle('saveBitmap', (event, bitmapData, path) => {
    const img = new Image()
    img.src = bitmapData

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(path, buffer)
})


function quitApp() {
    app.quit();
    resetDir();
}

// 在主进程中获取方法执行时间并输出
function measureExecutionTimeAndLogMain(func) {
    const {performance} = require('perf_hooks');

    const start = performance.now();

    // 执行传入的函数
    func();

    const end = performance.now();
    const executionTime = end - start;

    console.log('方法执行时间：', executionTime, '毫秒');
}
