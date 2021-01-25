const electron = require("electron");
const app = electron.app;
const {
  BrowserWindow,
  BrowserView,
  ipcMain,
  dialog,
  Menu
} = require("electron");
const PDFWindow = require("electron-pdf-window");
const applicationMenu = require("./application-menu");

let patientNationalCode;
var patientFirstName;
var patientLastName;
var patientAge;
var patientGender;
var rootFile;
var procedureDate;
var fromUsb;
var fs = require("fs");

let mainWindow;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    maximizable: true,
    backgroundColor: "#fafafa",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  imageSelection = new BrowserWindow({
    height: 500,
    width: 600,
    id: "selectionPage",
    backgroundColor: "#fafafa",
    parent: mainWindow,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  fileBaseImageSelection = new BrowserWindow({
   
    id: "selectionPageFile",
    backgroundColor: "#fafafa",
    parent: mainWindow,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  usbList = new BrowserWindow({
    parent: mainWindow,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Menu.setApplicationMenu(applicationMenu);
  // createWindow();
  // mainWindow.loadURL("file://" + __dirname + "/fileBaseImageSelection.html");
  // mainWindow.loadURL("file://" + __dirname + "/usbList.html");
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  mainWindow.maximize();
});
let patientId;
let allCanvases;

ipcMain.on("openImageSelection", (event, patientData) => {
  console.log("This is patientNational Id", patientData);
  patientId = patientData.patientNationalCode;
  patientNationalCode = patientData.patientNationalCode;
  rootFile = patientData.rootFile;
  patientFirstName = patientData.patientFirstName;
  patientLastName = patientData.patientLastName;
  patientAge = patientData.patientAge;
  procedureDate = patientData.procedureDate;
  patientGender = patientData.patientGender;
  mainWindow.loadURL("file://" + __dirname + "/imageSelection.html");
});

ipcMain.on("openFileImageSelection", (event, patientData) => {
  console.log("This is patientNational Id", patientData);
  patientId = patientData.patientNationalCode;
  patientNationalCode = patientData.patientNationalCode;
  rootFile = patientData.rootFile;
  patientFirstName = patientData.patientFirstName;
  patientLastName = patientData.patientLastName;
  patientAge = patientData.patientAge;
  procedureDate = patientData.procedureDate;
  patientGender = patientData.patientGender;
  fromUsb = patientData.fromUsb
  mainWindow.loadURL("file://" + __dirname + "/fileBaseImageSelection.html");
});

ipcMain.on("processEnd", (event, endingData) => {
  console.log("going to finish the process");
  mainWindow.loadURL("file://" + __dirname + "/index.html");
})

ipcMain.on("getPatientId", (event, data) => {
  console.log("patient Id:", patientNationalCode);
  console.log("first name:", patientFirstName);
  console.log("patient Gender :", patientGender);
  event.returnValue = {
    patientId: patientId,
    patientNationalCode: patientNationalCode,
    patientFirstName: patientFirstName,
    patientLastName: patientLastName,
    patientAge: patientAge,
    procedureDate: procedureDate,
    patientGender: patientGender,
    rootFile: rootFile,
    fromUsb : fromUsb
  };

  console.log("this is retuen value:", event.returnValue)
});

ipcMain.on("sendAllCanvases", (event, listOfAllCanvases) => {
  allCanvases = listOfAllCanvases;
});

ipcMain.on("getAllCanvases", (event, data) => {
  event.returnValue = allCanvases;
});