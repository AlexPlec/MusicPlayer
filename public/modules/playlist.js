// playlist.js

const audioPlayerController = require('./audioPlayerController.js');
const eventManager = require('./utils/eventEmitter.js');

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

function renderSongs(artistSongsName, songs, maxVisibleSongs) {

  clearContainer(songsList);

  console.log(songs);

  songs.slice(0, maxVisibleSongs).forEach(({ title, track }, currentIndex) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.textContent = `${track}. ${title} - ${artistSongsName}`;
    const resolvedIndex = songs[currentIndex].index ?? currentIndex;

    songItem.addEventListener("click", () => {
      audioPlayerController.playTrack(resolvedIndex);
    });

    songsList.appendChild(songItem);
  });
}

function renderAlbums(structuredSongsCacheArray) {

  clearContainer(groupedByAlbums);

  structuredSongsCacheArray.forEach((artistEntry) => {

    const artistName = Object.keys(artistEntry)[0];
    const albums = artistEntry[artistName].albums;

    Object.entries(albums).forEach(([albumName, albumData]) => {
      const { albumImagePath, songs } = albumData;

      const coverTitle = document.createElement('div');
      coverTitle.className = 'cover-title';
      coverTitle.textContent = albumName;

      const coverItem = document.createElement('img');
      coverItem.className = 'cover-item';
      coverItem.src = albumImagePath;
      coverItem.alt = albumName;

      coverItem.addEventListener('click', () => {
        showSongsListView(albumName, artistName, albumData);
      });

      groupedByAlbums.appendChild(coverTitle);
      groupedByAlbums.appendChild(coverItem);
    });
  });
}

function renderArtists(structuredSongsCacheArray) {

  clearContainer(groupedByArtists);

  structuredSongsCacheArray.forEach((artistEntry) => {

    const artistName = Object.keys(artistEntry)[0];
    const artistData = artistEntry[artistName];

    const artistImagePath = artistData.artistImagePath;

    const coverTitle = document.createElement('div');
    coverTitle.className = 'artist-title';
    coverTitle.textContent = artistName;

    const coverItem = document.createElement('img');
    coverItem.className = 'artist-item';
    coverItem.src = artistImagePath;
    coverItem.alt = artistName;

    coverItem.addEventListener('click', () => {
      showAlbumsListView(artistName, artistData);
    });

    groupedByArtists.appendChild(coverTitle);
    groupedByArtists.appendChild(coverItem);
  });
}

async function showAlbumsListView(artistName, artistData, defaultImage = './default-album.png') {
  switchView(artistsView, albumsListView);
  clearContainer(albumsList);

  const albums = Object.values(artistData)[1]

  Object.entries(albums).forEach(([albumName, albumData]) => {
    const albumItem = renderArtistAlbumItem(artistName, albumName, albumData, defaultImage);
    albumsList.appendChild(albumItem);
  });
}

function renderArtistAlbumItem(artistName, albumName, albumData, defaultImage) {

  const itemDiv = document.createElement('div');
  itemDiv.className = 'item-container';

  const coverContainer = document.createElement('div');
  coverContainer.className = 'cover-container';

  const coverImage = document.createElement('img');
  coverImage.className = 'cover-image';
  coverImage.alt = albumName;
  coverImage.src = Object.values(albumData)[0]

  const title = document.createElement('h3');
  title.textContent = albumName;

  coverContainer.appendChild(coverImage);
  coverContainer.appendChild(title);

  coverContainer.addEventListener('click', () => {
    showSongsListView(albumName, artistName, albumData, defaultImage);
  });

  itemDiv.appendChild(coverContainer);
  return itemDiv;
}

async function showSongsListView(albumTitle, artistName, albumData, defaultImage = './default-album.png') {

  const albumCoverPath = Object.values(albumData)[0];

  switchView(albumsView, songsListView, albumsListView);

  albumName.textContent = albumTitle;

  clearContainer(songsList);

  songListCover.src = albumCoverPath || defaultImage;

  const songsData = Object.values(albumData)[1]
  audioPlayerController.updatePlayTrack(songsData, albumCoverPath, albumTitle, artistName );
  renderSongs(artistName, songsData, 15);
}

eventManager.on('cacheArraysInitialized', ({structuredSongsCacheArray }) => {
  console.log('Rendering songs...');
  renderAlbums(structuredSongsCacheArray);
  renderArtists(structuredSongsCacheArray);
});

eventManager.on('initializationFailed', (error) => {
  console.error('Initialization failed:', error);
});