const {BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer} = require('electron');

const windowManager = require('../common/windowManager.js');
const overlayWindowModule = require('../common/overlayWindowModule.js');
const paths = require('../../path.js');

let overlayWindow

// 创建
function startSelectingArea(mainWindow) {
    // 最小化窗口
    mainWindow.minimize();
    console.log("small");

    // 获取屏幕的大小
    const {width, height} = screen.getPrimaryDisplay().workAreaSize
    // 使用示例
    overlayWindow = new BrowserWindow({
        name: overlayWindow,
        width: width,
        height: height,
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


    overlayWindow.loadFile(paths.OVERLAY_HTML);

    // 储存
    overlayWindowModule.setOverlayWindow(overlayWindow);
    windowManager.saveWindows('overlayWindow', overlayWindow);

    // Send screen information to overlay window
    overlayWindow.webContents.on('did-finish-load', () => {
        // 开始截图消息
        overlayWindow.webContents.send('init-overlay', {type: 'selectArea', width, height});
    });

    // Handle the 'stop-selecting-area' event from the renderer process
    // ipcMain.once('stop-selecting-area', () => {
    //   overlayWindow.close();
    // });

    // 清除并重新创建无监听window
    ipcMain.on('overlay-stop-mouse-listening', (event, {x, y, width, height}) => {
        console.log("接收到 overlay-stop-mouse-listening 窗口释放消息")
        overlayWindow.setPosition(x, y);
        overlayWindow.setSize(width, height);
        mainWindow.restore();
        overlayWindow.setIgnoreMouseEvents(false);
    });

    // 注册快捷键，根据需要修改原生截图api
    globalShortcut.register('CommandOrControl+Alt+S', async () => {
        console.log("开始截图getSources之前");
        // captureScreen()
        const {width, height, x, y} = overlayWindow.getBounds();
        console.log("width,height", width, height, x, y);

        try {
            // console.log("sources 消息 start");
            const sources = await desktopCapturer.getSources({types: ['window', 'screen']});
            // console.log("sources 消息 end", sources);
            overlayWindow.webContents.send('screenMsg', {sources, width, height, x, y});
        } catch (error) {
            console.error("Error getting sources:", error);
        }
    });

}

// 关闭
function colseSelectingArea(mainWindow) {
    let overlayWindow = overlayWindowModule.getOverlayWindow();

    console.log("receive close-selecting-area msg")
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
        windowManager.deleteWindows('overlayWindow')
    }
    // 在主线程中发送消息到渲染进程
    mainWindow.webContents.send('update-is-selecting', false);
}

module.exports = {startSelectingArea, colseSelectingArea};