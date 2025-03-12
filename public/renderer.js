const { ipcRenderer } = require('electron');
const playlist = document.getElementById('playlist');
const audioPlayer = document.getElementById('audioPlayer');
const path = require('path'); // Add this line

let musicFiles = [];
let currentTrackIndex = -1;

// Request the list of music files from the main process
ipcRenderer.invoke('get-music-files').then(files => {
  musicFiles = files;
  renderPlaylist();
});

// Render the playlist
function renderPlaylist() {
  playlist.innerHTML = ''; // Clear the playlist
  musicFiles.forEach((file, index) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.textContent = path.basename(file); // Use path.basename to get the file name

    // Play the selected song
    songItem.addEventListener('click', () => {
      audioPlayer.src = file;
      audioPlayer.play();
    });

    playlist.appendChild(songItem);
  });
}

function playTrack(index) {
    if (index >= 0 && index < musicFiles.length) {
      const file = musicFiles[index];
      audioPlayer.src = file;
      audioPlayer.play();
      currentTrackIndex = index; // Update the current track index
    }
  }

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault(); // Prevent default scrolling behavior
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }

    // Handle left arrow key to play the previous track
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    if (currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1); // Play the previous track
    }
  }

  // Handle right arrow key to play the next track
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    if (currentTrackIndex < musicFiles.length - 1) {
      playTrack(currentTrackIndex + 1); // Play the next track
    }
  }
});