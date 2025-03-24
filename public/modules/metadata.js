const { parseBlob } = require('music-metadata-browser');

module.exports = {

    extractMetadata: async function (files) {
        const allTracksMetadata = [];

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
};