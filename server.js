const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;
const assetRoutes = require('./api/v1/assets/assetRoutes');
const userRoutes = require('./api/v1/users/userRoutes');
const gameRoutes = require('./api/v1/games/gameRoutes');
// Define the MIME type for '.wasm' files
express.static.mime.define({'application/wasm': ['wasm']});

// Serve static files from the public directory
app.use('/public', express.static('public'));

app.get('/unity/upload', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html');
});

app.get('/unity/games', (req, res) => {
    res.sendFile(__dirname + '/public/manageGames.html');
});

app.use((req, res, next) => {
    // Remove Content-Encoding header for .wasm files
    if (req.path.endsWith('.wasm')) {
        res.removeHeader('Content-Encoding');
    }
    next();
});

// After the user routes:
app.use('/unity/api/games', gameRoutes);

// Then, after the asset routes:
app.use('/unity/api/users', userRoutes);

// Middleware to serve static files from 'public' directory
app.use(express.static('public'));
app.use('/unity/api/assets', assetRoutes);

// Basic route for testing the server
app.get('/unity', (req, res) => {
    res.send('Hello, WebGL Game Server is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
