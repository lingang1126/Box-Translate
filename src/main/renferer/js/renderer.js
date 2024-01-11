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

// document.getElementById('outputSelectAreaBtn').addEventListener('click', () => {
//   toggleOutputSelectingArea();
// });

// document.getElementById('startAutoCaptureBtn').addEventListener('click', () => {
//   startAutoCapture();
// });

// document.getElementById('stopAutoCaptureBtn').addEventListener('click', () => {
//   stopAutoCapture();
// });


document.getElementById('fixBtn').addEventListener('click', () => {
    toggleFixing();
});

document.getElementById('outputBtn').addEventListener('click', () => {
    showOutputBox();
});

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);


document.getElementById('intervalInput').addEventListener('input', (event) => {
    // Limit user input to a minimum value of 300ms
    captureInterval = Math.min(300, parseInt(event.target.value));
});

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

function toggleOutputSelectingArea() {
    isOutputSelecting = !isOutputSelecting;

    const outputBox = document.getElementById('outputBox');
    outputBox.style.display = isOutputSelecting ? 'block' : 'none';

    if (isOutputSelecting) {
        startOutputSelectingArea();
    } else {
        stopOutputSelectingArea();
    }
}

function startOutputSelectingArea() {
    // Start output selecting area logic
    // ...
}

function stopOutputSelectingArea() {
    // Stop output selecting area logic
    // ...
}

function startAutoCapture() {
    intervalId = setInterval(() => {
        captureAndCompare();
    }, captureInterval);
}

function stopAutoCapture() {
    clearInterval(intervalId);
}

function captureAndCompare() {
    // Capture and compare logic
    // ...

    const hasChanged = compareScreenshots();

    if (hasChanged) {
        sendImageToServer();
    }
}

function compareScreenshots() {
    // Compare screenshots logic
    // ...

    return true; // Assuming there is always a change
}

function sendImageToServer() {
    // WebSocket connection logic
    // ...

    // For example, send captured image data
    // socket.send(capturedImageData);

    // Listen for server response
    // socket.addEventListener('message', (event) => {
    //   const result = event.data;
    //   handleOutputResult(result);
    // });

    // Close WebSocket connection
    // socket.close();
}

function createOutputOverlayWindow() {
    // Create a new BrowserWindow for output overlay
    // Handle mouse events in the output overlay window
    // ...

    // Listen for 'stop-output-selecting' event from main process
    ipcRenderer.once('stop-output-selecting', () => {
        // Close the output overlay window
        // ...
    });
}

function handleOutputResult(result) {
    const outputResults = document.getElementById('outputResults');
    const resultElement = document.createElement('div');
    resultElement.textContent = result;

    // Display result in app
    outputResults.appendChild(resultElement);

    // Save result in history
    outputResultHistory.push(result);

    // Limit history to 50 items
    if (outputResultHistory.length > 50) {
        outputResultHistory.shift(); // Remove the oldest result
    }
}

// Other necessary functions and event listeners

// function handleMouseDown(event) {
//   if (isSelecting) {
//     // Set initial position of the capture box
//     const { pageX, pageY } = event;
//     captureBox.style.left = `${pageX}px`;
//     captureBox.style.top = `${pageY}px`;

//     // Add a class for a smooth transition effect
//     captureBox.classList.add('capture-transition');
//   }
// }

// function handleMouseMove(event) {
//   if (isSelecting) {
//     // Update size of the capture box while mouse is moved
//     const { pageX, pageY } = event;
//     const left = parseInt(captureBox.style.left);
//     const top = parseInt(captureBox.style.top);

//     const width = pageX - left;
//     const height = pageY - top;

//     captureBox.style.width = `${width}px`;
//     captureBox.style.height = `${height}px`;
//   }
// }

// function handleMouseUp() {
//   if (isSelecting) {
//     // Remove transition class after mouse is released
//     captureBox.classList.remove('capture-transition');
//   }
// }

