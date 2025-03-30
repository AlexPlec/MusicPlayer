const fs = require('fs/promises');
const path = require('path');

// Path to the music folder and cache file
const musicFolderPath = 'C:/Users/accht/Documents/GitHub/MusicPlayer/music';
const cacheFilePath = path.join(__dirname, 'musicCache.json');

async function getMusicFilesArray(dir) {
    try {
        const artists = await fs.readdir(dir, { withFileTypes: true });

        // Initialize an array to store all .mp3 file paths
        const mp3Files = [];

        for (const artist of artists) {
            if (artist.isDirectory()) {
                const artistName = artist.name;
                const artistPath = path.join(dir, artistName);

                // Get all albums for the current artist
                const albums = await fs.readdir(artistPath, { withFileTypes: true });

                for (const album of albums) {
                    if (album.isDirectory()) {
                        const albumName = album.name;
                        const albumPath = path.join(artistPath, albumName);

                        // Get all songs for the current album
                        const songs = await fs.readdir(albumPath);

                        // Filter only .mp3 files and add their absolute paths to the array
                        const songList = songs
                            .filter((song) => song.endsWith('.mp3'))
                            .map((song) => path.join(albumPath, song));

                        mp3Files.push(...songList); // Add the filtered songs to the main array
                    }
                }
            }
        }

        return mp3Files; // Return the flat array of .mp3 file paths
    } catch (error) {
        console.error(`Error reading music structure:`, error);
        throw error;
    }
}

async function writeCache(musicFilesArray) {
    try {
        await fs.writeFile(cacheFilePath, JSON.stringify(musicFilesArray, null, 2), 'utf-8');
        console.log('Music file paths cached successfully.');
    } catch (error) {
        console.error('Error writing cache file:', error);
    }
}

async function readCache() {
    try {
        const cacheExists = await fs.stat(cacheFilePath).then(() => true).catch(() => false);

        if (cacheExists) {
            const cacheData = await fs.readFile(cacheFilePath, 'utf-8');
            console.log('Music file paths loaded from cache.');
            return JSON.parse(cacheData);
        }

        return null; // Cache file does not exist
    } catch (error) {
        console.error('Error reading cache file:', error);
        return null;
    }
}

async function fetchMusicFiles() {
    try {
        // Attempt to read from the cache
        const cachedMusicFiles = await readCache();

        if (cachedMusicFiles) {
            return cachedMusicFiles; // Return cached data if available
        }
        // If no cache exists, traverse the directory structure
        const musicFilesArray = await getMusicFilesArray(musicFolderPath);

        // Write the data to the cache file
        await writeCache(musicFilesArray);

        return musicFilesArray; // Return the newly fetched data
    } catch (error) {
        console.error('Error fetching music files:', error);
        throw error;
    }
}

module.exports = {
    musicArray: async function () {
        const musicFilesArray = await fetchMusicFiles();
        return musicFilesArray;
    },
};