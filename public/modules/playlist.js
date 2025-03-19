const { ipcRenderer } = require('electron');
const path = require('path');
const { parseBlob } = require('music-metadata-browser');

let musicFiles = [];
let currentTrackIndex = -1;

ipcRenderer.invoke('get-music-files').then(files => {
  musicFiles = files;
  renderPlaylist();
});

function renderPlaylist() {
  playlist.innerHTML = '';
  musicFiles.forEach(async (file, index) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.textContent = path.basename(file);

    songItem.addEventListener('click', () => {
      playTrack(index);
    });

    playlist.appendChild(songItem);
  });
}

async function playTrack(index) {
  if (index >= 0 && index < musicFiles.length) {
    const file = musicFiles[index];

    const response = await fetch(file);
    const blob = await response.blob();

    const metadata = await parseBlob(blob);

    const title = metadata.common.title || 'Unknown Title';
    const artist = metadata.common.artist || 'Unknown Artist';
    const album = metadata.common.album || 'Unknown Album';

    let albumArtSrc = '';
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const base64Image = Buffer.from(picture.data).toString('base64');
      albumArtSrc = `data:${picture.format};base64,${base64Image}`;
    }

    audioPlayer.src = file;
    await audioPlayer.play();
    currentTrackIndex = index;
    highlightTrack(index);

    currentSong.textContent = title;
    currentArtist.textContent = artist;
    currentAlbum.textContent = album
    albumArt.src = albumArtSrc || '';
  }
}

function highlightTrack(index) {
  const songItems = playlist.children;

  for (let i = 0; i < songItems.length; i++) {
    const songItem = songItems[i];

    songItem.classList.remove('highlight');

    if (i === index) {
      songItem.classList.add('highlight');
    }
  }
}

document.addEventListener('keydown', (event) => {
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
});