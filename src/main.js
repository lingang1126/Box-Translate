'use strict';
// main.js
const {app, BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer} = require('electron');
const {createCanvas, Image} = require('canvas')
const path = require('path');
const fs = require('fs');
// 内部文件
const {setupIPCHandlers} = require('./main/ipcHandle/ipchandles.js');
const {processImage} = require('./main/common/picOptUtil');
const overlayWindowModule = require('./main/common/overlayWindowModule.js');
const paths = require('./path.js');

let mainWindow;
let lyricWindow;
let screenShotWindow;
let intervalId;
let isShotTaskRunning = false;


app.whenReady().then(() => {
    // 在主线程中通过 IPC 通信获取渲染进程中的变量值
    // const isSelecting = getIsSelecting();
    mainWindow = createWindow();
    // const overlayWindowModule = new OverlayWindowModule();
    setupIPCHandlers(mainWindow);
    // 监听窗口关闭事件
    mainWindow.on('closed', () => {
        app.quit();
    });
});

app.on('window-all-closed', () => {
    app.quit();
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



