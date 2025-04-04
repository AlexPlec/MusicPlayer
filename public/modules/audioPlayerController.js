const eventManager = require('./utils/eventEmitter.js');
let songsToPlay = [];
let albumCoverPath;
let albumTitle;
let artistSongsName;

function highlightTrack(index) {
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach((item, i) => {
        item.classList.toggle('highlight', i === index);
    });
}

// Handle key presses for playback control
function handleKeyPress(event) {

    if (event.code === 'Space') {
        event.preventDefault();
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }

    if (event.code === 'ArrowLeft') {
        event.preventDefault();
        if (currentTrackIndex > 0) {
            module.exports.playTrack(currentTrackIndex - 1);
        }
    }

    if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (currentTrackIndex < songsToPlay.length - 1) {
            module.exports.playTrack(currentTrackIndex + 1);
        }
    }
}

module.exports = {
    playTrack: async function (index) {

        if (index >= 0 && index < songsToPlay.length) {
            const trackMetadata = songsToPlay[index];
            const title = trackMetadata.title || 'Unknown Title';

            audioPlayer.src = songsToPlay[index].filePath;
            await audioPlayer.play();
            currentTrackIndex = index;
            highlightTrack(index);

            currentSong.textContent = title;
            currentArtist.textContent = artistSongsName;
            currentAlbum.textContent = albumTitle;
            albumArt.src = albumCoverPath;
        }
    },

    updatePlayTrack: function (songsToPlayArray, albumCover, albumName, artistName) {
        songsToPlay = songsToPlayArray
        albumCoverPath = albumCover
        albumTitle = albumName
        artistSongsName = artistName
    }
};

eventManager.on('cacheArraysInitialized', ({ }) => {
    document.addEventListener('keydown', handleKeyPress);
});

eventManager.on('initializationFailed', (error) => {
    console.error('Initialization failed:', error);
});