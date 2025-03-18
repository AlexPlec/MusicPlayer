audioPlayer.volume = volumeSlider.value;

volumeSlider.addEventListener('input', function () {
    const volume = this.value;
    audioPlayer.volume = volume;

    volumeProgress.style.width = `${volume * 100}%`;
});

volumeTimeline.addEventListener('click', function (event) {
    const rect = volumeTimeline.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const timelineWidth = rect.width;
    const newVolume = clickPosition / timelineWidth;

    volumeSlider.value = newVolume;
    audioPlayer.volume = newVolume;

    volumeProgress.style.width = `${newVolume * 100}%`;
});