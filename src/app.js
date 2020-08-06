const { ipcRenderer, remote } = require("electron");
const { globalShortcut } = remote;
const jsPDF = require("jsPDF");
const _ = require("lodash");

const base64amiri = require("./amiri-font-base64encoding");
var canvasBuffer = require("electron-canvas-to-buffer");
var fs = require("fs");
globalShortcut.register("Return", () => {
  takeSnapshot();
});
var autotable = require("jspdf-autotable");
let patientNationalCode;
var patientFirstName;
var patientLastName;
var patientAge;
var procedureDate;
let localStream;
let microAudioStream;
let recordedChunks = [];
let numRecordedChunks = 0;
let recorder;
let includeMic = false;
let imageFormat = "image/jpeg";
var listOfSelectedImages = new Map();
var reportItemsData = new Map();
let canvasId = 0;
var rootFile =
  "/Users/alikeshvari/Projects/electron-screen-recorder-master/src";
let filePath;
// let includeSysAudio = false

document.addEventListener("DOMContentLoaded", () => {
  // document
  //   .querySelector("#record-desktop")
  //   .addEventListener("click", recordDesktop);
  document
    .querySelector("#record-camera")
    .addEventListener("click", recordCamera);
  // document
  //   .querySelector("#record-window")
  //   .addEventListener("click", recordWindow);
  // document.querySelector("#play-video").addEventListener("click", playVideo);
  // document
  //   .querySelector("#micro-audio")
  //   .addEventListener("click", microAudioCheck);
  // document.querySelector('#system-audio').addEventListener('click', sysAudioCheck)
  document
    .querySelector("#record-stop")
    .addEventListener("click", stopRecording);

  document
    .querySelector("#snapshot-camera")
    .addEventListener("click", takeSnapshot);

  document
    .querySelector("#make_report")
    .addEventListener("click", generateReport);

  document.querySelector("#snapshot").addEventListener("click", function(e) {
    // e.target is the clicked element!
    // If it was a list item

    if (e.target.matches("canvas")) {
      // List item found!  Output the ID!
      listOfSelectedImages.set(e.target.id, [e.target]);
      console.log("listOfSelectedImages", listOfSelectedImages);
      console.log("hello", e.target);
      console.log("hello", e);
    }
  });
});

const playVideo = () => {
  remote.dialog.showOpenDialog({ properties: ["openFile"] }, filename => {
    console.log(filename);
    let video = document.querySelector("video");
    video.muted = false;
    video.src = filename;
  });
};

const disableButtons = () => {
  // document.querySelector("#record-desktop").disabled = true;
  // document.querySelector("#record-camera").disabled = true;
  // document.querySelector("#record-window").disabled = true;
  document.querySelector("#record-stop").hidden = false;
  document.querySelector("#snapshot-camera").hidden = false;
  document.querySelector("#make_report").hidden = true;
};

const enableButtons = () => {
  // document.querySelector("#record-desktop").disabled = false;
  // document.querySelector("#record-camera").disabled = false;
  // document.querySelector("#record-window").disabled = false;
  document.querySelector("#record-stop").hidden = true;
  document.querySelector("#snapshot-camera").hidden = false;
  document.querySelector("#make_report").hidden = false;
};

const cleanRecord = () => {
  let video = document.querySelector("video");
  video.controls = false;
  recordedChunks = [];
  numRecordedChunks = 0;
};

ipcRenderer.on("source-id-selected", (event, sourceId) => {
  // Users have cancel the picker dialog.
  if (!sourceId) return;
  console.log(sourceId);
  onAccessApproved(sourceId);
});

const recordCamera = () => {
  cleanRecord();
  patientNationalCode = document.getElementById("pNationalCode").value;
  console.log("this is patient national code", patientNationalCode);
  if (patientNationalCode == "" || patientNationalCode == null) {
    document.querySelector("#alert").hidden = false;
  } else {
    document.querySelector("#alert").hidden = true;
    navigator.webkitGetUserMedia(
      {
        audio: false,
        video: { mandatory: { minWidth: 1280, minHeight: 720 } }
      },
      getMediaStream,
      getUserMediaError
    );

    // globalShortcut.register("Return", () => {
    //   takeSnapshot();
    // });
    enableButtons();
  }
};

const takeSnapshot = () => {
  navigator.webkitGetUserMedia(
    {
      audio: false,
      video: { width: { min: 1280 }, height: { min: 720 } }
    },
    getMediaStreamAndDraw,
    getUserMediaError
  );
};

function printRow(doc, row, settings) {
  pointer = settings.x;
  console.log("listOfSelectedImages", listOfSelectedImages);
  for (let imageId of row) {
    let image = listOfSelectedImages.get(imageId)[0];
    console.log("this is image:", image);
    doc.addImage(
      image.toDataURL("image/jpeg,1.0"),
      "png",
      pointer,
      settings.y,
      settings.xDim,
      settings.yDim
    );
    // listOfSelectedImages.get("canvasId")[0];
    let text = listOfSelectedImages.get(imageId)[1];
    doc.text(
      text,
      pointer + settings.yDim / 2 - text.length,
      settings.y + settings.yDim + 3
    );
    let text2;
    if (
      listOfSelectedImages.get(imageId)[2] != undefined &&
      listOfSelectedImages.get(imageId)[2] != null &&
      listOfSelectedImages.get(imageId)[2] != ""
    ) {
      text2 = listOfSelectedImages.get(imageId)[2];
      doc.text(
        text2,
        pointer + settings.yDim / 2 - text.length,
        settings.y + settings.yDim + 6
      );
    }

    pointer = pointer + settings.xDim + settings.rowSpace;
  }
  console.log("this is po'``inter:", pointer);

  return pointer;
}

const generateReport = () => {
  console.log("we are generating report.");

  var doc = new jsPDF({ filters: ["ASCIIHexEncode"] });
  const AmiriRegular = base64amiri.base64;
  console.log("This is patient last name" + patientLastName);
  doc.addFileToVFS("Amiri-Regular.ttf", AmiriRegular);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri"); // set font
  doc.setFontSize(20);
  doc.setTextColor(255, 0, 0);
  doc.text("گزارش کولونوسکپی", 80, 10);
  doc.setLineWidth(0.5);
  doc.line(5, 24, 205, 25);
  doc.setTextColor(100);
  doc.setFontSize(10);
  console.log("this is patient first name:", patientFirstName);

  let allRows = _.chunk(Array.from(listOfSelectedImages.keys()), 4);
  console.log("all rows", allRows);
  const settings = {
    x: 5,
    y: 30,
    xDim: 45,
    yDim: 48.5,
    rowSpace: 2,
    columnSpace: 10,
    newPageY: 55
  };
  doc.setTextColor(0, 0, 0);
  doc.text(
    "نام بیمار:  " + patientFirstName + " " + patientLastName,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 12,
    20
  );
  doc.text(
    "سن:  " + patientAge,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 40,
    20
  );
  doc.text(
    "تاریخ:   " + patientDate,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 75,
    20
  );
  doc.setTextColor(100);
  doc.cell(
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 180,
    10,
    50,
    10,
    " ",
    5,
    "center"
  );
  doc.text(
    "شماره پرونده:  " + patientNationalCode,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 175,
    15
  );

  var xPoint = settings.x;
  var yPoint = settings.y;
  var xDim = settings.xDim;
  var yDim = settings.yDim;

  for (row of allRows) {
    if (settings.y + settings.yDim + settings.columnSpace <= 297) {
      printRow(doc, row, settings);
      settings.y = settings.y + settings.yDim + settings.columnSpace;
    } else {
      doc.addPage();
      settings.x = 5;
      settings.y = 10;
      printRow(doc, row, settings);
    }
    yPoint += yDim;
  }
  if (settings.y + settings.yDim + settings.columnSpace <= 297) {
    doc.text("Hello", 20, yPoint + 20);
  } else {
    doc.addPage();
    doc.text("Hello", 20, yPoint + 20);
  }

  // for(item in reportItems){
  //   if (settings.y + settings.yDim + settings.columnSpace <= 297) {
  //     doc.setTextColor(255, 0, 0);
  //     doc.text("Findings:", 5, settings.y);
  //     settings.y = settings.y + 5;
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(item+":"+item.value, 5, settings.y);
  //   } else {
  //     doc.addPage();
  //     settings.x = 5;
  //     settings.y = 10;
  //   }
  // }

  doc.save("test.pdf");
};

const recorderOnDataAvailable = event => {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data);
    numRecordedChunks += event.data.byteLength;
  }
};

const stopRecording = () => {
  console.log("Stopping record and starting download");
  recorder.stop();
  enableButtons();
  console.log(recordedChunks);
  download();
  cleanRecord();
};

const play = () => {
  // Unmute video.
  let video = document.querySelector("video");
  video.controls = true;
  video.muted = false;
  let blob = new Blob(recordedChunks, { type: "video/webm" });
  video.src = window.URL.createObjectURL(blob);
};

const download = () => {
  var save = function() {
    filePath = rootFile + "/" + patientNationalCode;
    console.log(recordedChunks);
    toArrayBuffer(new Blob(recordedChunks, { type: "video/webm" }), function(
      ab
    ) {
      console.log(ab);
      var buffer = toBuffer(ab);
      var file = "Video" + `.webm`;
      console.log("it is the path:", filePath + file);
      fs.writeFile(filePath + "/" + file, buffer, function(err) {
        if (err) {
          console.error("Failed to save video " + err);
        } else {
          console.log("Saved video: " + file);
        }
      });
    });
  };
  recorder.onstop = save;
};

const getMediaStream = stream => {
  patientNationalCode = document.getElementById("pNationalCode").value;
  patientFirstName = document.getElementById("pFirstName").value;
  patientLastName = document.getElementById("pLastName").value;
  patientAge = document.getElementById("pAge").value;
  patientDate = document.getElementById("pDate").value;
  console.log(
    "document.getElementById(pFirstName).value",
    document.getElementById("pFirstName").value
  );
  console.log("This is patient national code", patientNationalCode);

  filePath = rootFile + "/" + patientNationalCode;
  fs.mkdir(filePath, { recursive: true }, err => {
    if (err) throw err;
  });

  let video = document.querySelector("video");

  video.srcObject = stream;
  video.play();
  // video.src = URL.createObjectURL(stream);
  localStream = stream;

  stream.onended = () => {
    console.log("Media stream ended.");
  };

  let videoTracks = localStream.getVideoTracks();

  if (includeMic) {
    console.log("Adding audio track.");
    let audioTracks = microAudioStream.getAudioTracks();
    localStream.addTrack(audioTracks[0]);
  }

  try {
    console.log("Start recording the stream.");
    recorder = new MediaRecorder(stream);
  } catch (e) {
    console.assert(false, "Exception while creating MediaRecorder: " + e);
    return;
  }
  recorder.ondataavailable = recorderOnDataAvailable;
  recorder.onstop = () => {
    console.log("recorderOnStop fired");
  };
  recorder.start();
  console.log("Recorder is started.");
  disableButtons();
};
function toArrayBuffer(blob, cb) {
  let fileReader = new FileReader();
  fileReader.onload = function() {
    let arrayBuffer = this.result;
    cb(arrayBuffer);
  };
  fileReader.readAsArrayBuffer(blob);
}

function toBuffer(ab) {
  let buffer = Buffer.alloc(ab.byteLength);
  let arr = Uint8Array(ab);
  for (let i = 0; i < arr.byteLength; i++) {
    buffer[i] = arr[i];
  }
  return buffer;
}
var regions = [
  " ",
  "Anus",
  "Rectum",
  "Sigmoid",
  "Descending colon",
  "Splenic flexture",
  "Transvers colon",
  "Hepatic flexure",
  "Ascending colon",
  "Cecum",
  "Ileun",
  "Appendix orifice"
];
var patologies = [
  "",
  "Diverticala orifice",
  "Fistula orifice",
  "Tumor",
  "Polyp",
  "Sinus orifice",
  "Anastomsis",
  "Scar of tumor",
  "Fissure",
  "skin tag",
  "Heamorroidal tissue",
  "Hypertrophied papilla",
  "Ulcer"
];
const changeContentOfSelect = function() {
  console.log(this);

  listOfSelectedImages.get(this.id)[1] = this.value;
  console.log(listOfSelectedImages.get(this.id));
};

const changeContentOfPatologies = function() {
  console.log(this);

  listOfSelectedImages.get(this.id)[2] = this.value;
  console.log(listOfSelectedImages.get(this.id));
};

const getMediaStreamAndDraw = stream => {
  try {
    var canvas = document.createElement("canvas");
    canvas.height = 480;
    canvas.width = 640;

    var context = canvas.getContext("2d");

    let li = document.createElement("li");
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "checkbox" + canvasId);

    let label = document.createElement("label");
    label.setAttribute("for", "checkbox" + canvasId);
    label.appendChild(canvas);
    li.appendChild(checkbox);
    li.appendChild(label);

    let region = document.createElement("select");
    region.setAttribute("id", canvasId);
    region.setAttribute("class", "form-control");
    region.setAttribute("placeholder", "ناحیه");
    $(region).change(changeContentOfSelect);

    for (i = 0; i < regions.length; i++) {
      let option = document.createElement("option");
      option.setAttribute("value", regions[i]);
      option.text = regions[i];
      region.appendChild(option);
    }

    let patology = document.createElement("select");
    patology.setAttribute("id", canvasId);
    patology.setAttribute("class", "form-control");
    patology.setAttribute("placeholder", "عارضه");
    $(patology).change(changeContentOfPatologies);
    for (i = 0; i < patologies.length; i++) {
      let option = document.createElement("option");
      option.setAttribute("value", patologies[i]);
      option.text = patologies[i];
      patology.appendChild(option);
    }
    canvas.id = canvasId++;
    li.appendChild(region);
    li.appendChild(patology);

    const video = document.getElementById("video");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the DataUrl from the Canvas
    const url = canvas.toDataURL("image/png", 0.8);

    // remove Base64 stuff from the Image
    const base64Data = url.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(
      filePath + "/" + canvasId + ".png",
      base64Data,
      "base64",
      function(err) {
        if (err) throw err;
        else console.log("Write of", filePath, "was successful");
      }
    );

    snapshot.appendChild(li);
  } catch (e) {
    console.assert(false, "Exception while Drawing the image " + e);
    return;
  }
  // recorder.ondataavailable = recorderOnDataAvailable;
  recorder.onstop = () => {
    console.log("recorderOnStop fired");
  };

  console.log("Recorder is started.");
  disableButtons();
};

const getUserMediaError = () => {
  console.log("getUserMedia() failed.");
};

const onAccessApproved = id => {
  if (!id) {
    console.log("Access rejected.");
    return;
  }
  console.log("Window ID: ", id);
  navigator.webkitGetUserMedia(
    {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: id,
          maxWidth: window.screen.width,
          maxHeight: window.screen.height
        }
      }
    },
    getMediaStream,
    getUserMediaError
  );
};
