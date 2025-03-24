module.exports = {

    setupTabs: function () {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.playlist-view').forEach(view => view.classList.remove('active'));

                button.classList.add('active');
                const tab = button.dataset.tab;
                document.getElementById(`${tab}View`).classList.add('active');
            });
        });

        document.getElementById('backToAlbums').addEventListener('click', () => {
            document.getElementById(`albumsView`).classList.add('active');
            document.getElementById(`songsListView`).classList.remove('active');
        });
    }

};