const {
  ipcRenderer,
  remote,
  shell,
  dialog
} = require("electron");
const {
  Menu,
  MenuItem
} = remote;

const PDFWindow = require("electron-pdf-window");
const jsPDF = require("jspdf");
const _ = require("lodash");
const base64amiri = require("./amiri-font-base64encoding");
// const $ = require("jquery");
const electronLocalshortcut = require("electron-localshortcut");
const BrowserWindow = require("electron").BrowserWindow;
const path = require('path');

var listOfSelectedImages = new Map();

var fs = require("fs");
const fse = require("fs-extra");
const {
  iteratee
} = require("lodash");
const fsp = require('fs').promises;
var patientData = ipcRenderer.sendSync("getPatientId");
let patientId;
var listOfAllImages;
var listOfSelectedImages;
// const statics = require('./statics.js');

console.log(filePath);
var listOfAllCanvases = ipcRenderer.sendSync("getAllCanvases");
console.log("this is list of all canvases:", listOfAllCanvases);

var filePath = path.join(patientData.rootFile, patientData.patientNationalCode);
console.log(filePath);

function readFiles() {
  patientId = patientData.patientId;
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(rootFile, patientId), function (err, filenames) {
      if (err) {
        console.error(err);
        reject("error");
      }

      filenames.forEach(function (filename) {
        //   fs.readFile(rootFile + "/" + dirname + filename, "utf-8", function(
        //     err,
        //     content
        //   ) {
        //     if (err) {
        //       onError(err);
        //       return;
        //     }

        //   });
      });
      listOfAllImages = filenames;
      console.log("listOfAllImages", listOfAllImages);
      resolve(listOfAllImages);
    });
  });
}

console.log("this is patient data", ipcRenderer.sendSync("getPatientId"));

const changeContentOfSelect = function () {
  listOfSelectedImages.get(this.id)[1] = this.value;
  console.log(listOfSelectedImages.get(this.id));
};

const changeContentOfPatologies = function () {
  listOfSelectedImages.get(this.id)[2] = this.value;
  console.log(listOfSelectedImages.get(this.id));
};
// readFiles(patientId);
let canvasId = 0;
const makeCatalogue = () => {
  listOfAllCanvases.forEach(function (canvasLi) {
    console.log("canvasli is :", canvasLi);
    let canvas = document.createElement("canvas");
    canvas.setAttribute("class", "card-img-top")
    canvas.height = 1080;
    canvas.width = 1920;
    var context = canvas.getContext("2d");
    var image = new Image();
    image.onload = function () {
      context.drawImage(image, 0, 0);
    };
    image.src = canvasLi;

    // let template = `
    // <li>
    //   ${canvas.outerHTML}
    //   <input type="checkbox" id="${canvasId}"/>
    //   <label for="checkbox${canvasId}">
    //   <select id = "${canvasId}" class = "form-control invisible" >
    //     ${getRegions().map(region =>{ "<option value="+region+" >"+region+"</option>" }).join('')}
    //   </select>
    //   <select id = "${canvasId}" class = "form-control invisible" >
    //    "${getPatologies().map(patology =>{ " <option value = "+patology+" > "+patology+" < /option>" }).join('')}
    //   </select>
    // </li>
    // `
    // console.log("this is what you make:", template);
    let li = document.createElement("li");

    let card = document.createElement("div");
    card.setAttribute("class", "card mx-1 my-1");
    card.setAttribute("id", "card".concat(canvasId));

    let cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body");
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "checkbox" + canvasId);

    let label = document.createElement("label");
    label.setAttribute("for", "checkbox" + canvasId);
    // label.setAttribute("class", "ch");
    // label.appendChild(canvas);
    // li.appendChild(checkbox);
    // li.appendChild(label);
    card.appendChild(canvas);


    card.appendChild(label);
    // card.appendChild(checkbox)

    let region = document.createElement("select");
    region.setAttribute("id", canvasId);
    region.setAttribute("class", "form-control invisible");
    region.setAttribute("place-holder", "ناحیه");
    $(region).change(changeContentOfSelect);


    for (i = 0; i < regions.length; i++) {
      let option = document.createElement("option");
      option.setAttribute("value", regions[i]);
      option.text = regions[i];
      region.appendChild(option);
    }

    let patology = document.createElement("select");
    patology.setAttribute("id", canvasId);
    patology.setAttribute("class", "form-control invisible");
    patology.setAttribute("place-holder", "عارضه");
    $(patology).change(changeContentOfPatologies);
    for (i = 0; i < patologies.length; i++) {
      let option = document.createElement("option");
      option.setAttribute("value", patologies[i]);
      option.text = patologies[i];
      patology.appendChild(option);
    }
    canvas.id = canvasId++;
    // li.appendChild(region);
    // li.appendChild(patology);
    cardBody.appendChild(region);
    cardBody.appendChild(patology);
    card.appendChild(cardBody)
    li.appendChild(card)
    document.querySelector("#snapshot").appendChild(li);
    console.log("this is what you made:", document.querySelector("#snapshot").innerHTML);
    // document.querySelector("#snapshot").innerHTML = template;
  });
  // File Base Catalogue
  // readFiles().then(() => {
  //   var listOfCards = [];
  //   var image;
  //   console.log("hooora", listOfAllImages);
  //   listOfAllImages.forEach(function(filename) {
  //     let src = rootFile + "/" + patientId + "/" + filename;
  //     //   fs.readFile(rootFile + "/" + dirname + filename, "utf-8", function(
  //     //     err,
  //     //     content
  //     //   ) {
  //     //     if (err) {
  //     //       onError(err);
  //     //       return;
  //     //     }

  //     //   });
  //     image =
  //       image +
  //       '<div class="card" style="width: 18rem;">' +
  //       '<img class="card-img-top" src="' +
  //       src +
  //       '" id="' +
  //       filename +
  //       '" alt="Card image cap"/>' +
  //       '<div class="card-body">' +
  //       '<p class="card-text">Some quick example text to build on the card title and make up the bulk of the cards content.</p>' +
  //       "</div>" +
  //       "</div>";
  //   });
  //   var template = document.createElement("template");
  //   template.innerHTML = image.trim();

  //   console.log("$", template.content.getRootNode());
  //   document.querySelector("#allImages").innerHTML =
  //     template.content.firstChild;
  // });
};

makeCatalogue();
//#region make report
function printRow(doc, row, settings) {
  pointer = settings.x;
  console.log("listOfSelectedImages", listOfSelectedImages);
  for (let imageId of row) {
    let image = listOfSelectedImages.get(imageId)[0];
    console.log("this is image:", image);
    doc.addImage(
      image.toDataURL("image/jpg,1.0"),
      "png",
      pointer,
      settings.y,
      settings.xDim,
      settings.yDim
    );
    // listOfSelectedImages.get("canvasId")[0];
    let text = listOfSelectedImages.get(imageId)[1];
    if (
      listOfSelectedImages.get(imageId)[1] != undefined &&
      listOfSelectedImages.get(imageId)[1] != null &&
      listOfSelectedImages.get(imageId)[1] != ""
    ) {
      doc.text(
        text,
        pointer + settings.yDim / 2 - text.length,
        settings.y + settings.yDim + 3
      );
    }

    let text2;
    if (
      listOfSelectedImages.get(imageId)[2] != undefined &&
      listOfSelectedImages.get(imageId)[2] != null &&
      listOfSelectedImages.get(imageId)[2] != ""
    ) {
      text2 = listOfSelectedImages.get(imageId)[2];
      doc.text(
        text2,
        pointer + settings.yDim / 2 - text2.length,
        settings.y + settings.yDim + 6
      );
    }

    pointer = pointer + settings.xDim + settings.rowSpace;
  }

  return pointer;
}
// PDF Report Organization

const generateReport = () => {
  var doc = new jsPDF({
    filters: ["ASCIIHexEncode"]
  });
  const reportTitle = $("#reportTitle")[0].value;
  console.log("this is reportT", reportTitle);
  const AmiriRegular = base64amiri.base64;
  doc.addFileToVFS("Amiri-Regular.ttf", AmiriRegular);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri"); // set font
  doc.setFontSize(20);
  doc.setTextColor(255, 0, 0);
  doc.text(reportTitle, 80, 10);
  doc.setLineWidth(0.5);
  doc.line(5, 24, 205, 25);
  doc.setTextColor(100);
  doc.setFontSize(10);
  const selectImagesKeyList = Array.from(listOfSelectedImages.keys());
  let allRows = _.chunk(selectImagesKeyList, 2);
  const settings = {
    x: 5,
    y: 30,
    xDim: 90,
    yDim: 64,
    rowSpace: 2,
    columnSpace: 10,
    newPageY: 55
  };
  doc.setTextColor(0, 0, 0);
  doc.text(
    "نام بیمار  ",
    190,
    20
  );
  doc.text(
    patientData.patientFirstName +
    " " +
    patientData.patientLastName,
    150,
    20
  );
  doc.text(
    "سن  " + patientData.patientAge,
    80,
    20
  );
  doc.text(
    "تاریخ   " + patientData.procedureDate,
    100,
    20
  );
  doc.setTextColor(100);
  // doc.cell(
  //   4 * (5 + 45) - "نام بیمار:  ".length - 180,
  //   10,
  //   50,
  //   10,
  //   " ",
  //   5,
  //   "center"
  // );
  doc.rect(4 * (5 + 45) - "نام بیمار:  ".length - 180, 10, 50, 10)
  doc.setTextColor(0, 0, 0);
  doc.text(
    "شماره پرونده:  " + patientData.patientNationalCode,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 175,
    15
  );

  var xPoint = settings.x;
  var yPoint = settings.y;
  var xDim = settings.xDim;
  var yDim = settings.yDim;
  var reportPage = 1;

  for (row of allRows) {
    if (settings.y + settings.yDim + settings.columnSpace <= 297) {
      printRow(doc, row, settings);
      settings.y = settings.y + settings.yDim + settings.columnSpace;
    } else {
      doc.addPage();
      ++reportPage;
      settings.x = 5;
      settings.y = 10;
      printRow(doc, row, settings);
    }
    yPoint += yDim;
  }

  doc.setTextColor(255, 0, 0);
  doc.setFontSize(16);
  settings.y = settings.y + 5;
  doc.text("Findings:", 0 + settings.x, settings.y);
  settings.y = settings.y + 5;
  for (item of dignosis) {
    let valueOfDiognosis = document.getElementById(item.id).value;
    doc.setFontSize(14);
    doc.setTextColor(45, 114, 178);
    lenght = doc.text(item.label + " ", 0 + settings.x, settings.y).length;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(
      valueOfDiognosis,
      settings.x + 7 + doc.getTextWidth(item.label),
      settings.y
    );
    settings.y = settings.y + 5;
    if (nextPage(settings.y + 5)) {
      doc.addPage();
      settings.y = 10;
    }
  }

  // Save pdf file on the file system
  var blobPDF = doc.output();

  fsp.writeFile(
    path.join(filePath, patientData.patientNationalCode).concat(".pdf"),
    blobPDF
  ).then(
    (result) => {
      console.log("the report file is saved successfully.");
    }
  )
  // remote.shell.openExternal(filePath + "/" + patientNationalCode + ".pdf");
  const win = new remote.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      plugins: true
    }
  });
  PDFWindow.addSupport(win);
  console.log(
    "openning",

  );
  win.loadURL(path.join(filePath, patientData.patientNationalCode).concat(".pdf"));
};

const nextPage = length => {
  if (length < 297 - 10) {
    return false;
  } else {
    return true;
  }
};
//#endregion

const generateHtmlReport = function(){
  // listOfSelectedImages
  console.log("this is document.querySelector(#comment).value",document.querySelector("#comment").value)
  copyRelatedFiles();
  let report = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta
          content="text/html; charset=utf-8"
          http-equiv="Content-Type"
        />
        <title>${patientData.patientFirstName+" "+patientData.patientLastName+" "}</title>
        <link href="meta/report_style.css" rel="stylesheet" type="text/css" />
      </head>
      <body>
      <div id="layout_wrapper">
        ${renderHeader()}
      <div>
      <div id="column_wrapper">
        ${renderPatientInfo(patientData.patientFirstName,patientData.patientLastName,patientData.patientAge,patientData.patientNationalCode,patientData.patientGender)}
        ${renderProcedureInfo("Dr.Keshvari",patientData.procedureDate)}
      </div>
      ${document.querySelector("#comment").value != '' ? 
        `<div id="fullbox">
          ${renderComment()}
        </div>` : ''}
      
      <div id="fullbox">
        ${renderImages()}
      </div>
      <div id="fullbox">
        ${renderFindings()}
      </div>

      ${document.querySelector("#recommendation").value != '' ? 
         `<div id="fullbox">
            ${renderRecommendation()}
          </div>` : ''}
     
      <div id="footer">
      </div>
      </body>
    </html>
    `

  fsp.writeFile(
    path.join(filePath, patientData.patientNationalCode).concat(".html"),
    report
  ).then(
    (result) => {
      console.log("the report file is saved successfully.");
    }
  )
}
const renderHeader = function(){
  const reportTitle = document.querySelector("#reportTitle").value;
  return `     
   <div id="header">
        <div id="ci">
          <div class="logo">
            <img
              width="250"
              height="250"
              alt="Karl Storz GmbH & Co. KG"
              src="meta/colon-and-rectum.png"
            />
          </div>
          <h1>${reportTitle}</h1>
        </div>
      </div>
      `
}
const renderPatientInfo = function(patientFirstName,patientLastName,age,patientId,gender){
  console.log("this is gender",gender);
  return `
        <div id="left_column">
          <div id="leftbox">
            <div class="halfarea">
              <div class="headline">
                <img alt="Patient" src="meta/icons/patient.gif" />
                <h2>Patient Data</h2>
              </div>
              <table>
                <col />
                <tr>
                  <td>Last Name</td>
                  <td>${patientLastName}</td>
                </tr>
                <tr>
                  <td>First Name</td>
                  <td>${patientFirstName}</td>
                </tr>
                <tr>
                  <td>Age</td>
                  <td>${age}</td>
                </tr>
                <tr>
                  <td>Patient ID</td>
                  <td>${patientId}</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>${gender}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
  `
}

const renderProcedureInfo = function(doctorName,dateOfProcedure){
  return `
         <div id="right_column">
          <div id="rightbox">
            <div class="halfarea">
              <div class="headline">
                <img alt="Procedure" src="meta/icons/procedure.gif" />
                <h2>Procedure</h2>
              </div>
              <table>
                <col/>
                <tr>
                  <td>Surgeon</td>
                  <td>${doctorName}</td>
                </tr>
                <tr>
                  <td>Procedure</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Case ID</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>${dateOfProcedure}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
  `
}

const renderComment = function(){
  return `
          <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/report.gif" />
            <h2>Comment</h2>
          </div>
          <p>
            ${document.querySelector("#comment").value}
          </p>
        </div>
  `
}

const renderImages = function(){
    const selectImagesKeyList = Array.from(listOfSelectedImages.keys());
  console.log("this is listOfSelectedImages",listOfSelectedImages)
  return `
          <div class="fullarea">
            <div class="headline">
              <img alt="Images" src="meta/icons/images.gif" />
              <h2>Images</h2>
            </div>
            ${selectImagesKeyList.map(index=>
              `
              <div id=${Boolean(index%2) ? 'left' : 'right'}>
                  <div class="thumbnail">
                    <a href="${index}.jpeg">
                      <img alt="${listOfSelectedImages.get(index)[1]}/${listOfSelectedImages.get(index)[2]}" src="${index}.jpeg" />
                      <p class="image-comment">${listOfSelectedImages.get(index)[1]!==undefined ? listOfSelectedImages.get(index)[1] : ""}${listOfSelectedImages.get(index)[2]!== undefined ? "/"+listOfSelectedImages.get(index)[2] : ""}</p>
                    </a>
                    </div>
                </div>
              `
            ).join("") }
          <div class="clearer"></div>
        </div>
  `
}

const renderFindings = function(){
    return `
          <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/icon_pci-compliance.png" />
            <h2>Findings</h2>
          </div>
          <span>
            RetroFlex View: ${document.querySelector("#retroFlex").value}
          </span></br>
          <span>
            Rectum: ${document.querySelector("#rectum").value}
          </span></br>
          <span>
            Rectusigmoid Junction: ${document.querySelector("#rectosigmoidJunction").value}
          </span></br>
          <span>
            Sigmoid: ${document.querySelector("#sigmoid").value}
          </span></br>
          <span>
            Descending Colon: ${document.querySelector("#descendingColon").value}
          </span></br>
          <span>
            Heptic Flexure: ${document.querySelector("#transverseColon").value}
          </span></br>
          <span>
            Ascending Colon: ${document.querySelector("#hepaticFlexure").value}
          </span></br>
          <span>
            Ascending Colon: ${document.querySelector("#ascendingColon").value}
          </span></br>
          <span>
            Cecum: ${document.querySelector("#cecum").value}
          </span></br>
          <span>
            Diagnosis: ${document.querySelector("#diagnosis").value}
          </span></br>
        </div>
      `
}

const renderRecommendation = function(){
  return `
        <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/icon_org_survey.png" />
            <h2>Recommendation</h2>
          </div>
               <span>
            ${document.querySelector("#recommendation").value}
            </span>
        </div>
  `
}

const copyRelatedFiles = function(){
  fse.copy(path.normalize("/Users/alikeshvari/Projects/electron-screen-recorder-master/src/assets/templates/meta"),path.join(filePath,"meta"));
}

document.addEventListener("DOMContentLoaded", () => {
  // document.querySelector("#allImages").addEventListener("click", function (e) {
  //   if (e.target.matches("img")) {
  //     // List item found!  Output the ID!
  //     if (!listOfSelectedImages.has(e.target.id)) {
  //       listOfSelectedImages.set(e.target.id, [e.target]);
  //       console.log(listOfSelectedImages);
  //     } else {
  //       listOfSelectedImages.delete(e.target.id);
  //     }
  //   }
  // });

  Object.defineProperty(listOfSelectedImages, "watch", {
    writable: false,
    value: function () {

    }
  })

  const resetProcess = () => {
    console.log("test")
    let file;
    let listOfAllFiles = [];
    console.log("listOfSelectedImages.entries()", listOfSelectedImages.entries())
    let list = []
    Array.from(listOfSelectedImages.entries(), canvas => {
      let filename = canvas[0];
      console.log("this is this :", filename)
      list.push(filename.concat(".png"));
    });
    console.log("helooooooo", list);
    fsp.readdir(filePath, {
      encoding: "utf8",
      withFileTypes: false
    }).then(
      (files) => {
        listOfAllFiles = files;

        console.log("list of all selected images:", listOfSelectedImages.keys())
        for (file of listOfAllFiles) {
          if (list.includes(file.toString()) || file.includes(".pdf") || file.includes(".webm")) {
            console.log("File remains:", file)
          } else {
            console.log("file  removed : ", file);
            console.log("asssssssssaaaassssss" + path.join(filePath, file))
            fsp.unlink(path.join(filePath, file));
          }
        }
        patientData.patientId
        ipcRenderer.send("processEnd", {
          "isReportPrinted": true
        })
      },
      (err) => {
        console.error("error happened while reading directory=>>>" + err);
      }
    )



  };

  const makeReport = () => {};

  document
    .querySelector("#make_report")
    .addEventListener("click", generateReport);

    document
    .querySelector("#html_report")
    .addEventListener("click", generateHtmlReport);

  document
    .querySelector("#stop_process")
    .addEventListener("click", resetProcess);

  document.querySelector("#snapshot").addEventListener("click", function (e) {
    if (e.target.matches("canvas")) {
      console.log("this is e.target", $(e.target).parent())

      // List item found!  Output the ID!
      if (!listOfSelectedImages.has(e.target.id)) {
        listOfSelectedImages.set(e.target.id, [e.target]);

        $(e.target).addClass("selected");
        $(e.target).parent().addClass("selected-card");
        $("select[id='" + e.target.id + "']").map(function (index, domElement) {
          console.log("it is domelement", domElement);
          console.log("index:", index);
          domElement.className = "form-control visible";
        })
      } else {
        listOfSelectedImages.delete(e.target.id);
        $(e.target).removeClass("selected");
        $(e.target).parent().removeClass("selected-card");
        console.log("e.target.querySelector()", $("select[id='" + e.target.id + "']"));
        // e.target.querySelector("select").forEach((select) => {
        //   select.value = undefined
        // })
        $("select[id='" + e.target.id + "']").map(function (index, domElement) {
          domElement.value = " "
          domElement.className = "form-control invisible";
        })
      }
    }
  });
});