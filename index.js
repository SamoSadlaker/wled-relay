const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chokidar = require('chokidar');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const CONFIG_PATH = path.join(__dirname, 'config.json');

let server;
let currentApp = createApp(); // Initial app creation

function createApp() {
  try {
    const config = loadConfig();
    const app = express();

    config.endpoints.forEach(({ path: endpointPath, webhook }) => {
      app.get(endpointPath, createHandler(webhook));
      console.log(`Registered endpoint: ${endpointPath} → ${webhook}`);
    });

    app.use((req, res) => res.status(404).send('Not Found'));
    return app;
  } catch (err) {
    console.error('Error creating app:', err.message);
    return null; // Return null if config is invalid
  }
}

function loadConfig() {
  try {
    const rawData = fs.readFileSync(CONFIG_PATH);
    const config = JSON.parse(rawData);

    // Basic validation
    if (!Array.isArray(config.endpoints)) {
      throw new Error('Invalid config: endpoints must be an array');
    }

    return config;
  } catch (err) {
    throw new Error(`Config file error: ${err.message}`);
  }
}

function createHandler(webhook) {
  return async (req, res) => {
    const key = req.query.key || req.headers['x-api-key'];
    if (key !== API_KEY) return res.status(404).send('Not Found');

    try {
      await axios.post(webhook, { triggeredAt: new Date().toISOString() });
      return res.sendStatus(200);
    } catch (err) {
      console.error(`Webhook failed:`, err.message);
      return res.status(500).send('Internal Error');
    }
  };
}

function startServer() {
  if (currentApp) {
    server = currentApp.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

function reloadServer() {
  console.log('\nAttempting config reload...');
  const newApp = createApp();

  if (newApp) {
    // Only update if new config is valid
    currentApp = newApp;

    // Close old server and start new one
    if (server) {
      server.close(() => {
        startServer();
        console.log('Config reloaded successfully\n');
      });
    } else {
      startServer();
    }
  } else {
    console.log('Keeping previous config due to errors\n');
  }
}

// Initial startup
startServer();

// Watch for config changes
const watcher = chokidar.watch(CONFIG_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

watcher.on('change', reloadServer);
watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});

// Handle process exit
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('\nShutting down server...');
  watcher.close();
  if (server) {
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}