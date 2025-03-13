const { ipcRenderer } = require('electron');
const playlist = document.getElementById('playlist');
const audioPlayer = document.getElementById('audioPlayer');
const path = require('path');
const playPauseBtn = document.getElementById('playPauseBtn');
const timeline = document.getElementById('timeline');
const progress = document.getElementById('progress');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');

let musicFiles = [];
let currentTrackIndex = -1; // Track the currently playing song index

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
    songItem.textContent = path.basename(file);

    // Play the selected song
    songItem.addEventListener('click', () => {
      playTrack(index);
    });

    playlist.appendChild(songItem);
  });
}

// Function to play a specific track
function playTrack(index) {
  if (index >= 0 && index < musicFiles.length) {
    const file = musicFiles[index];
    audioPlayer.src = file;
    audioPlayer.play();
    currentTrackIndex = index; // Update the current track index
    highlightTrack(index); // Highlight the currently playing track
  }
}

// Function to highlight the currently playing track
function highlightTrack(index) {
  const songItems = playlist.children;

  for (let i = 0; i < songItems.length; i++) {
    const songItem = songItems[i];

    // Remove the highlight class from all tracks
    songItem.classList.remove('highlight');

    // Add the highlight class to the current track
    if (i === index) {
      songItem.classList.add('highlight');
    }
  }
}

// Automatically play the next track when the current track ends
audioPlayer.addEventListener('ended', () => {
  if (currentTrackIndex < musicFiles.length - 1) {
    playTrack(currentTrackIndex + 1); // Play the next track
  } else {
    console.log('End of playlist reached.');
  }
});

// Add spacebar listener to play/pause the track
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

playPauseBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.textContent = '⏸️';
  } else {
    audioPlayer.pause();
    playPauseBtn.textContent = '▶️';
  }
  console.log(audioPlayer);
});

// Update Play/Pause Button State
audioPlayer.addEventListener('play', () => {
  playPauseBtn.textContent = '⏸️';
});
audioPlayer.addEventListener('pause', () => {
  playPauseBtn.textContent = '▶️';
});

// Timeline Progress Bar
audioPlayer.addEventListener('timeupdate', () => {
  if (!isNaN(audioPlayer.duration)) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTime.textContent = formatTime(audioPlayer.currentTime);
  }
});

audioPlayer.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audioPlayer.duration);
});

timeline.addEventListener('click', (event) => {
  const rect = timeline.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = percent * audioPlayer.duration;
});

// Format time as MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}