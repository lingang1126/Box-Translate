'use strict';


// renderer.js
let isSelecting = false;
let isOutputSelecting = false;
let intervalId;
let captureInterval = 300; // Default interval for auto capture
let outputResultHistory = [];


// 在渲染进程中监听消息
window.ipcRenderer.on('update-is-selecting', (event, isSelectingParam) => {
    // 处理消息，更新渲染进程中的状态
    console.log('Received update-is-selecting message:', isSelectingParam);
    isSelecting = isSelectingParam
});

document.getElementById('selectAreaBtn').addEventListener('click', () => {
    console.log("start-selecting-area msg send")
    toggleSelectingArea();
});

document.getElementById('outputSelectAreaBtn').addEventListener('click', () => {
    toggleOutputSelectingArea();
});

document.getElementById('startAutoCaptureBtn').addEventListener('click', () => {
    startAutoCapture();
});

document.getElementById('singleTransLate').addEventListener('click', () => {
    ipcRenderer.send('auto-notify-start-capture');
});


document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);


// document.getElementById('intervalInput').addEventListener('input', (event) => {
//     // Limit user input to a minimum value of 300ms
//     captureInterval = Math.min(300, parseInt(event.target.value));
// });

/**
 * 截图覆盖框
 */
function toggleSelectingArea() {
    console.log('isSelecting, %s!.', isSelecting);
    isSelecting = !isSelecting;

    const captureBox = document.getElementById('captureBox');
    captureBox.style.display = isSelecting ? 'block' : 'none';
    if (isSelecting) {
        stopSelectingArea();
        startSelectingArea();
    } else {
        stopSelectingArea();
    }
}

function startSelectingArea() {
    ipcRenderer.send('start-selecting-area');
}

function stopSelectingArea() {
    // 关闭
    ipcRenderer.send('close-selecting-area');
}


/**
 * 自动截图触发
 */
function startAutoCapture() {
    // 校验入参是否合法
    // 获取输入框元素
    let intervalInput = document.getElementById('intervalInput');
    // 获取输入框的值
    const intervalValue = intervalInput.value;
    console.log("输入框的值为:", intervalValue);
    if (intervalValue < 500) {
        alert("定时截图时间间隔不能小于500ms");
        return;
    }

    stopAutoCapture();
    intervalId = setInterval(() => {
        captureAndCompare();

    }, intervalValue);
}

function stopAutoCapture() {
    clearInterval(intervalId);
}

function captureAndCompare() {
    console.log("定时任务执行======");
    ipcRenderer.send('auto-notify-start-capture');
}


// function handleOutputResult(result) {
//     const outputResults = document.getElementById('outputResults');
//     const resultElement = document.createElement('div');
//     resultElement.textContent = result;
//
//     // Display result in app
//     outputResults.appendChild(resultElement);
//
//     // Save result in history
//     outputResultHistory.push(result);
//
//     // Limit history to 50 items
//     if (outputResultHistory.length > 50) {
//         outputResultHistory.shift(); // Remove the oldest result
//     }
// }

/**
 * 输出框
 */
function toggleOutputSelectingArea() {
    isOutputSelecting = !isOutputSelecting;

    if (isOutputSelecting) {
        stopOutputSelectingArea();
        startOutputSelectingArea();
    } else {
        stopOutputSelectingArea();
    }
}

function startOutputSelectingArea() {
    ipcRenderer.send('notify-start-output-selecting');
}

function stopOutputSelectingArea() {
    ipcRenderer.send('notify-stop-output-selecting');
}

