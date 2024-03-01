const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/', // Adjust the path as needed
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // for example, 10MB limit
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('assetBundle'); // 'assetBundle' is the name of the field in your upload form

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /zip/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: ZIP Files Only!');
    }
}

module.exports = upload;
