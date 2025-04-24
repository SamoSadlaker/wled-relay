const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const CONFIG_PATH = path.join(__dirname, 'config.json');

let routes = [];

function clearRoutes() {
  if (!app._router || !app._router.stack) {
    console.warn('Router stack not initialized yet');
    return;
  }

  app._router.stack = app._router.stack.filter(layer => {
    if (!layer.route) return true; // keep non-route middleware
    return !routes.includes(layer.route.path); // remove if in our route list
  });

  routes = [];
}

function registerRoutes(config) {
  clearRoutes();

  for (const { path, webhook } of config.endpoints) {
    app.get(path, async (req, res) => {
      const key = req.query.key || req.headers['x-api-key'];

      if (key !== API_KEY) return res.status(404).send('Not Found');

      try {
        await axios.post(webhook, { triggeredAt: new Date().toISOString() });
        return res.sendStatus(200);
      } catch (err) {
        console.error(`Webhook for ${path} failed:`, err.message);
        return res.status(500).send('Internal Error');
      }
    });

    routes.push(path);
    console.log(`Registered endpoint: ${path} → ${webhook}`);
  }
}

function loadConfigAndRegister() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    registerRoutes(config);
  } catch (err) {
    console.error('Failed to load config:', err.message);
  }
}

fs.watchFile(CONFIG_PATH, { interval: 1000 }, () => {
  console.log('Config changed. Reloading...');
  loadConfigAndRegister();
});

loadConfigAndRegister();

app.listen(PORT, () => {
  console.log(`Relay server running on port ${PORT}`);
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});