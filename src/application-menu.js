// const {
//   app,
//   BrowserWindow,
//   Menu,
//   shellMohammad Reza Haghighat
// } = require("electron");
// const mainProcess = require("./main");

// const template = [      
//   {
//     label: "تنظیمات",
//     submenu: [
//       {
//         label: "فایل محل ذخیره سازی ",
//         accelerator: "CommandOrControl+Z",
//         role: "fileMenu"
//       },
//       { type: "separator" },
//       {
//         label: "Cut",
//         accelerator: "CommandOrControl+X",
//         role: "cut"
//       }
//     ]
//   },
//   {
//     label: "Window",
//     submenu: [
//       {
//         label: "Minimize",
//         accelerator: "CommandOrControl+M",
//         role: "minimize"
//       },
//       {}
//     ]
//   }
// ];

// if (process.platform === "darwin") {
//   const name = "Fire Sale";
//   template.unshift({
//     label: name
//   });
// }

// module.exports = Menu.buildFromTemplate(template);