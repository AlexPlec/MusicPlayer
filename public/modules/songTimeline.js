let isDragging = false;

timeline.addEventListener('click', function (event) {
    if (!isDragging) {
        const rect = timeline.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const timelineWidth = rect.width;

        const newTime = (clickPosition / timelineWidth) * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
    }
});

timeline.addEventListener('mousedown', function (event) {
    isDragging = true;
    updateProgress(event);
});

document.addEventListener('mousemove', function (event) {
    if (isDragging) {
        updateProgress(event);
    }
});

function updateProgress(event) {
    const rect = timeline.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const timelineWidth = rect.width;

    const newTime = (clickPosition / timelineWidth) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;

    const progressPercentage = (newTime / audioPlayer.duration) * 100;
    progress.style.width = `${progressPercentage}%`;
}

document.addEventListener('mouseup', function () {
    isDragging = false;
});