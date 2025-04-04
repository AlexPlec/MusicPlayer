const fs = require('fs/promises');
const path = require('path');
const { parseBlob } = require('music-metadata-browser');

const cachesFilePath = path.join(__dirname, '/jsons');

const artistCacheFilePath = path.join(cachesFilePath, 'artistCache.json');
const albumCacheFilePath = path.join(cachesFilePath, 'albumCache.json');
const songsCacheFilePath = path.join(cachesFilePath, 'songsCache.json');
const structuredSongsFilePath = path.join(cachesFilePath, 'structuredSongsCache.json');

const eventManager = require('./eventEmitter');

const musicFolderPath = path.resolve(__dirname, '../../../music');

const artistCacheArray = [];
const albumCacheArray = [];
const songsCacheArray = [];
const structuredSongsCacheArray = [];

async function extractSongMetadata(filePath) {
    try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const metadata = await parseBlob(blob);

        return {
            title: metadata.common.title || 'Unknown Title',
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            genre: metadata.common.genre || ['Unknown Genre'],
            year: metadata.common.year || null,
            track: metadata.common.track?.no || null,
        };
    } catch (error) {
        console.error(`Error extracting metadata for "${filePath}":`, error);
        return {
            title: 'Unknown Title',
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            genre: ['Unknown Genre'],
            year: null,
            track: null,
        };
    }
}

async function createstructuredSongsCache() {
  try {

    const isPopulated = await isCacheFilePopulated(structuredSongsFilePath);

    if (isPopulated) {
        console.log('structuredSongsFilePath cache already populated. Skipping creation.');
        return;
    }
    const allSongsCache = [];

    songsCacheArray.forEach((song) => {
      const { artist, album, title, genre, year, track, filePath } = song;

      const artistEntry = artistCacheArray.find((entry) => Object.keys(entry)[0] === artist);
      const artistImagePath = artistEntry ? Object.values(artistEntry)[0] : './default-artist.png';

      const albumEntry = albumCacheArray.find((entry) => Object.keys(entry)[0] === album);
      const albumImagePath = albumEntry ? Object.values(albumEntry)[0] : './default-album.png';

      let artistCache = allSongsCache.find((entry) => Object.keys(entry)[0] === artist);
      if (!artistCache) {

        artistCache = { [artist]: { artistImagePath, albums: {} } };
        allSongsCache.push(artistCache);
      }

      const albums = artistCache[artist].albums;

      if (!albums[album]) {

        albums[album] = { albumImagePath, songs: [] };
      }

      albums[album].songs.push({
        title,
        genre,
        year,
        track,
        filePath,
      });
    });

    await fs.writeFile(structuredSongsFilePath, JSON.stringify(allSongsCache, null, 2), 'utf-8');

    console.log('All songs cache created successfully:', structuredSongsFilePath);

    structuredSongsCacheArray.push(...allSongsCache);

  } catch (error) {
    console.error('Error creating all songs cache:', error);
  }
}

async function createSongsCache() {
    try {
        const isPopulated = await isCacheFilePopulated(songsCacheFilePath);

        if (isPopulated) {
            console.log('Songs cache already populated. Skipping creation.');
            return;
        }

        const artistsPathArray = await fs.readdir(musicFolderPath, { withFileTypes: true });

        const artistFolders = artistsPathArray.filter((dirent) => dirent.isDirectory());

        const songsCache = [];

        for (const artistFolder of artistFolders) {
            const artistName = artistFolder.name;
            const artistFolderPath = path.join(musicFolderPath, artistName);

            const albumFolders = await fs.readdir(artistFolderPath, { withFileTypes: true });
            const filteredAlbumFolders = albumFolders.filter((dirent) => dirent.isDirectory());

            for (const albumFolder of filteredAlbumFolders) {
                const albumName = albumFolder.name;
                const albumFolderPath = path.join(artistFolderPath, albumName);

                const songFiles = await fs.readdir(albumFolderPath);
                const filteredSongFiles = songFiles.filter((file) => /\.(mp3|flac)$/i.test(file));

                for (const songFile of filteredSongFiles) {
                    const songFilePath = path.join(albumFolderPath, songFile);

                    const metadata = await extractSongMetadata(songFilePath);

                    metadata.artist = artistName;
                    metadata.album = albumName;
                    metadata.filePath = songFilePath;

                    songsCache.push(metadata);
                    console.log(`Added song "${metadata.title}" by "${artistName}/${albumName}".`);
                }
            }
        }

        await writeCache(songsCache, songsCacheFilePath);
        console.log('Songs cache created successfully.');
    } catch (error) {
        console.error('Error creating songs cache:', error);
    }
}

async function createArtistCache() {
    try {
        const isPopulated = await isCacheFilePopulated(artistCacheFilePath);

        if (isPopulated) {
            console.log('Artist cache already populated. Skipping creation.');
            return;
        }

        const artistsPathArray = await fs.readdir(musicFolderPath, { withFileTypes: true });

        const artistFolders = artistsPathArray.filter((dirent) => dirent.isDirectory());

        const artistCache = [];

        for (const artistFolder of artistFolders) {
            const artistName = artistFolder.name;
            const artistFolderPath = path.join(musicFolderPath, artistName);

            const artistImagePath = await findImageInDirectory(artistFolderPath, 'artist.jpg');

            if (artistImagePath) {
                artistCache.push({ [artistName]: artistImagePath });
                console.log(`Added artist "${artistName}" with image path: ${artistImagePath}`);
            } else {
                console.warn(`No artist image found for "${artistName}".`);
            }
        }

        await writeCache(artistCache, artistCacheFilePath);
        console.log('Artist cache created successfully.');
    } catch (error) {
        console.error('Error creating artist cache:', error);
    }
}

async function createAlbumCache() {
    try {
        const isPopulated = await isCacheFilePopulated(albumCacheFilePath);

        if (isPopulated) {
            console.log('Album cache already populated. Skipping creation.');
            return;
        }

        const artistsPathArray = await fs.readdir(musicFolderPath, { withFileTypes: true });

        const artistFolders = artistsPathArray.filter((dirent) => dirent.isDirectory());

        const albumCache = [];

        for (const artistFolder of artistFolders) {
            const artistName = artistFolder.name;
            const artistFolderPath = path.join(musicFolderPath, artistName);

            const albumFolders = await fs.readdir(artistFolderPath, { withFileTypes: true });
            const filteredAlbumFolders = albumFolders.filter((dirent) => dirent.isDirectory());

            for (const albumFolder of filteredAlbumFolders) {
                const albumName = albumFolder.name;
                const albumFolderPath = path.join(artistFolderPath, albumName);

                const albumImagePath = await findImageInDirectory(albumFolderPath, 'cover.jpg');

                if (albumImagePath) {
                    const albumKey = albumName;
                    albumCache.push({ [albumKey]: albumImagePath });
                    console.log(`Added album "${albumKey}" with image path: ${albumImagePath}`);
                } else {
                    console.warn(`No album cover found for "${artistName}/${albumName}".`);
                }
            }
        }

        await writeCache(albumCache, albumCacheFilePath);
        console.log('Album cache created successfully.');
    } catch (error) {
        console.error('Error creating album cache:', error);
    }
}

async function findImageInDirectory(dir, imageName) {
    try {
        const files = await fs.readdir(dir);

        if (files.includes(imageName)) {
            return path.join(dir, imageName);
        }

        return null;
    } catch (error) {
        console.error(`Error searching for image in directory ${dir}:`, error);
        return null;
    }
}

async function writeCache(musicFilesArray, cacheFilePath) {
    try {
        await fs.writeFile(cacheFilePath, JSON.stringify(musicFilesArray, null, 2), 'utf-8');
        console.log('Music file paths cached successfully.');
    } catch (error) {
        console.error('Error writing cache file:', error);
    }
}

async function readCache(cacheFilePath) {
    try {
        const cacheExists = await fs.stat(cacheFilePath).then(() => true).catch(() => false);

        if (cacheExists) {
            const cacheData = await fs.readFile(cacheFilePath, 'utf-8');
            console.log('data loaded from cache.');
            return JSON.parse(cacheData);
        }

        return null;
    } catch (error) {
        console.error('Error reading metadata cache file:', error);
        return null;
    }
}

async function initializeCacheArrays() {
    try {
        const artistCache = await readCache(artistCacheFilePath);
        if (artistCache) {
            artistCacheArray.push(...artistCache);
            console.log('Artist cache array initialized with:', artistCacheArray.length, 'items.');
        } else {
            console.warn('No artist cache found. Artist cache array is empty.');
        }

        const albumCache = await readCache(albumCacheFilePath);
        if (albumCache) {
            albumCacheArray.push(...albumCache);
            console.log('Album cache array initialized with:', albumCacheArray.length, 'items.');
        } else {
            console.warn('No album cache found. Album cache array is empty.');
        }

        const songsCache = await readCache(songsCacheFilePath);
        if (songsCache) {
            songsCacheArray.push(...songsCache);
            console.log('Songs cache array initialized with:', songsCacheArray.length, 'items.');
        } else {
            console.warn('No songs cache found. Songs cache array is empty.');
        }

        const structuredSongsCache = await readCache(structuredSongsFilePath);
        if (structuredSongsCache) {
            structuredSongsCacheArray.push(...structuredSongsCache);
            console.log('Structured songs cache array initialized with:', structuredSongsCacheArray.length, 'items.');
        } else {
            console.warn('No structured  songs cache found. Structured songs cache array is empty.');
        }
    } catch (error) {
        console.error('Error initializing cache arrays:', error);
    }
}

async function isCacheFilePopulated(cacheFilePath) {
    try {
        const cacheExists = await fs.stat(cacheFilePath).then(() => true).catch(() => false);

        if (cacheExists) {
            const cacheData = await fs.readFile(cacheFilePath, 'utf-8');

            if (!cacheData.trim()) {
                console.warn(`Cache file ${cacheFilePath} is empty.`);
                return false;
            }

            try {
                const parsedData = JSON.parse(cacheData);
                return Array.isArray(parsedData) && parsedData.length > 0;
            } catch (parseError) {
                console.error(`Error parsing cache file ${cacheFilePath}:`, parseError);
                return false;
            }
        }

        return false;
    } catch (error) {
        console.error(`Error checking cache file ${cacheFilePath}:`, error);
        return false;
    }
}

async function initializeAndRender() {
    try {

      await createArtistCache();
      eventManager.emit('artistCacheCreated');
  
      await createAlbumCache();
      eventManager.emit('albumCacheCreated');
  
      await createSongsCache();
      eventManager.emit('songsCacheCreated');

      await createstructuredSongsCache();
      eventManager.emit('structuredSongsCacheCreated');
  
      await initializeCacheArrays();
      eventManager.emit('cacheArraysInitialized', { artistCacheArray, albumCacheArray, songsCacheArray, structuredSongsCacheArray });
    } catch (error) {
      console.error('Error during initialization:', error);
      eventManager.emit('initializationFailed', error);
    }
  }
  
initializeAndRender();

eventManager.on('cacheArraysInitialized', ({ }) => {
    createstructuredSongsCache();
});