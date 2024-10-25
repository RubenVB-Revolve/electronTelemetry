const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');

// Set up the WebSocket connection
let ws = new WebSocket(`ws://localhost:8080/ws/datastream`);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false, // Ensures proper IPC communication
      nodeIntegration: true, // Enables Node.js integration in the renderer
    },
  });

  win.loadFile('index.html');

  // WebSocket message handler
  ws.on('message', (data) => {
    const parsedData = JSON.parse(data);

    const pitchData = parsedData.data['vcu/114.InsEstimates1.pitch'];
    const axData = parsedData.data['vcu/116.ImuMeasurements.ax'];
    const rollData = parsedData.data['vcu/114.InsEstimates1.roll'];

    if (pitchData !== undefined) {
      win.webContents.send('pitch-data', {
        timestamp: parsedData.timestamp,
        yValue: pitchData,  // Send it as 'yValue' to match renderer expectations
      });
    } 
    if (axData !== undefined) {
      win.webContents.send('ax-data', {
        timestamp: parsedData.timestamp,
        yValue: axData,  // Send it as 'yValue'
      });
    } 
    if (rollData !== undefined) {
      win.webContents.send('roll-data', {
        timestamp: parsedData.timestamp,
        yValue: rollData,  // Send it as 'yValue'
      });
    }
});
  
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
