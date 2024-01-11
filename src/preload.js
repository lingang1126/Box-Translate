/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
// window.addEventListener('DOMContentLoaded', () => {
//     const replaceText = (selector, text) => {
//       const element = document.getElementById(selector)
//       if (element) element.innerText = text
//     }

//     for (const type of ['chrome', 'node', 'electron']) {
//       replaceText(`${type}-version`, process.versions[type])
//     }
//   })
// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const homedir = require('os').homedir;

// 在页面加载完成后再尝试使用 
window.onload = () => {
  window.ipcRenderer = ipcRenderer;

  // try {
  //   const { remote } = require('electron');
  //   console.log("remote", remote);
  //   const { desktopCapturer } = require('electron');
  //   console.log("desktopCapturer", require('electron').desktopCapturer);
  //   console.log("desktopCapturer", desktopCapturer);
  //   console.log("window.desktopCapturer", window.desktopCapturer);
  // } catch (error) {
  //   console.error("Error loading desktopCapturer:", error);
  // }
  // 获取 homedir

};

// const Draggable = require('./common/myDraggable.js');


// console.log(Draggable);
// window.Draggable = Draggable;
// console.log(window.Draggable);

contextBridge.exposeInMainWorld('electron', {
  get: () => require('electron').remote, // 暴露获取 Electron 的 remote 模块的方法
});

// Expose ipcRenderer to the renderer process
// contextBridge.exposeInMainWorld('ipcRenderer', {
//   send: (channel, data) => ipcRenderer.send(channel, data),
//   on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
// });

contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: ipcRenderer.invoke,
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
});

// 立即执行的 init 方法
// const init = {
//   homedir: homedir(),
// };
contextBridge.exposeInMainWorld('init', {
  homedir: homedir(),
});

