const ROOT_FOLDER = "1g2hpZZ-aM4a6Lv930ozxRh_b7q2lTfolD5DemlGlrsC9GvXxYWsWDAtTA6OPsit2VBO17Ehb";
const SPREADSHEET_ID = "1i6Kwbc1peAAV_hd_Q4CGhg3by1yeBSCQbtGtphjqSMI";

/* =========================
ENTRY
========================= */

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status:true,
      message:"API OK"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doPost(e){

try{

const action = e.parameter.action;

if(action !== "upload"){
return json({status:false,message:"Invalid action"});
}

const no = String(e.parameter.no || "").trim();
const nama = String(e.parameter.nama || "").trim();
const hp = String(e.parameter.hp || "").trim();
const jenis = String(e.parameter.jenis || "").trim();

if(!no || !nama){
return json({status:false,message:"Data tidak lengkap"});
}

const blob = e.parameter.file
  ? e.parameter.file
  : e.parameters && e.parameters.file
  ? e.parameters.file[0]
  : null;

if(!blob){
return json({status:false,message:"File tidak ditemukan"});
}

return uploadDokumen({
no:no,
nama:nama,
hp:hp,
jenis:jenis,
blob:blob
});

}catch(err){

return json({status:false,message:String(err)});

}

}

/* =========================
UPLOAD DOKUMEN
========================= */

function uploadDokumen(p){

const lock = LockService.getScriptLock();
lock.waitLock(20000);

try{

const root = DriveApp.getFolderById(ROOT_FOLDER);
const folder = getOrCreateFolder(root,p.no+"_"+p.nama);

const type = p.blob.getContentType() || "";
const ext = type.includes("pdf") ? ".pdf" : ".jpg";

const filename =
p.no+"_"+p.nama+"_"+p.hp+"_"+p.jenis.toUpperCase()+"_"+Date.now()+ext;

const blob = p.blob.setName(filename);

const file = folder.createFile(blob);

logUpload({
no:p.no,
nama:p.nama,
hp:p.hp,
jenis:p.jenis,
filename:file.getName()
});

return json({status:true});

} finally {
lock.releaseLock();
}

}

/* =========================
FOLDER
========================= */

function getOrCreateFolder(root,name){

const it = root.getFoldersByName(name);

if(it.hasNext()){
return it.next();
}

return root.createFolder(name);

}

/* =========================
JSON
========================= */

function json(o){

return ContentService
.createTextOutput(JSON.stringify(o))
.setMimeType(ContentService.MimeType.JSON)
.setHeader("Access-Control-Allow-Origin","*")
.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS")
.setHeader("Access-Control-Allow-Headers","Content-Type");

}

function logUpload(data){

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sheet = ss.getSheetByName("upload") || ss.getSheets()[0];

sheet.appendRow([
new Date(),
data.no,
data.nama,
data.hp,
data.jenis,
data.filename
]);

}
