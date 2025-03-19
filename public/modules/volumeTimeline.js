let isDraggingVolume = false;

audioPlayer.volume = volumeSlider.value;
volumeProgressThumb.style.left = `100%`;

volumeSlider.addEventListener('input', function () {
    const volume = this.value;
    audioPlayer.volume = volume;
    volumeProgress.style.width = `${volume * 100}%`;
});

volumeTimeline.addEventListener('click', function (event) {
    if (!isDraggingVolume) {
        updateVolume(event);
    }
});

volumeTimeline.addEventListener('mousedown', function () {
    isDraggingVolume = true;
    document.body.style.cursor = 'pointer';
});

document.addEventListener('mousemove', function (event) {
    if (isDraggingVolume) {
        requestAnimationFrame(() => updateVolume(event));
    }
});

document.addEventListener('mouseup', function () {
    isDraggingVolume = false;
    document.body.style.cursor = 'default';
});

function updateVolume(event) {
    const rect = volumeTimeline.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const timelineWidth = rect.width;

    const newVolume = Math.max(0, Math.min(clickPosition / timelineWidth, 1));
    volumeSlider.value = newVolume;
    audioPlayer.volume = newVolume;
    volumeProgress.style.width = `${newVolume * 100}%`;
    volumeProgressThumb.style.left = `${newVolume * 100}%`;
}