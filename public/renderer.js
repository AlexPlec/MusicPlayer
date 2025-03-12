const { ipcRenderer } = require('electron');
const playlist = document.getElementById('playlist');
const audioPlayer = document.getElementById('audioPlayer');
const path = require('path'); // Add this line

let musicFiles = [];

// Request the list of music files from the main process
ipcRenderer.invoke('get-music-files').then(files => {
  musicFiles = files;
  console.log(musicFiles);
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