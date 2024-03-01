const express = require('express');
const router = express.Router();
const upload = require('./uploadConfig'); // Adjust the path based on your project structure
express.static.mime.define({'application/wasm': ['wasm']});

// POST route for uploading an Addressable asset bundle
router.post('/uploadAssetBundle', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(400).send(err);
        } else {
            if(req.file == undefined){
                res.status(400).send('Error: No File Selected!');
            } else {
                res.send('File Uploaded Successfully!');
            }
        }
    });
});

module.exports = router;
