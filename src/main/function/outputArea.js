

function startOutputSelecting() {
  // Create an overlay window for output selection
  createOutputOverlayWindow();
}

function stopOutputSelecting() {
  // Stop output selecting logic
  // ...
}

function createOutputOverlayWindow() {
  // Create a new BrowserWindow for output overlay
  // Handle mouse events in the output overlay window
  // ...

  // Listen for 'stop-output-selecting' event from main process
  ipcMain.once('stop-output-selecting', () => {
    // Close the output overlay window
    // ...
  });
}

