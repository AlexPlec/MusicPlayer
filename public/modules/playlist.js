// playlist.js

const audioPlayerController  = require ('./audioPlayerController.js');

function showAlbumsListView(artist, tracks) {
  // Switch to the albums list view
  document.getElementById('artistsView').classList.remove('active');
  document.getElementById('albumsListView').classList.add('active');

  // Display the artist name
  document.getElementById('albumName').textContent = artist;

  // Clear the albums container
  const albumsListContainer = document.getElementById('albumsList');
  albumsListContainer.innerHTML = '';

  // Group tracks by album for the selected artist
  const albumMap = new Map();

  tracks.forEach((track, index) => {
    const album = track.album || 'Unknown Album';
    if (!albumMap.has(album)) {
      albumMap.set(album, []);
    }
    albumMap.get(album).push({ ...track, index });
  });

  // Render albums for the selected artist
  albumMap.forEach((songs, album) => {
    const albumDiv = document.createElement('div');
    albumDiv.className = 'album-item';

    const albumCoverContainer = document.createElement('div');
    albumCoverContainer.className = 'album-cover-container';

    const albumCover = document.createElement('img');
    albumCover.className = 'album-cover';
    albumCover.src = getAlbumArt(songs[0].picture); // Get album art from metadata
    albumCover.alt = album;

    const albumTitle = document.createElement('h3');
    albumTitle.textContent = album;

    albumCoverContainer.appendChild(albumCover);
    albumCoverContainer.appendChild(albumTitle);

    // Add event listener to navigate to songs list view
    albumCoverContainer.addEventListener('click', () => {
      showSongsListView(album, songs);
    });

    albumDiv.appendChild(albumCoverContainer);
    albumsListContainer.appendChild(albumDiv);
  });
}

function showSongsListView(album, songs) {
  document.getElementById(`albumsView`).classList.remove('active');
  document.getElementById(`songsListView`).classList.add('active');
  document.getElementById('albumName').textContent = album;

  document.getElementById(`albumsListView`).classList.remove('active');

  const songsListContainer = document.getElementById('songsList');
  songsListContainer.innerHTML = '';

    const albumArt = document.createElement('img');
    albumArt.className = 'album-cover';
    albumArt.src = getAlbumArt(songs[0].picture); // Function to convert metadata picture to base64

  //  songItem.prepend(albumArt); // Place the album art before the text
  songsListContainer.appendChild(albumArt);
  songs.forEach(({ title, artist, track, index }) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';

    songItem.textContent = `${track}. ${title} - ${artist}`;
    songItem.addEventListener('click', () => {
      audioPlayerController.playTrack(index); // Use global playTrack function
    });

    songsListContainer.appendChild(songItem);
  });
}

function getAlbumArt(pictureData) {
  if (Array.isArray(pictureData) && pictureData.length > 0) {
    const picture = pictureData[0];
    const base64Image = Buffer.from(picture.data).toString('base64');
    return `data:${picture.format};base64,${base64Image}`;
  }
  return './default-album-cover.png';
}

function getArtistArt(pictureData) {
  if (Array.isArray(pictureData) && pictureData.length > 0) {
    const picture = pictureData[1];
    const base64Image = Buffer.from(picture.data).toString('base64');
    return `data:${picture.format};base64,${base64Image}`;
  }
  return './default-artist-cover.png';
}

module.exports = {

  renderAllSongs: function (allTracksMetadata) {
    const allSongsContainer = document.getElementById('allSongs');
    allSongsContainer.innerHTML = '';

    allTracksMetadata.forEach(({ title }, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item';
      songItem.textContent = title;

      songItem.addEventListener('click', () => {
        audioPlayerController.playTrack(index); // Use global playTrack function
      });

      allSongsContainer.appendChild(songItem);
    });
  },

  renderGroupedByAlbums: function (allTracksMetadata) {
    const groupedByAlbumsContainer = document.getElementById('groupedByAlbums');
    groupedByAlbumsContainer.innerHTML = '';

    const albumMap = new Map();

    allTracksMetadata.forEach((track, index) => {
      const album = track.album || 'Unknown Album';
      if (!albumMap.has(album)) {
        albumMap.set(album, []);
      }
      albumMap.get(album).push({ ...track, index });
    });

    albumMap.forEach((songs, album) => {
      const albumDiv = document.createElement('div');
      albumDiv.className = 'album-item';

      const albumCoverContainer = document.createElement('div');
      albumCoverContainer.className = 'album-cover-container';

      const albumCover = document.createElement('img');
      albumCover.className = 'album-cover';
      albumCover.src = getAlbumArt(songs[0].picture);
      albumCover.alt = album;

      const albumTitle = document.createElement('h3');
      albumTitle.textContent = album;

      albumCoverContainer.appendChild(albumCover);
      albumCoverContainer.appendChild(albumTitle);

      albumCoverContainer.addEventListener('click', () => {
        showSongsListView(album, songs);
      });

      albumDiv.appendChild(albumCoverContainer);
      groupedByAlbumsContainer.appendChild(albumDiv);
    });
  },

  renderGroupedByArtists: function (allTracksMetadata) {
    const groupedByArtistsContainer = document.getElementById('groupedByArtists');
    groupedByArtistsContainer.innerHTML = '';

    const albumMap = new Map();

    allTracksMetadata.forEach((track, index) => {
      const album = track.album || 'Unknown Album';
      if (!albumMap.has(album)) {
        albumMap.set(album, []);
      }
      albumMap.get(album).push({ ...track, index });
    });

    albumMap.forEach((songs, album) => {
      const albumDiv = document.createElement('div');
      albumDiv.className = 'artist-item';

      const albumCoverContainer = document.createElement('div');
      albumCoverContainer.className = 'artist-cover-container';

      const albumCover = document.createElement('img');
      albumCover.className = 'artist-cover';
      albumCover.src = getArtistArt(songs[0].picture);
      albumCover.alt = album;

      const albumTitle = document.createElement('h3');
      albumTitle.textContent = album;

      albumCoverContainer.appendChild(albumCover);
      albumCoverContainer.appendChild(albumTitle);

      albumCoverContainer.addEventListener('click', () => {
         showAlbumsListView(album, songs);
      });

      albumDiv.appendChild(albumCoverContainer);
      groupedByArtistsContainer.appendChild(albumDiv);
    });
  }
};