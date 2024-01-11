'use strict';

let isMouseDown = false;
let startX = 0, startY = 0;
let tempOverlayBox;
export function startListening(updateBox) {
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', () => mouseUpHandler(updateBox));
}

function stopListening() {
    document.removeEventListener('mousedown', mouseDownHandler);
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}

function mouseDownHandler(e) {
    isMouseDown = true;
    startX = e.pageX;
    startY = e.pageY;
    tempOverlayBox = updateOverlayBox(startX, startY, 0, 0);
}

function mouseMoveHandler(event) {
    if (!isMouseDown || !tempOverlayBox) return;
    tempOverlayBox.style.width = `${Math.abs(event.pageX - startX)}px`;
    tempOverlayBox.style.height = `${Math.abs(event.pageY - startY)}px`;
    tempOverlayBox.style.left = `${Math.min(event.pageX, startX)}px`;
    tempOverlayBox.style.top = `${Math.min(event.pageY, startY)}px`;
}

function mouseUpHandler(updateBox) {
    if (isMouseDown && tempOverlayBox) {
        var x = parseFloat(tempOverlayBox.style.left), y = parseFloat(tempOverlayBox.style.top), width = parseFloat(tempOverlayBox.style.width), height = parseFloat(tempOverlayBox.style.height);
        isMouseDown = false;
        updateOverlay(updateBox, '0', '0', '100%', '100%');
        removeTempOverlayBox();
        stopListening();

        console.log("mouseUpHandler msg")
        // 向主进程发送消息，请求开始或停止监听鼠标事件
        ipcRenderer.send('overlay-stop-mouse-listening', { x, y, width, height });
    }
}

function createOverlayBox(left, top) {
    const divBox = document.createElement('div');
    divBox.id = 'dynamic-overlay-box';
    divBox.style.position = 'absolute';
    divBox.style.width = '0px';
    divBox.style.height = '0px';
    divBox.style.left = `${left}px`;
    divBox.style.top = `${top}px`;
    document.body.appendChild(divBox);
    return divBox;
}

function updateOverlayBox(left, top, width, height) {
    const divBox = createOverlayBox(left, top);
    divBox.style.width = `${width}px`;
    divBox.style.height = `${height}px`;
    return divBox;
}

function updateOverlay(overlay, x, y, width, height) {
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
    // overlay.style.width = `${width}px`;
    // overlay.style.height = `${height}px`;
    overlay.style.width = width;
    overlay.style.height = height;
}

// 移除临时画布
function removeTempOverlayBox() {
    if (tempOverlayBox && tempOverlayBox.parentNode) {
        tempOverlayBox.parentNode.removeChild(tempOverlayBox);
        tempOverlayBox = null;
    }
}

// module.exports = { startListening };