const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        fullscreen: false, 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide(); // Hide the window instead of closing it
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    const iconPath = path.join(__dirname, 'assets', 'icon.png'); // Path to your tray icon
    const icon = nativeImage.createFromPath(iconPath);
    icon.setTemplateImage(true); // For macOS, use template image style

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (mainWindow) mainWindow.show();
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true; // Mark the app as quitting
                app.quit();
            },
        },
    ]);

    tray.setToolTip('Music Player');
    tray.setContextMenu(contextMenu);

    // Handle double-click on tray icon
    tray.on('double-click', () => {
        if (mainWindow) mainWindow.show();
    });

});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit();

    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});