'use strict';
const { BrowserWindow } = require('electron')
const { screen } = require('electron');
const electron = require('electron');
const { menubar } = require('menubar');
const ipcMain = require('electron').ipcMain;
const { initialize, enable } = require('@electron/remote/main');

initialize();

var mb = menubar({
  dir: __dirname,
  tooltip: "Pomolectron",
  icon: __dirname + "/res/tomato.png",
  browserWindow: {
    width: 300,
    height: 250,
    alwaysOnTop: false,
    movable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  }
});

const contextMenu = electron.Menu.buildFromTemplate([
  {
    label: 'About',
    click() {
      electron.dialog.showMessageBox({ title: "Pomolectron", type: "info", message: "A pomodoro app in your menubar/tray. \nMIT Copyright (c) 2017 Amit Merchant <bullredeyes@gmail.com>", buttons: ["Close"] });
    }
  },
  {
    label: 'Website',
    click() {
      electron.shell.openExternal("https://github.com/amitmerchant1990/pomolectron");
    }
  },
  {
    type: 'separator'
  },
  {
    label: 'Quit',
    click() {
      mb.app.quit();
    }
  }

]);

ipcMain.on('pomodoro-started', () => {
  mb.window.setSize(120, 90);
  mb.window.setAlwaysOnTop(true);

  // Obtener las dimensiones de la pantalla
  let { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Calcular la posición de la ventana para que se ubique en la parte inferior derecha
  let x = width - 122;
  let y = height - 92;

  // Mover la ventana a la posición calculada
  mb.window.setPosition(x, y);
});

ipcMain.on('pomodoro-stopped', () => {
  mb.window.setSize(300, 250);
  mb.window.setAlwaysOnTop(false);
});

ipcMain.on('pomodoro-finished', () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  win.loadFile(__dirname + '/views/end-of-pomodoro.html')
  win.center()
});

ipcMain.on('closeApp', (event, close) => {
  mb.app.quit();
});

mb.on('ready', () => {
  global.sharedObj = {
    hide: mb.hideWindow,
    quit: mb.app.quit,
    pinned: false
  }

  console.log('Pomolectron is ready to serve in the menubar.');


  if (process.platform == 'win32') {
    mb.tray.setContextMenu(contextMenu);
  } else {
    mb.tray.on("right-click", () => {
      mb.tray.popUpContextMenu(contextMenu);
    });
  }
});

mb.on('after-create-window', function () {
  //mb.window.openDevTools()
})


mb.on('before-create-window', function () {
  enable(mb.window.webContents);
  //mb.window.openDevTools()
})