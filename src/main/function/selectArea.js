const {BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer} = require('electron');
const child_process = require("child_process");

const windowManager = require('../common/windowManager.js');
const picManager = require('../common/picManager.js');
const overlayWindowModule = require('../common/overlayWindowModule.js');
const paths = require('../../path.js');
const globalManager = require("../common/globalManager");
const windowName = 'overlayWindow'

let overlayWindow


// 创建
function startSelectingArea(mainWindow) {
    // 最小化窗口
    mainWindow.minimize();

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

    // 定时任务发送截图通知
    ipcMain.on('auto-notify-start-capture', () => {
        // console.log("接收到截图的消息==========", windowManager.getWindowByName(windowName))
        let overlayWindow = windowManager.getWindowByName(windowName)
        if (overlayWindow === null || typeof windowManager.getWindowByName(windowName) === 'undefined') {
            console.log("接收到截图的消息.overlayWindow为空==========")

        } else {
            console.log("接收到截图的消息.overlayWindow正常==========")

            if (globalManager.isCaptureIng === false) {
                const {x, y, width, height} = overlayWindow.getBounds();
                optCloseButtonDisplay(overlayWindow, false);
                macScreenCapture(x, y, width, height);
            }else {
                console.log("截图中 请稍后处理 ==========")
            }
        }
    });


    // 注册快捷键，根据需要修改原生截图api
    globalShortcut.register('CommandOrControl+Alt+T', async () => {
        dosAntt()
    });

    // 注册快捷键，根据需要修改原生截图api
    globalShortcut.register('CommandOrControl+Alt+S', async () => {
        const {x, y, width, height} = overlayWindow.getBounds();
        console.log("width,height", x, y, width, height);

        optCloseButtonDisplay(overlayWindow, false);

        let screenFlag = false;
        if (process.platform === 'darwin') {
            screenFlag = macScreenCapture(x, y, width, height);
        } else {

        }
        // 截图完成的后续操作
        if (screenFlag) {

        }
    });

}

/**
 * mac 环境下截图
 */
function macScreenCapture(x, y, width, height) {
    // 开始截图
    globalManager.isCaptureIng = true;

    let localPic = paths.LOCAL_PIC;
    let picId = picManager.getNextPicId();
    let suffix = 'jpg';

    let localPicPath = `${localPic}/${picId}.${suffix}`;
    console.log(localPicPath);
    const screenCommand = `screencapture -x -t jpg -R${x},${y},${width},${height} ${localPicPath}`;
    console.log(screenCommand);

    child_process.exec(screenCommand, (error, stdout, stderr) => {
        if (!error) {
            console.log("mac 截图成功");
            let picInfo = new picManager.PicInfo(picId, localPicPath);
            picManager.addPicInfo(picInfo);
            picManager.processAndCheck(picId);
        } else {
            console.error("macScreenCapture err", error);
        }
    });


    return picId;
}

/**
 * mac 环境下截图
 */
function dosAntt() {
    // console.log("接收到截图的消息==========", windowManager.getWindowByName(windowName))
    let overlayWindow = windowManager.getWindowByName(windowName)
    if (overlayWindow === null || typeof windowManager.getWindowByName(windowName) === 'undefined') {
        console.log("接收到截图的消息.overlayWindow为空==========")

    } else {
        console.log("接收到截图的消息.overlayWindow正常==========")

        if (globalManager.isCaptureIng === false) {
            const {x, y, width, height} = overlayWindow.getBounds();
            optCloseButtonDisplay(overlayWindow, false);
            macScreenCapture(x, y, width, height);
        }else {
            console.log("截图中 请稍后处理 ==========")
        }
    }
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