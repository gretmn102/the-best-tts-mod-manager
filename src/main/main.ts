/**
 * Entry point of the Election app.
 */
import * as path from 'path'
import * as url from 'url'
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain } from 'electron'

let mainWindow: Electron.BrowserWindow | null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: true,
      webSecurity: true,
      devTools: process.env.NODE_ENV !== 'production',
      preload: path.join(app.getAppPath(), 'preload.bundled.js'),
    },
  })

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  ).finally(() => { /* no action */ })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

import * as API from '../shared/API'
import { handle, state } from './core'

// eslint-disable-next-line @typescript-eslint/no-misused-promises
ipcMain.on(API.channel, async (event, arg) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`Req: ${event} ${arg}`)
  const res = await handle(arg, x => event.sender.send(API.channel, x))
  event.reply(API.channel, res)
})

ipcMain.on(API.getStateChannel, (event, arg) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`getStateChannel: ${event} ${arg}`)
  const state2:API.GetStateResult = state
  event.reply(API.getStateChannel, state2)
})

// Use electron-reloader for hot reload while developing if possible, ignore if not
try {
  module.filename = ''
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
  require('electron-reloader')(module)
// eslint-disable-next-line no-empty
} catch (_) { }
