'use strict';

// myDraggable.js
// 移动事件
export class Draggable {
    // selectArea 对应的div , windowName 创建的窗口
    constructor(selectArea, windowName) {
        this.isKeyDown = false;
        this.dinatesX = 0;
        this.dinatesY = 0;
        this.selectArea = selectArea;
        this.windowName = windowName;

        this.selectArea.addEventListener('mousedown', this.mousedown.bind(this));
    }

    mousedown(e) {
        this.isKeyDown = true;
        this.dinatesX = e.clientX;
        this.dinatesY = e.clientY;

        document.removeEventListener('mousemove', this.mousemove.bind(this));
        document.removeEventListener('mouseup', this.mouseup.bind(this));
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
    }

    mousemove(ev) {
        if (this.isKeyDown) {
            const draX = ev.screenX - this.dinatesX;
            const draY = ev.screenY - this.dinatesY;

            // 给主进程传入坐标
            const data = {
                appX: draX,
                appY: draY,
                windowName: this.windowName
            };

            window.ipcRenderer.send('custom-adsorption', data);
        }
    }

    mouseup() {
        this.isKeyDown = false;

        document.removeEventListener('mousemove', this.mousemove.bind(this));
        document.removeEventListener('mouseup', this.mouseup.bind(this));
    }
}


export default Draggable;