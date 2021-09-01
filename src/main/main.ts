/**
 * Entry point of the Election app.
 */
import * as path from 'path';
import * as url from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain } from 'electron';

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: true,
      webSecurity: true,
      devTools: process.env.NODE_ENV !== 'production',
      preload: path.join(app.getAppPath(), 'preload.bundled.js')
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  ).finally(() => { /* no action */ });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

import * as E from "fp-ts/lib/Either"
import { parseSave } from "./main/tts_save_file"
import * as API from "_/shared/API"

ipcMain.on(API.channel, async (event, arg) => {
  console.log(`Req: ${event} ${arg}`);

  var req = <API.Req>arg
  switch (req[0]) {
    case API.ReqT.PARSE_SAVE:
      let [, savePath] = req

      parseSave(savePath)
      .then(x => {
        const res = <API.Resp>[API.RespT.PARSE_SAVE_RESULT, E.right({ urls: Array.from(x).map(x => x.extractedUrl) })]

        event.reply(API.channel, res);
      })
      .catch((err:Error) => {
        const res = <API.Resp>[API.RespT.PARSE_SAVE_RESULT, E.left(err.message)]

        event.reply(API.channel, res);
      })
      break;

    default:
      console.log(`Unknown ${req}`);
      break;
  }
});

// Use electron-reloader for hot reload while developing if possible, ignore if not
try {
  module.filename = "";
  require('electron-reloader')(module);
} catch (_) { };