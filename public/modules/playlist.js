// playlist.js

const audioPlayerController = require('./audioPlayerController.js');

const fs = require('fs/promises');

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

async function resolveImagePath(imagePath, defaultImage) {
  try {
    if (!imagePath) return defaultImage;

    const fileExists = await fs.stat(imagePath).then(() => true).catch(() => false);
    return fileExists ? imagePath : defaultImage;
  } catch (error) {
    console.error(`Error resolving image path (${imagePath}):`, error);
    return defaultImage;
  }
}

async function renderAlbumItem(album, songs, defaultImage) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item-container';

  const coverContainer = document.createElement('div');
  coverContainer.className = 'cover-container';

  const coverImage = document.createElement('img');
  coverImage.className = 'cover-image';
  coverImage.alt = album;

  try {
    const imagePath = await resolveImagePath(songs[0].albumImage || songs[0].artistImage, defaultImage);
    coverImage.src = imagePath;
  } catch (error) {
    console.error(`Error resolving image for album "${album}":`, error);
    coverImage.src = defaultImage;
  }

  const title = document.createElement('h3');
  title.textContent = album;

  coverContainer.appendChild(coverImage);
  coverContainer.appendChild(title);

  coverContainer.addEventListener('click', () => showSongsListView(album, songs, defaultImage));

  itemDiv.appendChild(coverContainer);
  return itemDiv;
}

async function showAlbumsListView(artist, tracks, defaultImage = './default-album.png') {
  switchView(artistsView, albumsListView);
  albumName.textContent = artist;
  clearContainer(albumsList);

  const albumMap = new Map();
  tracks.forEach((track, index) => {
    const album = track.album || 'Unknown Album';
    if (!albumMap.has(album)) {
      albumMap.set(album, []);
    }
    albumMap.get(album).push({ ...track, index });
  });

  for (const [album, songs] of albumMap.entries()) {
    const albumItem = await renderAlbumItem(album, songs, defaultImage);
    albumsList.appendChild(albumItem);
  }
}

async function showAlbumsListView(artist, tracks, defaultImage = './default-album.png') {
  switchView(artistsView, albumsListView);
  albumName.textContent = artist;
  clearContainer(albumsList);

  const albumMap = groupTracksByAlbum(tracks);

  for (const [album, songs] of albumMap.entries()) {
    const albumItem = await renderAlbumItem(album, songs, defaultImage);
    albumsList.appendChild(albumItem);
  }
}

function groupTracksByAlbum(tracks) {
  const albumMap = new Map();

  tracks.forEach((track, index) => {
    const album = track.album || 'Unknown Album';
    if (!albumMap.has(album)) {
      albumMap.set(album, []);
    }
    albumMap.get(album).push({ ...track, index });
  });

  return albumMap;
}

function renderSongs(songs, maxVisibleSongs) {
  // Clear the songs list container
  clearContainer(songsList);

  // Load only the first N songs
  songs.slice(0, maxVisibleSongs).forEach(({ title, artist, track, index }) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.textContent = `${track}. ${title} - ${artist}`;

    // Add click event listener to play the track
    songItem.addEventListener("click", () => {
      audioPlayerController.playTrack(index);
    });

    songsList.appendChild(songItem);
  });
}



async function showSongsListView(album, songs, defaultImage) {
  // Switch to the songs list view
  switchView(albumsView, songsListView, albumsListView);

  // Update the album name
  albumName.textContent = album;

  // Clear the songs list container
  clearContainer(songsList);

  // Resolve and set the album cover image
  await setAlbumCoverImage(songs, defaultImage);

  // Render the first 15 songs
  renderSongs(songs, 15);
}

async function setAlbumCoverImage(songs, defaultImage) {
  try {
    const imagePath = await resolveImagePath(songs[0].albumImage || songs[0].artistImage, defaultImage);
    songListCover.src = imagePath; // Set the resolved image path
  } catch (error) {
    console.error(`Error resolving image for album:`, error);
    songListCover.src = defaultImage; // Fallback to the default image
  }
}

async function renderGroupedItems(container, allTracksMetadata, groupBy, coverClass, defaultImage, clickHandler) {
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
  itemMap.forEach(async (tracks, key) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-container';

    const coverContainer = document.createElement('div');
    coverContainer.className = 'cover-container';

    const coverImage = document.createElement('img');
    coverImage.className = coverClass;
    try {
      const imagePath = await resolveImagePath(tracks[0].albumImage || tracks[0].artistImage, defaultImage);
      coverImage.src = imagePath; // Set the resolved image path
    } catch (error) {
      console.error(`Error resolving image for ${key}:`, error);
      coverImage.src = defaultImage; // Fallback to the default image
    }
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