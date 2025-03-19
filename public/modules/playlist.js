const { ipcRenderer } = require('electron');
const path = require('path');
const { parseBlob } = require('music-metadata-browser');

let musicFiles = [];
let currentTrackIndex = -1;
const allTracksMetadata = [];

ipcRenderer.invoke('get-music-files').then(files => {
  musicFiles = files;

  extractMetadata(musicFiles).then(metadata => {
    renderAllSongs();
  });

  renderGroupedByAlbums();
  renderGroupedByArtists();
});

async function playTrack(index) {
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

    audioPlayer.src = musicFiles[index];
    await audioPlayer.play();
    currentTrackIndex = index;
    highlightTrack(index);

    currentSong.textContent = title;
    currentArtist.textContent = artist;
    currentAlbum.textContent = album
    albumArt.src = albumArtSrc || '';
  }
}

async function extractMetadata(files) {
  for (const file of files) {
    try {
      const response = await fetch(file);
      const blob = await response.blob();
      const metadata = await parseBlob(blob);

      const trackMetadata = {
        title: metadata.common.title || 'Unknown Title',
        artist: metadata.common.artist || 'Unknown Artist',
        artists: metadata.common.artists || ['Unknown Artist'],
        album: metadata.common.album || 'Unknown Album',
        genre: metadata.common.genre || ['Unknown Genre'],
        year: metadata.common.year || null,
        track: metadata.common.track?.no || null,
        totalTracks: metadata.common.track?.of || null,
        disk: metadata.common.disk?.no || null,
        totalDisks: metadata.common.disk?.of || null,
        picture: metadata.common.picture || [],
      };

      allTracksMetadata.push(trackMetadata);
    } catch (error) {
      console.error(`Error extracting metadata for ${file}:`, error);
    }
  }
  return allTracksMetadata;
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

function renderAllSongs() {
  const allSongsContainer = document.getElementById('allSongs');
  allSongsContainer.innerHTML = '';
  allTracksMetadata.forEach((file, index) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.textContent = file.title;

    songItem.addEventListener('click', () => {
      playTrack(index);
    });

    allSongsContainer.appendChild(songItem);
  });
}

// Render songs grouped by albums
function renderGroupedByAlbums() {
  const groupedByAlbumsContainer = document.getElementById('groupedByAlbums');
  groupedByAlbumsContainer.innerHTML = '';

  const albumMap = new Map();

  // Parse metadata and group songs by album
  musicFiles.forEach((file, index) => {
    fetch(file)
      .then(response => response.blob())
      .then(blob => parseBlob(blob))
      .then(metadata => {
        const album = metadata.common.album || 'Unknown Album';
        if (!albumMap.has(album)) {
          albumMap.set(album, []);
        }
        albumMap.get(album).push({ file, index });
      })
      .catch(error => console.error(`Error parsing metadata for ${file}:`, error));
  });

  // Render albums
  setTimeout(() => {
    albumMap.forEach((songs, album) => {
      const albumDiv = document.createElement('div');
      albumDiv.className = 'album-item';

      const albumTitle = document.createElement('h3');
      albumTitle.textContent = album;
      albumDiv.appendChild(albumTitle);

      songs.forEach(({ file, index }) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.textContent = path.basename(file);

        songItem.addEventListener('click', () => {
          playTrack(index);
        });

        console.log(songItem);

        albumDiv.appendChild(songItem);
      });

      groupedByAlbumsContainer.appendChild(albumDiv);
    });
  }, 100); // Delay rendering to ensure metadata is parsed
}

// Render songs grouped by artists
function renderGroupedByArtists() {
  const groupedByArtistsContainer = document.getElementById('groupedByArtists');
  groupedByArtistsContainer.innerHTML = '';

  const artistMap = new Map();

  // Parse metadata and group songs by artist
  musicFiles.forEach((file, index) => {
    fetch(file)
      .then(response => response.blob())
      .then(blob => parseBlob(blob))
      .then(metadata => {
        const artist = metadata.common.artist || 'Unknown Artist';
        if (!artistMap.has(artist)) {
          artistMap.set(artist, []);
        }
        artistMap.get(artist).push({ file, index });
      })
      .catch(error => console.error(`Error parsing metadata for ${file}:`, error));
  });

  // Render artists
  setTimeout(() => {
    artistMap.forEach((songs, artist) => {
      const artistDiv = document.createElement('div');
      artistDiv.className = 'artist-item';

      const artistTitle = document.createElement('h3');
      artistTitle.textContent = artist;
      artistDiv.appendChild(artistTitle);

      songs.forEach(({ file, index }) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.textContent = path.basename(file);

        songItem.addEventListener('click', () => {
          playTrack(index);
        });

        artistDiv.appendChild(songItem);
      });

      groupedByArtistsContainer.appendChild(artistDiv);
    });
  }, 100); // Delay rendering to ensure metadata is parsed
}

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    // Remove 'active' class from all tabs and views
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.playlist-view').forEach(view => view.classList.remove('active'));

    // Add 'active' class to the clicked tab and corresponding view
    button.classList.add('active');
    const tab = button.dataset.tab;
    document.getElementById(`${tab}View`).classList.add('active');
  });
});

