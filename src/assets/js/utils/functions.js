const { app, Menu, BrowserWindow } = require("electron");
const path = require("path");
const os = require("os");

// Fenêtre principale

let mainWindow = undefined;

const getWindow = () => {
    return mainWindow;
}

const destroyWindow = () => {
    if (mainWindow) {
        mainWindow.close();
        mainWindow = undefined;
    } else {
        return;
    }
}

const createWindow = async () => {
    // Processus de rendue

    destroyWindow();
    mainWindow = new BrowserWindow({
        title: "Site-33 Launcher",
        width: 1280,
        height: 720,
        resizable: false,
        icon: `./src/assets/images/icon.${os.platform() === "win32" ? "ico" : "png"}`,
        transparent: os.platform() === 'win32',
        frame: os.platform() !== 'win32',
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    })

    Menu.setApplicationMenu(null);

    mainWindow.setMenuBarVisibility(null);
    mainWindow.loadFile(path.join(app.getAppPath(), "src", "launcher.html"));

    mainWindow.once("ready-to-show", () => {
        if (mainWindow) {
            mainWindow.show();
        }
    })
    
    mainWindow.on("minimize", (event) => {
        event.preventDefault();
        mainWindow.hide();
    })
}

// * * *

// Fenêtre de chargement du launcher

let updateWindow = undefined;

const getUpdateWindow = () => {
    return updateWindow;
}

const destroyUpdateWindow = () => {
    if (!updateWindow) {
        return;
    }

    updateWindow.close();
    updateWindow = undefined;
}

const loadingWindow = () => {
    // Processus de rendue
    
    updateWindow = new BrowserWindow({
        title: "Site-33 Mise à jour...",
        width: 400,
        height: 500,
        resizable: false,
        icon: `./src/assets/images/icon.${os.platform() === "win32" ? "ico" : "png"}`,
        transparent: os.platform() === 'win32',
        frame: false,
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    })

    Menu.setApplicationMenu(null);

    updateWindow.setMenuBarVisibility(null);
    updateWindow.loadFile(path.join(app.getAppPath(), "src", "index.html"));

    updateWindow.once("ready-to-show", () => {
        if (updateWindow) {
            updateWindow.show();
        }
    })
}

// * * *

module.exports = {
    getWindow,
    destroyWindow,
    createWindow,
    loadingWindow,
    getUpdateWindow,
    destroyUpdateWindow
};