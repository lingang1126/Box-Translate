import {Draggable} from './common/myDraggable.js';
import {startListening} from './common/createOverlay.js';


const selectArea = document.getElementById('selectArea');
const closeIcon = document.querySelector('.close');
const body = document.querySelector('body');

let isCloseButtonDisplay = 'none';
ipcRenderer.on('init-overlay', (event, {type, width, height}) => {
    const updateBox = document.getElementById(`${type}`);
    startListening(updateBox);
});

// 显示和隐藏 关闭符号 为了图片的识别率
ipcRenderer.on('opt-close-display', (event, {optType}) => {
    const closeButton = document.querySelector('.close');
    // 当他要设置为异常 说明截图启动了 后续还有一次显示 提前记录下状态
    if (optType === 'none') {
        isCloseButtonDisplay = closeButton.style.display;
    }
    if (isCloseButtonDisplay === 'none') {
        return;
    }
    console.log("接收到 opt-close-display 修改display", optType)
    closeButton.style.display = optType;
});


// 鼠标移入时显示 closeButton，移出时隐藏 closeButton
closeIcon.addEventListener('mouseover', () => {
    showCloseButton();
});
closeIcon.addEventListener('mouseleave', () => {
    hideCloseButton();
});
selectArea.addEventListener('mouseover', () => {
    showCloseButton();
});
selectArea.addEventListener('mouseleave', () => {
    hideCloseButton();
});

// 显示和隐藏 closeButton 
const showCloseButton = () => {
    closeIcon.style.display = 'block';
};
const hideCloseButton = () => {
    closeIcon.style.display = 'none';
};


// 点击 closeIcon 时执行关闭操作
closeIcon.addEventListener('click', () => {
    // 在这里执行关闭操作的逻辑
    ipcRenderer.send('close-selecting-area');
});


document.addEventListener('DOMContentLoaded', () => {
    console.log("发送消息")
    var windowName = "overlayWindow";
    const draggable = new Draggable(selectArea, windowName);
});


// =========== 先放这里 后面再改
// ===========
// ===========
// ===========
ipcRenderer.on('screenMsg', (event, {sources, width, height, left, top}) => {
    console.log("接收到screenMsg 消息", sources);
    captureScreen(sources, width, height, left, top);
});

async function captureScreen(sources, width, height, left, top) {
    console.log("getSources", sources)
    for (const source of sources) {
        if (source.name === 'Entire Screen' || source.name === 'Screen 1' || source.id === 'screen:1:0') {
            console.log("successgetsource", source)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id,
                        }
                    }
                })

                console.log("开始处理图片")

                const track = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                const bitmap = await imageCapture.grabFrame();

                console.log("开始保存图片")
                // 保存到桌面
                const desktopPath = window.init.homedir + '/Desktop/';
                console.log("desktopPath", desktopPath)
                const filePath = desktopPath + 'screenshot.png';

                const canvas = document.createElement('canvas');


                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

                const bitmapData = canvas.toDataURL();
                await saveBitmap(bitmapData, filePath);
            } catch (e) {
                console.error(e)
            }
            return
        }
    }
}

// bitmap base64
async function saveBitmap(bitmap, path) {
    await ipcRenderer.invoke('saveBitmap', bitmap, path)
}
