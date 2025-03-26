// playlist.js

const audioPlayerController = require('./audioPlayerController.js');

function switchView(fromView, toView, optionalView) {
  fromView.classList.remove('active');
  toView.classList.add('active');
  if (optionalView) { optionalView.classList.remove('active'); }

  if (toView === albumsListView) {
    backToAlbums.classList.add('activeArtists');
  }
}

function clearContainer(container) {
  container.innerHTML = '';
}

function renderItem(itemName, pictureData, clickHandler) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item-container';

  const coverContainer = document.createElement('div');
  coverContainer.className = 'cover-container';

  const coverImage = document.createElement('img');
  coverImage.className = 'cover-image';
  coverImage.src = getImageArt(pictureData, 0); // Get album or artist art
  coverImage.alt = itemName;

  const title = document.createElement('h3');
  title.textContent = itemName;

  coverContainer.appendChild(coverImage);
  coverContainer.appendChild(title);

  coverContainer.addEventListener('click', clickHandler);

  itemDiv.appendChild(coverContainer);
  return itemDiv;
}

function showAlbumsListView(artist, tracks) {
  // Switch to the albums list view
  switchView(artistsView, albumsListView);

  // Display the artist name
  albumName.textContent = artist;

  // Clear the albums container
  clearContainer(albumsList);

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
    const albumItem = renderItem(
      album,
      songs[0].picture,
      () => showSongsListView(album, songs)
    );
    albumsList.appendChild(albumItem);
  });
}

function showSongsListView(album, songs) {
  // Switch to the songs list view

  switchView(albumsView, songsListView, albumsListView);

  // Display the album name
  albumName.textContent = album;

  // Clear the songs list container
  clearContainer(songsList);

  // Add album art at the top of the songs list
  const albumArt = document.createElement('img');
  albumArt.className = 'album-cover';
  albumArt.src = getImageArt(songs[0].picture, 0);
  songsList.appendChild(albumArt);

  // Render songs
  songs.forEach(({ title, artist, track, index }) => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';

    songItem.textContent = `${track?.no || ''}. ${title} - ${artist}`;
    songItem.addEventListener('click', () => {
      audioPlayerController.playTrack(index);
    });

    songsList.appendChild(songItem);
  });
}

function getImageArt(pictureData, index = 0, defaultImage = './default-image.png') {
  if (Array.isArray(pictureData) && pictureData.length > index) {
    const picture = pictureData[index];
    const base64Image = Buffer.from(picture.data).toString('base64');
    return `data:${picture.format};base64,${base64Image}`;
  }
  return defaultImage;
}

function renderGroupedItems(container, allTracksMetadata, groupBy, coverClass, pictureIndex, clickHandler) {
  clearContainer(container);

  const itemMap = new Map();

  // Group tracks by the specified key (album or artist)
  allTracksMetadata.forEach((track, index) => {
    const key = groupBy(track);
    if (!itemMap.has(key)) {
      itemMap.set(key, []);
    }
    itemMap.get(key).push({ ...track, index });
  });

  // Render each group as an item
  itemMap.forEach((tracks, key) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-container';

    const coverContainer = document.createElement('div');
    coverContainer.className = 'cover-container';

    const coverImage = document.createElement('img');
    coverImage.className = coverClass;
    coverImage.src = getImageArt(tracks[0].picture, pictureIndex);
    coverImage.alt = key;

    const title = document.createElement('h3');
    title.textContent = key;

    coverContainer.appendChild(coverImage);
    coverContainer.appendChild(title);

    // Attach click event listener
    coverContainer.addEventListener('click', () => clickHandler(key, tracks));

    itemDiv.appendChild(coverContainer);
    container.appendChild(itemDiv);
  });
}

module.exports = {

  renderAllSongs: function (allTracksMetadata) {

    clearContainer(allSongs);

    allTracksMetadata.forEach(({ title }, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item';
      songItem.textContent = title;

      songItem.addEventListener('click', () => {
        audioPlayerController.playTrack(index); // Use global playTrack function
      });

      allSongs.appendChild(songItem);
    });
  },

  renderGroupedByAlbums: function (allTracksMetadata) {
    renderGroupedItems(
      groupedByAlbums,
      allTracksMetadata,
      (track) => track.album || 'Unknown Album',
      'album-cover',
      0, // Use the first picture for album art
      showSongsListView
    );
  },

  renderGroupedByArtists: function (allTracksMetadata) {
    renderGroupedItems(
      groupedByArtists,
      allTracksMetadata,
      (track) => track.artist || 'Unknown Artist',
      'artist-cover',
      1, // Use the second picture for artist art
      showAlbumsListView
    );
  },
};