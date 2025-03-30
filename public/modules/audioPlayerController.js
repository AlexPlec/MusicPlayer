// audioPlayer.js
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
            playTrack(currentTrackIndex - 1);
        }
    }

    if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (currentTrackIndex < musicFiles.length - 1) {
            playTrack(currentTrackIndex + 1);
        }
    }
}

module.exports = {
    initializeAudioPlayer: function (metadata, files) {
        allTracksMetadata = metadata;
        musicFiles = files;

        document.addEventListener('keydown', handleKeyPress);
    },

    // Play a specific track
    playTrack: async function (index) {
        if (index >= 0 && index < allTracksMetadata.length) {
            const trackMetadata = allTracksMetadata[index];
            const title = trackMetadata.title || 'Unknown Title';
            const artist = trackMetadata.artist || 'Unknown Artist';
            const album = trackMetadata.album || 'Unknown Album';

            // Resolve the album art image path
            let albumArtSrc = trackMetadata.albumImage || trackMetadata.artistImage || './default-album.png';

            // Set the audio source and play the track
            audioPlayer.src = musicFiles[index];
            await audioPlayer.play();
            currentTrackIndex = index;
            highlightTrack(index);

            // Update the UI with the track metadata
            currentSong.textContent = title;
            currentArtist.textContent = artist;
            currentAlbum.textContent = album;
            albumArt.src = albumArtSrc; // Assign the resolved image path
        }
    },

};