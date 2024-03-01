const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');
const unzipper = require('unzipper');
const { is } = require('express/lib/request');
const router = express.Router();
express.static.mime.define({'application/wasm': ['wasm']});


const upload = multer({ dest: 'uploads/' });


router.post('/upload-and-extract', upload.single('gameBuild'), (req, res) => {
    const zipFilePath = req.file.path;
    const gameName = req.body.gameName.replace(/ /g, '-');
    const finalName = `${gameName}-${Date.now()}`;

    const targetDirectory = 'public/webgl-builds/' + finalName;
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory);
    }


    // Extract the zip file
    fs.createReadStream(zipFilePath)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
            
            const entryName = entry.path;
            const targetFilePath = path.join(targetDirectory, entryName);

            if(entry.type === 'Directory'){
        
                if (!fs.existsSync(targetFilePath)) {
                    fs.mkdirSync(targetFilePath, { recursive: true }); // Create directory recursively
                }
        }else{
            // Extract all files, including hidden ones
            entry.pipe(fs.createWriteStream(targetFilePath));
        }
        })
        .on('close', () => {
            // File extracted successfully
            addGame({
                'id': finalName,
                'title': req.body.gameName,
                'uploadedAt': (new Date).toLocaleString(),
                'link': `${req.protocol}://${req.get('host')}/${targetDirectory}/index.html`,
                'path': targetDirectory
            })
            
            res.send('File uploaded and extracted successfully.');
        })
        .on('error', (err) => {
            // Error extracting file
            console.error('Error extracting file:', err);
            res.status(500).send('Error extracting file.');
        });
        
});




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


// Example route for listing games
router.get('/list', (req, res) => {
    const games = readGames();

    res.json(games);
});

// Route to delete a game
router.delete('/delete/:id', (req, res) => {

    const gameId = req.params.id;
    const games = readGames();
    const index = games.findIndex(game => game.id === gameId);

    fs.rmdir(games[index].path, { recursive: true }, (err) => {
        if (err) {
            console.error('Error removing directory:', err);
            return;
        }
        console.log('Directory removed successfully');
    });
    const updatedGames = games.filter(game => game.id !== gameId);
    writeData(updatedGames);
    res.send('Game deleted successfully');
});



const jsonFilePath = 'games.json';

// Read JSON file
function readGames() {
    try {
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (err) {
        console.error('Error reading JSON file:', err);
        return [];
    }
}

// Write JSON file
function writeData(games) {
    try {
        const jsonData = JSON.stringify(games, null, 2);
        fs.writeFileSync(jsonFilePath, jsonData);
    } catch (err) {
        console.error('Error writing JSON file:', err);
    }
}

// Add object to JSON list
function addGame(newObject) {
    let data = readGames();
    console.log(data);
    data.push(newObject);
    writeData(data);
}

module.exports = router;
