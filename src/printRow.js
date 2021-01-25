const { remote } = require("electron");
const jsPDF = require("jsPDF");
const _ = require("lodash");
const PDFWindow = require("electron-pdf-window");
var fs = require("fs");
const base64amiri = require("./amiri-font-base64encoding");
const {
  listOfSelectedImages,
  patientFirstName,
  patientLastName,
  patientAge,
  procedureDate,
  patientNationalCode,
  filePath
} = require("./app");
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
  console.log("this is po'``inter:", pointer);
  return pointer;
}
// PDF Report Organization
const generateReport = () => {
  console.log("we are generating report.");
  var doc = new jsPDF({ filters: ["ASCIIHexEncode"] });
  const AmiriRegular = base64amiri.base64;
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
  let allRows = _.chunk(Array.from(listOfSelectedImages.keys()), 4);
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
    ":نام بیمار  " + patientFirstName + " " + patientLastName,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 12,
    20
  );
  doc.text(
    ":سن  " + patientAge,
    4 * (settings.x + settings.xDim) - "نام بیمار:  ".length - 40,
    20
  );
  doc.text(
    ":تاریخ   " + procedureDate,
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
  }
  // Save pdf file on the file system
  var blobPDF = doc.output();
  fs.writeFile(
    filePath + "/" + patientNationalCode + ".pdf",
    blobPDF,
    null,
    "",
    "w+",
    err => {
      if (err) throw err;
      console.log("The file has been saved!");
    },
    "w+"
  );
  // remote.shell.openExternal(filePath + "/" + patientNationalCode + ".pdf");
  const win = new remote.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { plugins: true }
  });
  PDFWindow.addSupport(win);
  win.loadURL(filePath + "/" + patientNationalCode + ".pdf");
};
exports.generateReport = generateReport;
