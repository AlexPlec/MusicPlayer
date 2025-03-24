// playlist.js

const audioPlayerController  = require ('./audioPlayerController.js');

function showSongsListView(album, songs) {
  document.getElementById(`albumsView`).classList.remove('active');
  document.getElementById(`songsListView`).classList.add('active');
  document.getElementById('albumName').textContent = album;

  const songsListContainer = document.getElementById('songsList');
  songsListContainer.innerHTML = '';

  songs.forEach(({ title, artist, track, index }) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';

    const trackNumber = typeof track?.no === 'number' ? `${track.no}. ` : '';
    songItem.textContent = `${trackNumber}${title} - ${artist}`;

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

    const artistMap = new Map();

    allTracksMetadata.forEach((track, index) => {
      const artist = track.artist || 'Unknown Artist';
      if (!artistMap.has(artist)) {
        artistMap.set(artist, []);
      }
      artistMap.get(artist).push({ ...track, index });
    });

    artistMap.forEach((songs, artist) => {
      const artistDiv = document.createElement('div');
      artistDiv.className = 'artist-item';

      const artistTitle = document.createElement('h3');
      artistTitle.textContent = artist;
      artistDiv.appendChild(artistTitle);

      songs.forEach(({ title, album, index }) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.textContent = `${title} - ${album}`;

        songItem.addEventListener('click', () => {
          window.playTrack(index); // Use global playTrack function
        });

        artistDiv.appendChild(songItem);
      });

      groupedByArtistsContainer.appendChild(artistDiv);
    });
  }
};
