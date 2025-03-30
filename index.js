const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const musicFolderPath = ('./music');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
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


// ipcMain.handle('get-music-files', async () => {
//     const musicFolderPath = path.join(__dirname, 'music');
//     const files = await fs.promises.readdir(__dirname);

//     const musicFiles = files.filter(file => file.endsWith('.mp3')).map(file => path.join(musicFolderPath, file));
//     return musicFolderPath;
// });

// async function getMusicStructure(dir) {

//     const artists = await fs.promises.readdir(dir, { withFileTypes: true });

//     // Initialize an array to store the structured data
//     const musicStructure = [];

//     for (const artist of artists) {
//         if (artist.isDirectory()) {
//             const artistName = artist.name;
//             const artistPath = path.join(dir, artistName);

//             // Get all albums for the current artist
//             const albums = await fs.promises.readdir(artistPath, { withFileTypes: true });

//             const artistData = {
//                 name: artistName,
//                 albums: [],
//             };

//             for (const album of albums) {
//                 if (album.isDirectory()) {
//                     const albumName = album.name;
//                     const albumPath = path.join(artistPath, albumName);

//                     // Get all songs for the current album
//                     const songs = await fs.promises.readdir(albumPath);

//                     // Filter only .mp3 files
//                     const songList = songs.filter((song) => song.endsWith('.mp3'));

//                     artistData.albums.push({
//                         name: albumName,
//                         songs: songList,
//                     });
//                 }
//             }

//             // Add the artist's data to the music structure
//             musicStructure.push(artistData);
//         }
//     }

//     return musicStructure;
// }

// ipcMain.handle('get-music-files', async () => {
//     const musicStructure = await getMusicStructure(musicFolderPath);
//     return musicStructure;
// });



