const {
  app,
  Menu,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
} = require("electron");
const path = require("path");
const { dialog } = require("electron");
const ftp = require("./ftp");
const ip = require("ip");
let app_dir = process.cwd();
let app_auth = false;
let app_port = 21;
function isDev() {
  return process.mainModule.filename.indexOf("app.asar") === -1;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    maxWidth: 400,
    maxHeight: 600,
    minWidth: 400,
    minHeight: 600,
    show: false,
    center: true,
    frame: false,
    icon: path.join(__dirname, "images/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: isDev() ? true : false,
    },
  });

  console.log(isDev());
  mainWindow.menuBarVisible = false;
  // and load the index.html of the app.
  mainWindow.moveTop();
  mainWindow.focus();
  mainWindow.loadURL(path.join(__dirname, "index.html"));
  ipcMain.on("minimize", () => {
    mainWindow.hide();
  });
  ipcMain.on("close", () => {
    mainWindow.close();
  });
  ipcMain.on("ftp:run", () => {
    ftp.Run(app_dir, app_auth, app_port);
  });
  ipcMain.on("ftp:close", () => {
    ftp.close();
  });
  ipcMain.on("ftp:auth", (event, { auth }) => {
    app_auth = auth;
    console.log({ app_auth });
  });

  ipcMain.on("ftp:root", (event, { root_dir }) => {
    app_dir = root_dir;
    console.log({ root_dir });
  });

  ipcMain.on("ftp:port", (event, { port }) => {
    app_port = port;
    console.log({ port });
  });
  ipcMain.on("cwd:get", () => {});
  ipcMain.on("open:dir", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    if (canceled) {
      return;
    } else {
      mainWindow.webContents.send("set:dir", filePaths[0]);
      app_dir = filePaths[0];
    }
  });
  ipcMain.on("refresh", () => {
    console.log("refresh");
    app.exit();
    app.relaunch();
  });
  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.show();
    mainWindow.webContents.send("info", {
      cwd: process.cwd(),
      ip: ip.address(),
      port: app_port,
    });
  });

  let tray = new Tray(
    nativeImage.createFromPath(path.join(__dirname, "images/icon.png"))
  );

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "exist",
      click: () => {
        mainWindow.close();
      },
    },
  ]);

  tray.on("click", () => {
    mainWindow.show();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
