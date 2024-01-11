const {BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer} = require('electron');
const child_process = require("child_process");

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
        const {x, y, width, height} = overlayWindow.getBounds();
        console.log("width,height", x, y, width, height);

        optCloseButtonDisplay(overlayWindow, false);

        if (process.platform === 'darwin') {
            macScreenCapture(x, y, width, height);

        } else {

        }
    });

}

/**
 * mac 环境下截图
 */
function macScreenCapture(x, y, width, height) {
    const screenCommand = `screencapture -x -t jpg -R${x},${y},${width},${height} /Users/lg/soft/pic/screenshot.png`;
    console.log(screenCommand);

    child_process.exec(screenCommand, (error, stdout, stderr) => {
        console.log("308", error);
        if (!error) {
            //截图完成，在粘贴板中
            console.log("截图成功");
        }
    });
}

/**
 * 原生截图方法
 */
// await function orgDesktopCapturer() {
//     try {
//         // console.log("sources 消息 start");
//         const sources = desktopCapturer.getSources({types: ['window', 'screen']});
//         // console.log("sources 消息 end", sources);
//         overlayWindow.webContents.send('screenMsg', {sources, width, height, x, y});
//     } catch (error) {
//         console.error("Error getting sources:", error);
//     }
// }

// 关闭
function closeSelectingArea(mainWindow) {
    let overlayWindow = overlayWindowModule.getOverlayWindow();

    console.log("receive close-selecting-area msg")
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
        windowManager.deleteWindows('overlayWindow')
    }
    // 在主线程中发送消息到渲染进程
    mainWindow.webContents.send('update-is-selecting', false);
}

/**
 * 是否展示
 * @param display ture 展示 false 不展示
 */
function optCloseButtonDisplay(overlayWindow, display) {
    if (display === true) {
        overlayWindow.webContents.send('opt-close-display', {optType: 'block'});
    } else {
        overlayWindow.webContents.send('opt-close-display', {optType: 'none'});
    }
}

module.exports = {startSelectingArea, closeSelectingArea};