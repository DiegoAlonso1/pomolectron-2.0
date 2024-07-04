const { ipcRenderer } = require('electron');

$('#continue-btn').on('click', function () {
    ipcRenderer.send('shortbreakfinish-close-window', {
        continue: true,
    });
});

$('#cancel-btn').on('click', function () {
    ipcRenderer.send('shortbreakfinish-close-window', {
        continue: false,
    });
});