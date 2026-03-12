const ROOT_FOLDER = "1g2hpZZ-aM4a6Lv930ozxRh_b7q2lTfolD5DemlGlrsC9GvXxYWsWDAtTA6OPsit2VBO17Ehb";

/* =========================
ENTRY
========================= */

function doPost(e){

try{

const p = e.parameter || {};

if(p.action === "upload"){
return uploadDokumen(p);
}

return json({status:false,message:"Unknown action"});

}catch(err){

return json({status:false,message:String(err)});

}

}

/* =========================
UPLOAD DOKUMEN
========================= */

function uploadDokumen(p){

const no   = String(p.no || "").trim();
const nama = String(p.nama || "").trim();
const hp   = String(p.hp || "").trim();

if(!no || !nama){
return json({status:false,message:"Data tidak lengkap"});
}

const root = DriveApp.getFolderById(ROOT_FOLDER);

const folder = getOrCreateFolder(root,no+"_"+nama);

Object.keys(p).forEach(k=>{

if(!k.startsWith("file_")) return;

const jenis = k.replace("file_","");
const base64 = p[k];

if(!base64) return;

const mime = p["type_"+jenis] || "image/jpeg";

const ext = mime.includes("pdf") ? ".pdf" : ".jpg";

const filename =
no+"_"+nama+"_"+hp+"_"+jenis.toUpperCase()+ext;

/* anti duplikat file */

const exist = folder.getFilesByName(filename);

if(exist.hasNext()){
return;
}

const blob = Utilities.newBlob(
Utilities.base64Decode(base64),
mime,
filename
);

folder.createFile(blob);

});

return json({status:true});

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
.setMimeType(ContentService.MimeType.JSON);

}