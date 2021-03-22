const {
  ipcRenderer,
  remote,
  shell,
  dialog,
  app
} = require("electron");
// const {
//   Menu,
//   MenuItem
// } = remote;
const videoSnapshot = require('video-snapshot');
const _ = require("lodash");
const electronLocalshortcut = require("electron-localshortcut");
const fs = require("fs");
const fsp = require('fs').promises;
const path = require("path")
const moment = require("jalali-moment");
const {
  resolve
} = require("path");
const {
  reject,
  iteratee,
  isTypedArray
} = require("lodash");
const { promises } = require("dns");
const { default: VideoSnapshot } = require("video-snapshot");
const e2p = s => s.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
electronLocalshortcut.register(remote.getCurrentWindow(), "ENTER", () => {
  takeSnapshot(video);
});
// const jsPDF = require("jsPDF");
let localStream;
let microAudioStream;
let recordedChunks = [];
let numRecordedChunks = 0;
let recorder;
let includeMic = false;
var listOfSelectedImages = new Map();
var listOfAllCanvases = [];
const video = document.querySelector("video");

let canvasId = 0;
var rootFile = undefined;
let filePath;
let numberOfImagesElement;


$("#pDate").value = moment("2020/11/13", "YYYY/MM/DD")
  .locale("fa")
  .format("YYYY/MM/DD");

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#filepathcomponent")
    .addEventListener("click", getStorageFilePath);
});

document.addEventListener("DOMContentLoaded", () => {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  document.getElementById("pDate").value =
    moment(year.toString().concat("/").concat(month.toString()).concat("/").concat(day.toString()), "YYYY/MM/DD")
      .locale("en")
      .format("YYYY/MM/DD")
      .toString()

  document
    .querySelector("#record-camera")
    .addEventListener("click", recordCamera);
  document
    .querySelector("#importFromUsb")
    .addEventListener("click", importFromUsb)
  document
    .querySelector("#record-stop")
    .addEventListener("click", stopRecording);

  document
    .querySelector("#snapshot-camera")
    .addEventListener("click", takeSnapshot);

  document.querySelector("#snapshot").addEventListener("click", function (e) {
    if (e.target.matches("canvas")) {
      // List item found!  Output the ID!
      if (!listOfSelectedImages.has(e.target.id)) {
        listOfSelectedImages.set(e.target.id, [e.target]);
      } else {
        listOfSelectedImages.delete(e.target.id);
      }
    }
  });

});

const importFromUsb = () => {
  readInputData();
  remote.dialog.showOpenDialog({
    properties: ["openDirectory"]
  }).then(
    (data) => {
      if (data.canceled == false) {
        console.log("this is data", path.basename(data.filePaths[0]));
        ipcRenderer.send("openFileImageSelection", {
          patientNationalCode: patientNationalCode,
          patientFirstName: patientFirstName,
          patientLastName: patientLastName,
          patientAge: patientAge,
          procedureDate: procedureDate,
          procedurePractitioner: procedurePractitioner,
          patientGender: patientGender,
          rootFile: data.filePaths[0],
          fromUsb: true
        })
      }

    }
  )
}

const getStorageFilePath = () => {

  const selected = remote.dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory", "promptToCreate"]
  }).then(
    (data) => {
      console.log("this is filepath data", data);
      fsp.writeFile(remote.app.getPath("userData").concat("/settings.txt"), data.filePaths[0]);
    }
  )
  fs.truncateSync(remote.app.getPath("userData").concat("/settings.txt"), 0, function () {
    console.log("problem in truncating the settings file.");
  });
  fs.appendFileSync(remote.app.getPath("userData").concat("/settings.txt"), selected[0]);

  console.log("this is selected:", selected);
};

const defineRootFile = () => {
  // if (!fs.existsSync(remote.app.getPath("userData").concat("/settings.txt"))) {
  //   fs.chmod(remote.app.getPath("userData").concat("/settings.txt"), 0777, () => {
  //     console.log("Trying to write to file");
  //     // fs.writeFileSync('example.txt', "This file has now been edited.");
  //     fs.writeFile(remote.app.getPath("userData").concat("/settings.txt"), " ", (err) => {
  //       if (err) {
  //         console.log(err)
  //       }
  //     });
  //   })

  //   console.log("file settings not exist.")
  // }
  console.log("remote.app.getPath", remote.app.getPath("userData"));
  console.log("file settings exist."); remote.app.getPath("userData")
  fs.readFile(remote.app.getPath("userData").concat("/settings.txt"), (err, data) => {
    if (err) throw err;
    rootFile = data.toString();
    console.log("this is rootfile", rootFile);
    remote.rootFile = rootFile;
  });
};
defineRootFile();

const disableButtons = () => {
  document.querySelector("#record-stop").hidden = false;
  document.querySelector("#snapshot-camera").hidden = false;
  document.querySelector("#make_report").hidden = true;
};

const enableButtons = () => {
  document.querySelector("#record-stop").hidden = true;
  document.querySelector("#snapshot-camera").hidden = false;
  document.querySelector("#make_report").hidden = false;
};

var captureCard = null;
const getCameraSelection = () => {
  try {
    navigator.mediaDevices.enumerateDevices().then(function (result) {
      console.log("devices:", result);

      const listOfCaptureInputs = ["ezcap U3 capture (1bcf:2c99)", "USB2.0DEVICE (534d:0021)", "FaceTime HD Camera(05 ac: 8600)"];
      captureCard = result.filter(
        (device) => {
          console.log("this is device(array element):", device);
          if (device.kind == "videoinput" && device.label == listOfCaptureInputs[0]) {
            return device;
          }

        }
      );
      console.log("this is capture card:", captureCard)

    });

    if (captureCard !== undefined && captureCard !== null) {
      resolve();
    } else {
      reject("capture card not detected");
      throw new Error("capture card not detected")
    }
  } catch (error) {
    console.log(error)
  }




};

getCameraSelection();


const recordCamera = () => {
  // cleanRecord();
  remote.patientNationalCode = document.getElementById("pNationalCode").value;
  if (remote.patientNationalCode == "" || remote.patientNationalCode == null) {
    // Give an error if patient national code is null
    document.querySelector("#alert").hidden = false;
  } else {
    //
    document.querySelector("#alert").hidden = true;
    console.log("this is capture card device in record camera:", captureCard)
    navigator.webkitGetUserMedia({
      audio: false,
      // video: {
      //   deviceId: captureCard.deviceId,
      //   minWidth:1920,
      //   minHeight:1080,
      //   maxWidth:1920,
      //   maxHeight:1080
      // }
      video: {
        deviceId: "f930587079709c9d1d973b3cb7a7fbb04cbde984e6e8ea521c810b7899efbea4",
        width: 1920,
        height: 1080,
      }

    },
      handleMediaStream,
      getUserMediaError
    );

    enableButtons();
    $("#record-camera").blur();
  }
};
let numOfImages = 0;
let listOfSnapshotTimes = [];
const takeSnapshot = video => {
  navigator.webkitGetUserMedia({
    audio: false,
    video: true
  },
    drawTheImage,
    getUserMediaError
  );
  listOfSnapshotTimes.push(video.currentTime);
  console.log("this is current Time of video:", video.currentTime);
  // const snapshoter = new VideoSnapshot(new Blob(recordedChunks, {
  //     type: "video/webm"
  //   }))

  // const previewSrc = snapshoter.takeSnapshot(video.currentTime);
  // console.log("this is previewSrc:",previewSrc);
  numberOfImagesElement = document.querySelector("#numberOfImages");
  numberOfImagesElement.textContent = ++numOfImages;
};
const recorderOnDataAvailable = event => {
  // if (event.data && event.data.size > 0) {
  console.log("this is event:", event);
  console.log("this is recorder Data:", event.data);
  recordedChunks.push(event.data);
  numRecordedChunks += event.data.byteLength;
  // }
};

const stopRecording = async () => {
  console.log("Stopping record and starting download");
  video.pause();
  enableButtons();
  recorder.stop();
  download();
  let blob = new Blob(recordedChunks, {
    type: "video/webm"
  });
  console.log("this is blob", blob, recordedChunks);

  console.log("this is data you want:", patientAge, procedureDate);
  ipcRenderer.send("sendAllCanvases", listOfAllCanvases);
};

const test = video => {
  video.controls = false;
  video.muted = false;
  let blob = new Blob(recordedChunks, {
    type: "video/webm"
  });
  video.src = window.URL.createObjectURL(blob);
};

// MediaRecorder.onstop = e => {
//   console.log("data available after MediaRecorder.stop() called.");
//   download();
// };

const download = () => {
  recorder.onstop = function () {
    filePath = path.join(rootFile, patientNationalCode);
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    })
    // const snapshoter = new VideoSnapshot(blob);
    // const previewSrc =  snapshoter.takeSnapshot();
    // console.log("this is const previewSrc = await snapshoter.takeSnapshot();:",previewSrc);


    // previewSrc.then((result)=>{
    //   const base64Data = result.replace(/^data:image\/jpeg;base64,/, "");
    //     fs.writeFile(
    //       path.join(filePath, "test").concat(".jpeg"),
    //       base64Data,
    //       "base64",
    //       function (err) {
    //         if (err) throw err;
    //         else {
    //           console.log("success test save");
    //           pickSound.play();
    //         }
    //       }
    //     );
    // })



    toArrayBuffer(blob, function (
      ab
    ) {
      console.log(ab);
      var buffer = toBuffer(ab);
      var file = "Video" + `.webm`;
      console.log("it is the path:", filePath + file);
      writeFilePromise = fs.writeFile(filePath + "/" + file, buffer, function (err) {
        if (err) {
          console.error("Failed to save video " + err);
          reject("Problem in Saving the video file.")
        } else {
          console.log("Saved video: " + file);
          ipcRenderer.send("openFileImageSelection", {
            patientNationalCode: patientNationalCode,
            patientFirstName: patientFirstName,
            patientLastName: patientLastName,
            patientAge: patientAge,
            procedureDate: procedureDate,
            procedurePractitioner: procedurePractitioner,
            patientGender: patientGender,
            rootFile: rootFile
          })
        }
      })
    });

  };
};

function toArrayBuffer(blob, cb) {
  let fileReader = new FileReader();
  fileReader.readAsArrayBuffer(blob);
  fileReader.onload = function () {
    console.log("this is this", this);
    console.log("this is this.result:", this.result);
    let arrayBuffer = this.result;
    cb(arrayBuffer);
  };

}

function toBuffer(ab) {
  let buffer = Buffer.alloc(ab.byteLength);
  let arr = new Uint8Array(ab);
  for (let i = 0; i < arr.byteLength; i++) {
    buffer[i] = arr[i];
  }
  return buffer;
}
const readInputData = () => {
  patientNationalCode = document.getElementById("pNationalCode").value;
  patientFirstName = document.getElementById("pFirstName").value;
  patientLastName = document.getElementById("pLastName").value;
  patientAge = document.getElementById("pAge").value;
  procedureDate = document.getElementById("pDate").value;
  procedurePractitioner = document.getElementById("pPractitioner").value
  patientGender = document.querySelector('input[name="gender"]:checked').value;
}
const handleMediaStream = stream => {
  video.srcObject = stream;

  // video.play(video);
  var videoTracks = stream.getVideoTracks();
  console.log("Using video device: " + videoTracks[0].label);
  console.log("Video dimenssions: ", videoTracks[0].getSettings().width, videoTracks[0].getSettings().height, videoTracks[0].getSettings().frameRate);

  readInputData();
  console.log("this is patient gender", patientGender);

  rootFile = rootFile;
  filePath = path.join(rootFile, remote.patientNationalCode);
  console.log("this is filePath", filePath)
  fs.mkdir(
    filePath, {
    recursive: true
  },
    err => {
      if (err) throw err;
    }
  );

  const kbps = 1024;
  const Mbps = kbps * kbps;

  const options = {
    mimeType: 'video/webm; codecs="avc1.64001E"'
  };
  recorder = new MediaRecorder(stream, options);
  recorder.ondataavailable = recorderOnDataAvailable;
  video.play();

  recorder.start();
  disableButtons();
};

function drawTheImage() {
  try {
    var canvas = document.createElement("canvas");
    canvas.height = 1080;
    canvas.width = 1920;


    var context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log("this is it:", path.normalize(path.join(remote.app.getPath("userData"), "camera-shutter-click-03.wav")));
    let pickSound = new Audio(path.normalize(path.join(remote.app.getPath("userData"), "camera-shutter-click-03.wav")));
    // Get the DataUrl from the Canvas
    const url = canvas.toDataURL("image/jpeg", 1);
    listOfAllCanvases.push(url);
    // remove Base64 stuff from the Image
    const base64Data = url.replace(/^data:image\/jpeg;base64,/, "");
    let imageAddress = path.join(filePath, canvasId.toString()).concat(".jpeg");
    console.log("imageAddress", imageAddress);
    fsp.writeFile(imageAddress,
      base64Data,
      "base64",
      function (err) {
        if (err) throw err;
        else {
          console.log("Write of", filePath, "was successful");
        }
      }
    ).then(
      (result) => {
        pickSound.play();
        $(".recording-area").append('<span class="canvas-area" id="canvas-area"><img width="384" heigth="216" src=' + imageAddress + ' /></span>');
        setTimeout(function () {
          if ($('#canvas-area').length > 0) {
            $('#canvas-area').remove();
          }
        }, 5000)
      }
    )

    ++canvasId;
  } catch (e) {
    console.assert(false, "Exception while Drawing the image " + e);
    return;
  }

  console.log("Recorder is started.");
  disableButtons();
}

const getUserMediaError = err => {
  console.log("getUserMedia() failed.", err);
};