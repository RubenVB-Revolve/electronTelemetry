const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');

// Set up the WebSocket connection
let ws = new WebSocket(`ws://localhost:8080/ws/datastream`);

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
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
    const axData = parsedData.data['vcu/102.INS.ax'];
    const ayData = parsedData.data['vcu/102.INS.ay'];
    const rollData = parsedData.data['vcu/114.InsEstimates1.roll'];
    const flTorqueData = parsedData.data['vcu/119.InverterEstimates.motor_torque.fl'];
    const frTorqueData = parsedData.data['vcu/119.InverterEstimates.motor_torque.fr'];
    const rlTorqueData = parsedData.data['vcu/119.InverterEstimates.motor_torque.rl'];
    const rrTorqueData = parsedData.data['vcu/119.InverterEstimates.motor_torque.rr'];

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
    if (ayData !== undefined) {
      win.webContents.send('ay-data', {
        timestamp: parsedData.timestamp,
        yValue: ayData,  // Send it as 'yValue'
      });
    }
    if (axData !== undefined && ayData !== undefined) {
      win.webContents.send('gg-data', {
        timestamp: parsedData.timestamp,
        xValue: axData,  // Send it as 'xValue'
        yValue: ayData,  // Send it as 'yValue'
      });
    }
    if (rollData !== undefined) {
      win.webContents.send('roll-data', {
        timestamp: parsedData.timestamp,
        yValue: rollData,  // Send it as 'yValue'
      });
    }
    if(flTorqueData !== undefined && frTorqueData !== undefined && rlTorqueData !== undefined && rrTorqueData !== undefined) {
      win.webContents.send('torque-data', {
        timestamp: parsedData.timestamp,
        fl: flTorqueData,
        fr: frTorqueData,
        rl: rlTorqueData,
        rr: rrTorqueData,
      });
    }
});

  // Open the DevTools.
  win.webContents.openDevTools();
  
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
