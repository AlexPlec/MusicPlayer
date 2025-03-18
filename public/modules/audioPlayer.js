audioPlayer.addEventListener('ended', () => {
    if (currentTrackIndex < musicFiles.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else {
        console.log('End of playlist reached.');
    }
});

audioPlayer.addEventListener('play', () => {
    playPauseBtn.textContent = '⏸️';
});
audioPlayer.addEventListener('pause', () => {
    playPauseBtn.textContent = '▶️';
});

audioPlayer.addEventListener('timeupdate', function () {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;

    if (duration) {
        const progressPercentage = (currentTime / duration) * 100;
        progress.style.width = `${progressPercentage}%`;
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audioPlayer.duration);
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}