const fs = require('fs/promises');
const path = require('path');
const { parseBlob } = require('music-metadata-browser');

// Path to the metadata cache file
const metadataCacheFilePath = path.join(__dirname, 'metadataCache.json');

async function writeMetadataCache(metadataArray) {
    try {
        await fs.writeFile(metadataCacheFilePath, JSON.stringify(metadataArray, null, 2), 'utf-8');
        console.log('Metadata cached successfully.');
    } catch (error) {
        console.error('Error writing metadata cache file:', error);
    }
}

async function readMetadataCache() {
    try {
        const cacheExists = await fs.stat(metadataCacheFilePath).then(() => true).catch(() => false);

        if (cacheExists) {
            const cacheData = await fs.readFile(metadataCacheFilePath, 'utf-8');
            console.log('Metadata loaded from cache.');
            return JSON.parse(cacheData);
        }

        return null; // Cache file does not exist
    } catch (error) {
        console.error('Error reading metadata cache file:', error);
        return null;
    }
}

module.exports = {

    extractMetadata: async function (files) {
        try {
            // Attempt to read metadata from the cache
            const cachedMetadata = await readMetadataCache();

            if (cachedMetadata) {
                return cachedMetadata; // Return cached metadata if available
            }

            // If no cache exists, extract metadata from files
            const allTracksMetadata = [];

            for (const file of files) {
                try {
                    const response = await fetch(file);
                    const blob = await response.blob();
                    const metadata = await parseBlob(blob);

                    // Extract the directory of the current file
                    const fileDir = path.dirname(file);

                    // Check for artist image in the artist folder
                    const artistImage = await findImageInDirectory(path.dirname(fileDir), 'artist.jpg');

                    // Check for album image in the album folder
                    const albumImage = await findImageInDirectory(fileDir, 'cover.jpg');

                    const trackMetadata = {
                        title: metadata.common.title || 'Unknown Title',
                        artist: metadata.common.artist || 'Unknown Artist',
                        album: metadata.common.album || 'Unknown Album',
                        genre: metadata.common.genre || ['Unknown Genre'],
                        year: metadata.common.year || null,
                        track: metadata.common.track?.no || null,
                        artistImage: artistImage || null, // Path to artist image
                        albumImage: albumImage || null,   // Path to album image
                    };

                    allTracksMetadata.push(trackMetadata);
                } catch (error) {
                    console.error(`Error extracting metadata for ${file}:`, error);
                }
            }

            // Write the extracted metadata to the cache file
            await writeMetadataCache(allTracksMetadata);

            return allTracksMetadata; // Return the newly extracted metadata
        } catch (error) {
            console.error('Error extracting metadata:', error);
            throw error;
        }
    },
};


async function findImageInDirectory(dir, imageName) {
    try {
        const files = await fs.readdir(dir);

        if (files.includes(imageName)) {
            return path.join(dir, imageName); // Return the full path to the image
        }

        return null; // Image not found
    } catch (error) {
        console.error(`Error searching for image in directory ${dir}:`, error);
        return null;
    }
}