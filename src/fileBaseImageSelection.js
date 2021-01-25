const alertifyjs = require('alertifyjs');
const toastr = require('toastr');
const printJs = require('print-js');
const { BrowserWindow,BrowserView } = require('electron')
const FileType = require('file-type');
 var PHE = require("print-html-element");
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

const path = require('path');

var listOfSelectedImages = new Map();
let findings = new Map();
findings.set("RetroFlex View","Was normal");
findings.set("Rectum","Was normal");
findings.set("Rectosigmoid Junction","Was normal");
findings.set("Sigmoid Colon","Was normal");
findings.set("Descending Colon","Was normal");
findings.set("Splentic Flexture","Was normal");
findings.set("Hepatic Flexure","Was normal");
findings.set("Ascending Colon","Was normal");
findings.set("Cecum","Was normal");

var fs = require("fs");
const fse = require("fs-extra");
const fsp = require('fs').promises;
const { isTypedArray } = require("lodash");
const { lookup } = require("dns");
const { isNullOrUndefined } = require('util');
const { on } = require('process');
const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');
var patientData = ipcRenderer.sendSync("getPatientId");
let patientId;
var listOfAllImages;


let regionsState =  {
    "rectum": [],
    "sigmoid": [],
    "descendingColon": [],
    "splenticFlexture": [],
    "hepaticFlexure": [],
    "ascendingColon": [],
    "cecum": []
}
 var filePath = path.join(patientData.rootFile, patientData.patientNationalCode);

  console.log("this is filepath inside the filebase image selection",filePath);

const readImages = function(pathOfDirectory){
    return fsp.readdir(pathOfDirectory,{withFileTypes:true}).then(
        (imagesNameArray)=>{
            
            listOfAllImages = imagesNameArray.filter((input)=>{
              console.log("list of all images names:",imagesNameArray);
            //  FileType.fromFile(path.join(pathOfDirectory,input.name)).then(
            //       (result)=>{
            //         console.log("this is it:",result);
                    
            //         // if( result.ext == "jpg" || result.ext == "jpeg" || result.ext == "png"){
            //         //   return input;
            //         // }
            //       }
            //   );
              if( input.name.search('.png') != -1 || input.name.search('.jpeg') != -1 || input.name.search('.jpg') != -1){
                      return input;
              }
                
            });
            return imagesNameArray;
        }
    )
}

const makeImageFilesCatalogue = function(filePath){
    let allImagesHtml=``;

    readImages(filePath).then(
        ()=>{
            listOfAllImages.map((image,index)=>{    
              console.log("${image.name}-thumbnail",image.name+"-thumbnail")           
                $("#allImages").append(
                    `       
                    
                            <div class="thumbnail" id="${image.name}-thumbnail">
                                
                                  <img class="image" src="${path.join(filePath,image.name)}" id="${image.name}" onclick="selectImage(this)"/>
                                  <span class="region-area"></span>
                                  <span class="pathology-area"></span>
                                  
                            </div>    
                            
                    `
                )   
            })
            console.log("this is :",$("#allImages"));
        }
   )
}

$(findingsInput).on("focusout",()=>{
    console.log("FFFFFFF",$("#findingsInput").value);
    findings.set(currentRegion,$("#findingsInput").val())

})
var recommendation = undefined;
$("#recommendation").on("focusout",()=>{
    console.log("FFFFFFF",$("#recommendation").value);
    recommendation = $("#recommendation").val();
})
var diagnosis = undefined;
$("#diagnosis").on("focusout",()=>{
    console.log("FFFFFFF",$("#diagnosis").value);
    diagnosis = $("#diagnosis").val();

})

$("#comment").on("focusout",()=>{
    console.log("FFFFFFF",$("#comment").value);
    comment = $("#comment").val();

})

// makeImageFilesCatalogue("/Users/alikeshvari/Documents/test-file/dsfd");
makeImageFilesCatalogue(filePath);
var currentRegion=undefined;
var prevLi= undefined;
function setCurrentRegion(regionName,regionLi){
   if($(regionLi).attr("id") == $(prevLi).attr("id")){
    currentRegion = undefined;
     $(prevLi).removeClass("selected-region");
     prevLi = undefined
     return
  }
  if(currentRegion!= undefined){
    $(prevLi).removeClass("selected-region");
  }
  console.log("this is regionLi and prevLi:",$(regionLi).attr("id"),$(prevLi).attr("id"));
 
  prevLi = regionLi;
  currentRegion = regionName;
  $(regionLi).addClass("selected-region");
  console.log("this is current region:",regionName);
  $("#selectedRegion").html(currentRegion);
  $("#findingsInput").val(findings.get(currentRegion));
  
  
}

function getRegionStateList(regionName){
  if(regionName == "rectum"){
    return regionsState.rectum;
  }else if(regionName == "sigmoid"){
    return regionsState.sigmoid;
  }else if(regionName == "descendingColon"){
    return regionsState.descendingColon;
  }else if(regionName == "splenticFlexture"){
    return regionsState.splenticFlexture;
  }else if(regionName == "hepaticFlexure"){
    return regionsState.hepaticFlexure;
  }else if(regionName == "ascendingColon"){
    return regionsState.ascendingColon;
  }else if(regionName == "cecum"){
    return regionsState.cecum;
  }
}

function assignPathology(pathologyCheckBox){
  console.log("pathologyCheckBox",pathologyCheckBox)
 
  const imageId = $(pathologyCheckBox).attr("imageid");
   console.log("imageId",imageId)
  const contentArea = $("img[id='" + imageId + "']").parent().children(".pathology-area")[0];
  console.log("contentArea",contentArea,imageId)
  // const imageId = $($.grep($("#allImages").children(),function(item){if(item.id == imageParent)return item;})[0]).children("img").attr("id");
  console.log("aaa:",imageId);
  // const imageListOfPatologies = listOfSelectedImages.get(imageId)[2];
 

  
  if(listOfSelectedImages.get(imageId)[2].includes(pathologyCheckBox.id)){
     //checkbox is checked before
    const imageListOfPatologies = listOfSelectedImages.get(imageId)[2]
    imageListOfPatologies.splice(imageListOfPatologies.indexOf(pathologyCheckBox.id),1)
    $(contentArea).children("#"+pathologyCheckBox.id).remove()
  }else{
    if(listOfSelectedImages.get(imageId)[2].length < 2){
      listOfSelectedImages.get(imageId)[2].push(pathologyCheckBox.id);
      $(pathologyCheckBox).attr("checked")
      $(contentArea).append(`<span id=${pathologyCheckBox.id} class="badge badge-info">
      ${pathologyCheckBox.id}
      </span>`)
    }
  }
    console.log("listOfSelectedImages",listOfSelectedImages);
}


function removeRegion(regionIcon){
  console.log("this is imageid:",regionIcon);
  listOfSelectedImages.get($(regionIcon).attr("imageid"))[1] = undefined;
  console.log("this is listOfSelectedImages",listOfSelectedImages);
  $(regionIcon).parent().remove();

}

const patologies = [
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

const deletePathologyMenu = function(image){
   const imageParent = $(image).parent();
   imageParent.children(".middle").remove()
}

const addPathologyMenu = function(image){
  const imageParent = $(image).parent();
  const imageId = $(image).attr("id")
  console.log("this is .......:", imageParent);
  listOfSelectedImages.get(imageId)[2] = [];
  let boxes = patologies.map(
    (patology)=>{
      
        return  `
                              <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" imageId=${imageId} id=${patology.toString()} onclick="assignPathology(this)" >
                                    <label class="form-check-label"  for=${patology.toString()}>${patology.toString()}</label>'
                              </div>
          `
    }
  )

  $(imageParent).append(
    "<div class='middle'>"+
    boxes.join("")+
    "</div>"
  )
}

function selectImage(image){
  console.log("this is image:",image);
  console.log("this is parent:",$(image).parent());
  if(currentRegion!= undefined){
    if(listOfSelectedImages.has(image.id)){
      //just assign region to image that selected before
      assignRegionToImage(image);    
      $(image).parent().addClass("thumbnail-selected");
     
    }else{
      // select image and assign region together
      listOfSelectedImages.set(image.id,[image,currentRegion,[]]);
      $(image).parent().addClass("thumbnail-selected");
      assignRegionToImage(image);   
  
    }
  }else{
      if(listOfSelectedImages.has(image.id)){
        //image selected before so delete it
        listOfSelectedImages.delete(image.id)
        $(image).parent().removeClass("thumbnail-selected");
        deletePathologyMenu(image);
      }else{
        // select image
        listOfSelectedImages.set(image.id,[image,,[]]);
        $(image).parent().addClass("thumbnail-selected");
        addPathologyMenu(image);
      }
  }
  
  
  
  console.log("listOfSelectedImages",listOfSelectedImages);

}

function assignRegionToImage(image){
  const imageParent = $(image).parent();




  if(currentRegion != undefined && currentRegion != "" && listOfSelectedImages.has(image.id)){
      $(imageParent ).children(".region-area").append(`
                                  <span class="badge badge-success test">
                                    <button type="button" imageId=${image.id} class="close" aria-label="Close" onclick="removeRegion(this)">
                                      <span aria-hidden="true">&times;</span> ${currentRegion}
                                    </button>
                                  </span>
                                `)
      listOfSelectedImages.get(image.id)[1] = currentRegion;
  }

    console.log("listOfSelectedImages",listOfSelectedImages);
}

function readFiles(path) {
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


// readFiles(patientId);
let canvasId = 0;

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
     ${document.querySelector("#diagnosis").value != '' ? 
         `<div id="fullbox">
            ${renderDiagnosis()}
          </div>` : ''}
      
          <div id="footer" class="sticky no-print">
            <button class="button1 no-print" type="button" onclick="window.print()">
              <img alt="print" src="meta/icons/print.png" />
              Print
            </button>
          </div>
      </body>
    </html>
    `
  console.log("this is filePath:",filePath,patientData);
  let placeToSave = undefined;
  if(patientData.fromUsb){
    placeToSave = path.join(filePath,path.basename(patientData.rootFile))+".html";
  }else{
    placeToSave = path.join(filePath, patientData.patientNationalCode).concat(".html");
  }
  console.log("placeToSave",placeToSave,patientData.patientNationalCode);
  fsp.writeFile(
    placeToSave,
    report
  ).then(
    (result) => {
      console.log("the report file is saved successfully.");
 

   
    console.log("this is what shoud be opened:","file://" + placeToSave)
    shell.openExternal("file://" + placeToSave)
    // reportPreview.loadURL("'http://github.com'");  
    // const view = new remote.BrowserView()
    // reportPreview.setBrowserView(view)
    // view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
    // view.webContents.loadURL('https://electronjs.org')
    // reportPreview.previewFile(placeToSave)
   
    // reportPreview.loadURL("file://" + placeToSave);
    }
  )
}
const renderHeader = function(){
  const reportTitle = "Colonoscopy Report"
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
                  <td>Practitioner</td>
                  <td>${doctorName}</td>
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
            ${comment}
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
            <a href="${path.join(filePath,index)}">
            <img alt="${listOfSelectedImages.get(index)[1]}/${listOfSelectedImages.get(index)[2]}" src=${path.join(filePath,index)} />
            <p class="image-comment">${listOfSelectedImages.get(index)[1]!==undefined ? listOfSelectedImages.get(index)[1] : ""}${listOfSelectedImages.get(index)[2]!== undefined && listOfSelectedImages.get(index)[1]!==undefined ? "/"+listOfSelectedImages.get(index)[2] : listOfSelectedImages.get(index)[2]!== undefined ? listOfSelectedImages.get(index)[2] :"" }</p></a>
                  </div>
              </div>
            `
          
          ).join("") }
          <div class="clearer"></div>
        </div>
  `
}
findings.set("RetroFlex View","Was normal");
findings.set("Rectum","Was normal");
findings.set("Rectosigmoid Junction","Was normal");
findings.set("Sigmoid Colon","Was normal");
findings.set("Descending Colon","Was normal");
findings.set("Splentic Flexture","Was normal");
findings.set("Hepatic Flexure","Was normal");
findings.set("Ascending Colon","Was normal");
findings.set("Cecum","Was normal");
const renderFindings = function(){
    console.log("this is findings:",findings);
    return `
          <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/icon_pci-compliance.png" />
            <h2>Findings</h2>
          </div>
          <span>
            RetroFlex View: ${findings.get("RetroFlex View")} 
          </span></br>
          <span>
            Rectum: ${findings.get("Rectum")}
          </span></br>
          <span>
            Rectusigmoid Junction: ${findings.get("Rectosigmoid Junction")}
          </span></br>
          <span>
            Sigmoid: ${findings.get("Sigmoid Colon")}}
          </span></br>
          <span>
            Descending Colon: ${findings.get("Descending Colon")}
          </span></br>
          <span>
            Heptic Flexure: ${findings.get("Splentic Flexture")}
          </span></br>
          <span>
            Ascending Colon: ${findings.get("Hepatic Flexure")}
          </span></br>
          <span>
            Ascending Colon: ${findings.get("Ascending Colon")}
          </span></br>
          <span>
            Cecum: ${findings.get("Cecum")}
          </span></br>
        </div>
      `
}

const renderRecommendation = function(){
  console.log("this is recommendation:",recommendation)
  return `
        <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/icon_org_survey.png" />
            <h2>Recommendation</h2>
          </div>
               <span>
            ${recommendation}
            </span>
        </div>
  `
}

const renderDiagnosis = function(){
  console.log("this is recommendation:",recommendation)
  return `
        <div class="fullarea">
          <div class="headline">
            <img alt="Report" src="meta/icons/images.png" />
            <h2>Diagnisis</h2>
          </div>
               <span>
            ${diagnosis}
            </span>
        </div>
  `
}

const copyRelatedFiles = function(){
  fse.copy(path.join(remote.app.getPath("userData"),"meta"),path.join(filePath,"meta"));
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