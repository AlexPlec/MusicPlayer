// audioPlayer.js
function highlightTrack(index) {
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach((item, i) => {
        item.classList.toggle('highlight', i === index);
    });
}

// Handle key presses for playback control
function handleKeyPress(event) {
    const audioPlayer = document.getElementById('audioPlayer');

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

            let albumArtSrc = '';
            if (trackMetadata.picture && trackMetadata.picture.length > 0) {
                const picture = trackMetadata.picture[0];
                const base64Image = Buffer.from(picture.data).toString('base64');
                albumArtSrc = `data:${picture.format};base64,${base64Image}`;
            }

            const audioPlayer = document.getElementById('audioPlayer');
            const currentSong = document.getElementById('currentSong');
            const currentArtist = document.getElementById('currentArtist');
            const currentAlbum = document.getElementById('currentAlbum');
            const albumArt = document.getElementById('albumArt');

            audioPlayer.src = musicFiles[index];
            await audioPlayer.play();
            currentTrackIndex = index;
            highlightTrack(index);

            currentSong.textContent = title;
            currentArtist.textContent = artist;
            currentAlbum.textContent = album;
            albumArt.src = albumArtSrc || '';
        }
    },

};