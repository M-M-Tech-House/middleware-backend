const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3100;

// Enable CORS at the host level for all routes
app.use(cors({
    origin: process.env.API_CORS_ORIGIN === '*' ? '*' : (process.env.API_CORS_ORIGIN ? process.env.API_CORS_ORIGIN.split(',') : '*'),
    credentials: process.env.API_CORS_CREDENTIALS === 'true'
}));

// Endpoint to check database statistics
app.get('/system/stats', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Database not connected',
                state: mongoose.connection.readyState,
                hint: 'Waiting for library to initialize connection...'
            });
        }

        const collections = await mongoose.connection.db.listCollections().toArray();
        const stats = [];

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            stats.push({ collection: col.name, count });
        }

        res.json({
            database: mongoose.connection.name,
            collections: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get the library name from environment variable
let libName = process.env.API_LIB;

if (libName && libName.startsWith('API_LIB=')) {
    libName = libName.replace('API_LIB=', '');
}

if (!libName) {
    console.error('FATAL ERROR: API_LIB environment variable is not defined.');
    console.error('Please set API_LIB to the name of the express-compatible library you want to use.');
    process.exit(1);
}

try {
    console.log(`Attempting to load middleware library: "${libName}"...`);

    let apiMiddleware;
    try {
        // Try loading the package directly
        apiMiddleware = require(libName);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log(`Failed to load "${libName}" directly. Trying specific entry points...`);
            // Fallback: Try loading apps/api/index.js if the main entry point is missing
            try {
                apiMiddleware = require(`${libName}/apps/api`);
                console.log(`Successfully loaded from "${libName}/apps/api"`);
            } catch (fallbackErr) {
                console.error(`Failed to load from "${libName}/apps/api"`);
                throw fallbackErr;
            }
        } else {
            throw err;
        }
    }

    // Logic to extract the router/app if the export is an object
    let middlewareToMount = apiMiddleware;

    if (typeof apiMiddleware !== 'function') {
        if (apiMiddleware.router) {
            console.log('Detected ".router" property on exported object. Using it.');
            middlewareToMount = apiMiddleware.router;
        } else if (apiMiddleware.app) {
            console.log('Detected ".app" property on exported object. Using it.');
            middlewareToMount = apiMiddleware.app;
        } else {
            console.warn(`Warning: The loaded library "${libName}" does not export a function and no .router/.app property was found.`);
        }
    }

    // Mount the middleware at the configured API root (using API_PREFIX per user request)
    const apiPrefix = process.env.API_PREFIX || '/';
    app.use(apiPrefix, middlewareToMount);

    console.log(`Successfully mounted "${libName}" as middleware at prefix "${apiPrefix}".`);

} catch (error) {
    console.error(`Failed to load library "${libName}".`);
    console.error('Error details:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error(`\nHint: Make sure to install the library using: npm install ${libName}`);
    }
    process.exit(1);
}

// Export the app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`API Host running on port ${port}`);
    });
}
