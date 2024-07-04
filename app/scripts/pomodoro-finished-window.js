const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { shell } = require('electron');

let pomoTxtFilePath;

$('#save-continue-btn').on('click', function () {
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

    ipcRenderer.send('save-continue-clicked');
});

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
    loadPreviousTxts();
});



// timer

let totalTime = 60; // 1 minuto en segundos
const timerDisplay = document.getElementById('time');
const progressCircle = document.getElementById('progress');
const circumference = 2 * Math.PI * 47; // Circunferencia del círculo
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = `${circumference}`;

function updateTimer() {
    const timeFraction = totalTime / 60;
    const offset = circumference * timeFraction;
    progressCircle.style.strokeDashoffset = offset;

    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (totalTime > 0) {
        totalTime--;
    } else {
        clearInterval(timerInterval);
        // Acciones al finalizar el temporizador
    }
}

const timerInterval = setInterval(updateTimer, 1000);


const loadPreviousTxts = () => {
    fs.readdir(pomoTxtFilePath, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return;
        }

        // Filtra para obtener solo archivos .txt
        const txtFiles = files.filter(file => path.extname(file) === '.txt');

        // Limpia la lista actual
        $('.item-list').empty();

        // Agrega cada archivo .txt a la lista de ítems
        txtFiles.forEach(file => {
            const button = $(`<button type="button" class="list-group-item list-group-item-action">${file}</button>`);
            $('.item-list').append(button);

            // Añade un controlador de eventos click para leer y mostrar el contenido del archivo
            button.click(() => {
                const filePath = path.join(pomoTxtFilePath, file);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading the file:', err);
                        return;
                    }

                    $('#readonly-textarea').val(data);
                });
            });
        });
    });
}

$('#open-folder-btn').on('click', function() {
    shell.openPath(pomoTxtFilePath);
});