import {Draggable} from './common/myDraggable.js';
// import {ipcMain} from "electron";
// import {startListening} from './common/createOverlay.js';


const outputArea = document.getElementById('outputArea');
const textDisplay = document.getElementById('textDisplay');
const closeIcon = document.querySelector('.close');
const body = document.querySelector('body');


// 点击 closeIcon 时执行关闭操作
closeIcon.addEventListener('click', () => {
    // 在这里执行关闭操作的逻辑
    ipcRenderer.send('notify-stop-output-selecting');
});

ipcRenderer.on('translate-result-show', (event, {targetText}) => {
    showTranslateResult(targetText)
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("发送消息")
    var windowName = "outputWindow";
    const draggable = new Draggable(outputArea, windowName);
});

/**
 * 输出内容到div上
 */
function showTranslateResult(translation) {
    textDisplay.innerText = translation;
}
