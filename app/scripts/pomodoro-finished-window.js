const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let pomoTxtFilePath;

$('#save-btn').on('click', function () {
    // Obtén el texto del textarea
    const text = $('textarea').val();

    // Crea el nombre del archivo con el formato 'Pomodoro-yymmdd'
    const date = new Date();
    // const fileName = `Pomodoro-${date.getFullYear().toString().substr(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.txt`;
    const fileName = `Pomodoro-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.txt`;

    let filePath;
    
    // Define la ruta al archivo
    if (pomoTxtFilePath) {
        filePath = path.join(pomoTxtFilePath, fileName);
    } else {
        filePath = path.join(__dirname, fileName);
    }

    // Comprueba si el archivo ya existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, crea un nuevo archivo y escribe el texto
            fs.writeFile(filePath, text, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    ipcRenderer.send('pomofinish-close-window');
                }
            });
        } else {
            // Si el archivo ya existe, agrega el texto al final del archivo
            fs.appendFile(filePath, '\n\n' + text, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    ipcRenderer.send('pomofinish-close-window');
                }
            });
        }
    });
});

$('#cancel-btn').on('click', function () {
    ipcRenderer.send('pomofinish-close-window');
});

ipcRenderer.on('get-file-path', (event, path) => {
    pomoTxtFilePath = path;
});