const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');
const router = express.Router();
express.static.mime.define({'application/wasm': ['wasm']});

// Temporary storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/webgl-builds/temp/'); // Use a temporary directory
    },
    filename: function(req, file, cb) {
        // Use the original file name or a timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload route
router.post('/upload', upload.single('gameBuild'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const tempPath = req.file.path;
    const finalName = `${req.body.gameName}-${Date.now()}${path.extname(req.file.originalname)}`;
    const finalPath = path.join(__dirname, '../../../public/webgl-builds/', finalName);

    // Rename the file to include the game name
    fs.rename(tempPath, finalPath, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
            return res.status(500).send('Failed to process game files.');
        }

        // Extract the ZIP file
        const zip = new admZip(finalPath);
        const extractPath = path.join(__dirname, '../../../public/webgl-builds/', req.body.gameName); // Directory named after the game
        zip.extractAllToAsync(extractPath, true, (err) => {
            if (err) {
                console.error('Error extracting ZIP file:', err);
                return res.status(500).send('Failed to extract game files.');
            }

            // Update games.json or perform other necessary actions

            res.send('Game uploaded and extracted successfully!');
        });
    });
});

// Example route for listing games
router.get('/list', (req, res) => {
    const gamesPath = path.join(__dirname, '../../../games.json');

    fs.readFile(gamesPath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading game metadata.');
        }

        res.json(JSON.parse(data));
    });
});

// Route to delete a game
router.delete('/delete/:gameName', (req, res) => {
    // Implementation remains as previously described
});

module.exports = router;
