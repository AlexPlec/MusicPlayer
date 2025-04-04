let isDragging = false;
let mouseDraggin = false;

timeline.addEventListener('click', function (event) {
    if (!isDragging) {
        updateProgress(event);
    }
});

timeline.addEventListener('mousedown', function () {
    isDragging = true;
    document.body.style.cursor = 'pointer';
    audioPlayer.pause();
});

document.addEventListener('mousemove', function (event) {
    if (isDragging) {
        requestAnimationFrame(() => updateProgress(event));
        mouseDraggin = true;
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    document.body.style.cursor = 'default';
    if (mouseDraggin) {
        audioPlayer.play();
        mouseDraggin = false;
    }
});

function updateProgress(event) {
    const rect = timeline.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const timelineWidth = rect.width;

    const newTime = Math.max(0, Math.min((clickPosition / timelineWidth) * audioPlayer.duration, audioPlayer.duration));
    audioPlayer.currentTime = newTime;

    const progressPercentage = (newTime / audioPlayer.duration) * 100;
    progress.style.width = `${progressPercentage}%`;

    progressThumb.style.left = `${progressPercentage}%`;
}