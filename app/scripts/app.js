const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

'use strict';
const shell = require('electron').shell;
// const { BrowserWindow } = require('@electron/remote');

let currentSavePath = null;

class Timer {
    constructor(minutes, seconds = 60) {
        this.minutes = minutes;
        this.seconds = seconds;
        this.initialMinutes = minutes;
        this.initialSeconds = seconds;
        this.timer;
        this.pomodoroTime;
    }

    startTimer(display) {
        this._initializePomotime();
        this.timer = this.pomodoroTime;
        clearInterval(this.pomodoroIntervalId);

        this.pomodoroIntervalId = setInterval(() => {
            if (--(this.timer) < 0) {
                this.timer = this.pomodoroTime;
            }

            this.minutes = parseInt(this.timer / 60, 10);
            this.seconds = parseInt(this.timer % 60, 10);

            this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
            this.seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;

            display.textContent = this.minutes + ":" + this.seconds;

            if (this.minutes == 0 && this.seconds == 0) {
                notifyUser();
                this.stopTimer();

                ipc.send('pomodoro-finished');
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.pomodoroIntervalId);
    }

    resetTimer(selector) {
        this.minutes = this.initialMinutes;
        this.seconds = this.initialSeconds;
        clearInterval(this.pomodoroIntervalId);
        document.querySelector(selector).textContent = `${this._getDoubleDigit(this.initialMinutes)}:00`;
    }

    _getDoubleDigit(number) {
        const filledNumber = '0' + number.toString();
        return filledNumber.length >= 3 ? filledNumber.slice(1, filledNumber.length) : filledNumber;
    }

    _initializePomotime() {
        if (this.minutes == this.initialMinutes && this.seconds == this.initialSeconds) {
            this.pomodoroTime = this.minutes * this.seconds;
        } else {
            this.pomodoroTime = this.minutes * 60 + this.seconds;
        }
    }
}

class ThemeManager {
    constructor() {
        this.activeTheme = 'light';
        this.nodes = document.querySelectorAll('link[rel=stylesheet].alternate');
        this.tabTitles = $('.nav > li > a');
    }

    toggleTheme() {
        if (this.activeTheme === 'light') {
            this.activeTheme = 'dark';
            this.nodes.forEach(function (node) {
                if (node.id === 'dark') {
                    node.disabled = false;
                } else {
                    node.disabled = true;
                }
            })
            this.tabTitles.toggleClass("dark");
        } else {
            this.activeTheme = 'light';
            this.nodes.forEach(function (node) {
                if (node.id === 'light') {
                    node.disabled = false;
                } else {
                    node.disabled = true;
                }
            })
            this.tabTitles.toggleClass("dark");
        }
    }
}

let themeManager = new ThemeManager();


var display = document.querySelector('#time');
var display_short = document.querySelector('#time_short');
var display_long = document.querySelector('#time_long');



let normalTimer = new Timer(25);

const showOnlyTimerAndButtons = () => {
    $('nav').hide();
    $('body').css('padding-top', 0);
    $('ul.nav-tabs').hide();
    $('#pomodoro > div.container:first').css('font-size', '8px');
    $('#time').css({
        'margin-top': '5px',
        'margin-bottom': '0px'
    });
    $('.btn').css('padding', '1px 6px');
};

const showAllAgain = () => {
    $('nav').show();
    $('body').css('padding-top', 34);
    $('ul.nav-tabs').show();
    $('#pomodoro > div.container:first').css('font-size', '14px');
    $('#time').css({
        'margin-top': '20px',
        'margin-bottom': '10px'
    });
    $('.btn').css('padding', '6px 12px');
};

$('#start').click(() => {
    showOnlyTimerAndButtons();

    normalTimer.startTimer(display);
    $('#stop').show();
    $('#start').hide();

    ipc.send('pomodoro-started');
})

$('#stop').click(() => {
    showAllAgain();

    normalTimer.stopTimer();
    $('#start').show();
    $('#stop').hide();

    ipc.send('pomodoro-stopped');
});

$('#reset').click(() => {
    showAllAgain();

    normalTimer.resetTimer('#time');

    $('#start').show();
    $('#stop').hide();

    ipc.send('pomodoro-stopped');
});

let shortTimer = new Timer(5);

$('#short_start').click(() => {
    shortTimer.startTimer(display_short);
    $('#short_stop').show();
    $('#short_start').hide();
})

$('#short_stop').click(() => {
    shortTimer.stopTimer();

    $('#short_start').show();
    $('#short_stop').hide();
});

$('#short_reset').click(() => {
    shortTimer.resetTimer('#time_short');

    $('#short_start').show();
    $('#short_stop').hide();
});

let longTimer = new Timer(10);

$('#long_start').click(() => {
    longTimer.startTimer(display_long);

    $('#long_stop').show();
    $('#long_start').hide();
})

$('#long_stop').click(() => {
    longTimer.stopTimer();
    $('#long_start').show();
    $('#long_stop').hide();
});

$('#long_reset').click(() => {
    longTimer.resetTimer('#time_long');

    $('#long_start').show();
    $('#long_stop').hide();
});

// setTimeout(() => {
//     document.getElementById('fake-bar').addEventListener('mousedown', (event) => {
//         const win = BrowserWindow.getFocusedWindow();
//         win.startMoving();
//     });
// }, 2000);

function closeApp() {
    ipc.send('closeApp', 'close');
}

function toggleTheme() {
    themeManager.toggleTheme();
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    let activeTab = e.target.toString();
    let nameActiveTab = activeTab.split('#');

    if (nameActiveTab[1] == 'pomodoro') {
        normalTimer.resetTimer('#time');
    }
    else if (nameActiveTab[1] == 'short') {
        shortTimer.resetTimer('#time_short');
    }
    else {
        longTimer.resetTimer('#time_long');
    }
})



// on start

const configPath = path.join(__dirname, '/configs/vars.txt');


$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

const setCurrentSavePath = (filePath) => {
    currentSavePath = filePath;

    const rows = $('#buttons-container .row');
    if (rows.length > 1) {
        $(rows[0]).hide();
        $(rows[1]).show();
        $('#pomodoro .container:first').show();
    }

    ipcRenderer.send('save-file-path', currentSavePath);
}

setTimeout(() => {
    const { dialog } = require('@electron/remote');

    document.getElementById('choose-folder-btn').addEventListener('click', () => {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                const filePaths = result.filePaths;
                console.log(filePaths);

                const data = `LAST_ROUTE=${filePaths[0]}`;

                fs.writeFile(configPath, data, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        setCurrentSavePath(filePaths[0]);
                    }
                });
            }
        }).catch(err => {
            console.log(err);
        });
    });

    document.getElementById('use-last-folder-btn').addEventListener('click', () => {    
        fs.readFile(configPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
            } else {
                // Extrae la ruta del archivo de la cadena
                const lastRoute = data.split('=')[1];
                console.log(lastRoute);

                setCurrentSavePath(lastRoute);
            }
        });
    });

    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
        } else {
            // Extrae la ruta del archivo de la cadena
            const lastRoute = data.split('=')[1];
            console.log(lastRoute);

            // Inserta la última carpeta guardada en el elemento con id 'last-folder-text'
            const lastFolderElement = document.getElementById('last-folder-text');
            if (lastFolderElement) {
                const displayRoute = lastRoute.length > 44 ? '...' + lastRoute.slice(-44) : lastRoute;
                lastFolderElement.textContent = displayRoute;
            }
        }
    });
}, 2000);
