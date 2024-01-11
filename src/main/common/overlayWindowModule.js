// overlayWindowModule.js
'use strict';

class OverlayWindowModule {
    constructor() {
        if (!OverlayWindowModule.instance) {
            this.overlayWindow = null;
            OverlayWindowModule.instance = this;
        }
        return OverlayWindowModule.instance;
    }

    setOverlayWindow(window) {
        this.overlayWindow = window;
    }

    getOverlayWindow() {
        return this.overlayWindow;
    }
}

const instance = new OverlayWindowModule();
// Object.freeze(instance);

module.exports = instance;