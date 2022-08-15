import { app, BrowserWindow, ipcMain } from 'electron'
import * as Messages from "../src/messages";

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#191622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners () {
  
  /** 
   * get all of the message types and listen to them
  */
  
  ipcMain.on("ping", (event, message) => {
    console.log("main thread received message: " + JSON.stringify(message))
    var pong = new Messages.Pong("message was received and processed!");
    console.log("Sending response: " + JSON.stringify(pong));
    mainWindow?.webContents.send(pong.response_name(), pong);
  });

  ipcMain.on("exit", (event, message) => {
    console.log("main thread received message: " + JSON.stringify(message))
    app.quit();
  });

}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
