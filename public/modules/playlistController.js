// app.js
const audioPlayerController  = require ('./audioPlayerController.js');
const metadata  = require ('./metadata.js');
const ui  = require ('./ui.js');

const playlist = require ('./playlist.js');

const { ipcRenderer } = require('electron');
const getMusicFiles  = require('./utils/musicFiles.js');

let musicFiles = [];
let allTracksMetadata = [];

// Fetch music files and initialize the app

async function start() {

    const musicFilesJson = await getMusicFiles.musicArray();

   // musicFiles = files;
   
    // Extract metadata
    allTracksMetadata = await metadata.extractMetadata(musicFilesJson);

    // Render playlists
    playlist.renderAllSongs(allTracksMetadata);
    playlist.renderGroupedByAlbums(allTracksMetadata);
    playlist.renderGroupedByArtists(allTracksMetadata);

    // Initialize audio player
    audioPlayerController.initializeAudioPlayer(allTracksMetadata, musicFilesJson);

    // Set up tab navigation
    ui.setupTabs();
}

// ipcRenderer.invoke('get-music-files').then(async (files) => {

//     const test = getMusicFiles.musicStructure;
//     console.log(test);

//     musicFiles = files;
   
//     // Extract metadata
//     allTracksMetadata = await metadata.extractMetadata(musicFiles);
//     // Render playlists
//     playlist.renderAllSongs(allTracksMetadata);
//     playlist.renderGroupedByAlbums(allTracksMetadata);
//     playlist.renderGroupedByArtists(allTracksMetadata);

//     // Initialize audio player
//     audioPlayerController.initializeAudioPlayer(allTracksMetadata, musicFiles);

//     // Set up tab navigation
//     ui.setupTabs();

//     // Fetch the structured music data
//     // const musicStructure = await getMusicStructure(musicFolderPath);

//     // // Log the structured data
//     // console.log(musicStructure);
// });

start();