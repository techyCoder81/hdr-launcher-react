import { app, BrowserWindow, ipcMain } from 'electron'
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { RequestHandler } from './request_handler';
import { MessageHandler } from './message_handler';

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
  let requestHandler = new RequestHandler();
  let messageHandler = new MessageHandler();

  // register listening to the request channel
  ipcMain.handle("request", (event, request): Responses.BaseResponse => {
    console.log("main thread received request: " + JSON.stringify(request));
    let response = requestHandler.handle(request);
    console.info("responding to request " + request.id 
      + " with response: " + JSON.stringify(response));
    return response;
  });

  // register listening to the message channel
  ipcMain.on("message", (event, message) => {
    console.log("main thread received message: " + JSON.stringify(message));
    messageHandler.handle(message as Messages.Message);
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
