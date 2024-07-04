'use strict';
const { BrowserWindow } = require('electron')
const { screen } = require('electron');
const electron = require('electron');
const { menubar } = require('menubar');
const ipcMain = require('electron').ipcMain;
const { initialize, enable } = require('@electron/remote/main');

let initialPosition;

initialize();

var mb = menubar({
  dir: __dirname,
  tooltip: "Pomolectron",
  icon: __dirname + "/res/tomato.png",
  browserWindow: {
    width: 300,
    height: 250,
    alwaysOnTop: true,
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

const makeWindowSmall = () => {
  mb.window.setSize(120, 90);

  let { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let x = width - 122;
  let y = height - 92;

  mb.window.setPosition(x, y);
}


const makeWindowBig = () => {
  mb.window.setSize(300, 250);
  mb.window.setPosition(initialPosition[0], initialPosition[1]);
}

ipcMain.on('pomodoro-started', () => {
  makeWindowSmall();
});

ipcMain.on('pomodoro-stopped', () => {
  makeWindowBig();
});

let pomoTxtFilePath;

ipcMain.on('save-file-path', (event, path) => {
    pomoTxtFilePath = path;
});


ipcMain.on('pomodoro-finished', () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile(__dirname + '/views/end-of-pomodoro.html')
  win.center()

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('get-file-path', pomoTxtFilePath);
  });
});

ipcMain.on('closeApp', (event, close) => {
  mb.app.quit();
});

ipcMain.on('pomofinish-close-window', (event) => {
  let window = BrowserWindow.fromWebContents(event.sender);
  window.close();
});

ipcMain.on('shortbreakfinish-close-window', (event, data) => {
  let window = BrowserWindow.fromWebContents(event.sender);
  window.close();

  if (data.continue) {
    const win = BrowserWindow.getAllWindows().find(w => w.getTitle() === 'Pomolectron');

    if (win) {
        win.webContents.send('end-short-break');
    }
  }
});

ipcMain.on('save-continue-clicked', () => {
  const win = BrowserWindow.getAllWindows().find(w => w.getTitle() === 'Pomolectron');

  if (win) {
      win.webContents.send('start-short-break');
  }
})


ipcMain.on('short-break-finished', () => {
  let win = new BrowserWindow({
    width: 250,
    height: 250,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile(__dirname + '/views/end-of-short-break.html')
  win.center();
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
  setTimeout(() => {
    initialPosition = mb.window.getPosition();
    enable(mb.window.webContents);
  }, 1000);
  //mb.window.openDevTools()
})