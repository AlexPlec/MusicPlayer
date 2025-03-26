function switchView(activeViewId) {
    // Remove 'active' class from all tabs and views
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll('.playlist-view').forEach(view => view.classList.remove('active'));

    // Add 'active' class to the selected tab and view
    const activeTab = document.querySelector(`.tab-button[data-tab="${activeViewId.replace('View', '')}"]`);
    if (activeTab) activeTab.classList.add('active');

    const activeView = document.getElementById(activeViewId);
    if (activeView) {
        activeView.classList.add('active');
    }
}

module.exports = {
    setupTabs: function () {
        // Handle tab button clicks
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                switchView(`${tab}View`); // Switch to the corresponding view
                backToAlbums.classList.remove('activeArtists');
            });
        });

        backToAlbums.addEventListener('click', () => {
            switchView('albumsView'); // Always go back to Artists View
            if (backToAlbums.classList[0] === 'activeArtists') { switchView('albumsListView'); }
        });

        // Handle "Back to Artists" button click
        backToArtists.addEventListener('click', () => {
            switchView('artistsView'); // Always go back to Artists View
        });
    },
};