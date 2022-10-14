import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as fs from 'fs';
import * as path from 'path';
import * as Messages from "../src/messages";
import * as Responses from "../src/responses";
import { RequestHandler } from './request_handler';
import { MessageHandler } from './message_handler';
import Config from './config';
import { platform } from 'process';

export let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// const assetsPath =
//   process.env.NODE_ENV === 'production'
//     ? process.resourcesPath
//     : app.getAppPath()

export function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1300,
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

async function findEmulator() {
  if (mainWindow == null) {
    console.error("Browserwindow was not defined!");
    dialog.showErrorBox("Invalid window context!", 
      "Browser window was not defined! The application will now close");
    app.exit(0);
    return;
  }
  while (Config.getRyuPath() == null || Config.getRyuPath() == "") {
    // show instructions to the user
    let response = dialog.showMessageBoxSync(mainWindow, {
      title: "Instructions", 
      message: "Please select your Ryujinx executable.",
      buttons: ["ok" , "cancel"]
    });

    if (response != 0) {
      app.exit(0);
      return;
    }

    // let the user point us to ryujinx
    let selectedPath = dialog.showOpenDialogSync(mainWindow, { 
      title: "Please select your Ryujinx executable",
      properties: ['openFile'],
      filters: [ { name: 'Ryujinx Executables', extensions: ['', 'exe'] } ]
    });
    if (!selectedPath || selectedPath.length < 1) {
      console.warn("User cancelled finding ryujinx!");
      app.exit(0);
      continue;
    }
    let ryuPath = selectedPath[0];

    // ensure that the path exists
    if (fs.existsSync(ryuPath)) {
      console.log('given path exists')
    } else {
      dialog.showErrorBox("Invalid path!", 
        "The given path does not exist!");
      continue;
    }

    let fileName = path.basename(ryuPath);
    console.log("filename: " + fileName);
    if (fileName === "Ryujinx" || fileName === "Ryujinx.exe") {
      console.log("setting ryu path: " + ryuPath);
      Config.setRyuPath(ryuPath);
    } else {
      dialog.showErrorBox("Invalid path!", 
        "The given file is not a Ryujinx executable!");
    }
  }
}

async function findRom() {
  if (mainWindow == null) {
    console.error("Browserwindow was not defined!");
    dialog.showErrorBox("Invalid window context!", 
      "Browser window was not defined! The application will now close");
    app.exit(0);
    return;
  }

  while (Config.getRomPath() == null || Config.getRomPath() == "") {
    // show instructions to the user
    let response = dialog.showMessageBoxSync(mainWindow, {
      title: "Instructions", 
      message: "Please select your valid Smash Ultimate 13.0.1 dump.",
      buttons: ["ok" , "cancel"]
    });

    if (response != 0) {
      app.exit(0);
      return;
    }

    // let the user point us to the rom
    let selectedPath = dialog.showOpenDialogSync(mainWindow, { 
      title: "Please select your valid Smash Ultimate dump.", 
      properties: ['openFile'],
      filters: [ { name: 'Switch Roms', extensions: ['nsp', 'xci'] } ]
    });
    if (!selectedPath || selectedPath.length < 1) {
      console.warn("User cancelled finding ultimate dump!");
      app.exit(0);
      continue;
    }
    let romPath = selectedPath[0];

    // ensure that the path exists
    if (fs.existsSync(romPath)) {
      console.log('given path exists')
    } else {
      dialog.showErrorBox("Invalid path!", 
        "The given path does not exist!");
        continue;
    }
    console.log("setting rom path.");
    Config.setRomPath(romPath);
  }
}

async function findSdcard() {
  if (Config.getSdcardPath() != null && Config.getSdcardPath() != "") {
    return;
  }

  var configDir = "";
  if (process.platform == "win32") {
    configDir = process.env.APPDATA + "/Ryujinx";
  } else {
    configDir = "~/.ryujinx";
  }

  if (fs.existsSync(configDir)) {
    console.info("setting sdcard root to " + path.join(configDir, "sdcard"));
    Config.setSdcardPath(path.join(configDir, "sdcard/"));
    // create the sdcard folder if its not there
    if (!fs.existsSync(Config.getSdcardPath())) {
      fs.mkdirSync(Config.getSdcardPath());
    }
  } else {
    console.error("Ryujinx directory not found at " + configDir + "!");
    dialog.showErrorBox("Ryujinx not found!", "Ryujinx directory not found at " + configDir + "!");
    app.quit();
  }
}

async function registerListeners () {
  let requestHandler = new RequestHandler();
  let messageHandler = new MessageHandler();

  // register listening to the request channel
  ipcMain.handle("request", (event, request): Promise<Responses.BaseResponse> => {
    //console.log("main thread received request: " + JSON.stringify(request));
    return requestHandler.handle(request);
  });

  // register listening to the message channel
  ipcMain.on("message", (event, message) => {
    //console.log("main thread received message: " + JSON.stringify(message));
    messageHandler.handle(message as Messages.Message);
  });
}

app.on('ready', createWindow)
  .whenReady()
  .then(findEmulator)
  .then(findRom)
  .then(findSdcard)
  .then(registerListeners)
  .then(() => {
    // create the sdcard folder if its not there
    if (!fs.existsSync(Config.getSdcardPath())) {
      fs.mkdirSync(Config.getSdcardPath());
    }
  })
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
