const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle request for music files
ipcMain.handle('get-music-files', async () => {
  const musicFolderPath = path.join(__dirname, 'music');
  const files = await fs.promises.readdir(musicFolderPath);
  const musicFiles = files.filter(file => file.endsWith('.mp3')).map(file => path.join(musicFolderPath, file));
  return musicFiles;
});