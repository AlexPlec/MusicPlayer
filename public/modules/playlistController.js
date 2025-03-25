// app.js
const audioPlayerController  = require ('./audioPlayerController.js');
const metadata  = require ('./metadata.js');
const ui  = require ('./ui.js');

const playlist = require ('./playlist.js');

const { ipcRenderer } = require('electron');

let musicFiles = [];
let allTracksMetadata = [];

// Fetch music files and initialize the app
ipcRenderer.invoke('get-music-files').then(async (files) => {
    musicFiles = files;

    // Extract metadata
    allTracksMetadata = await metadata.extractMetadata(musicFiles);
    // Render playlists
    playlist.renderAllSongs(allTracksMetadata);
    playlist.renderGroupedByAlbums(allTracksMetadata);
    playlist.renderGroupedByArtists(allTracksMetadata);

    // Initialize audio player
    audioPlayerController.initializeAudioPlayer(allTracksMetadata, musicFiles);

    // Set up tab navigation
    ui.setupTabs();
    console.log(allTracksMetadata);
});