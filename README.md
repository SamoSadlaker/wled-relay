# Webhook Relay Server

A lightweight, Dockerized Node.js application that exposes secure HTTP endpoints which forward requests to local webhooks. Perfect for triggering smart home actions or internal services via public triggers like IFTTT — without exposing your local webhooks directly.

---

## ✨ Features

- 🔁 Dynamic endpoints configured via `config.json`
- 🔐 Simple API key protection
- 📦 Dockerized and easy to deploy
- 🚀 Forwards requests to local webhooks
- 🔄 Hot reload when config file changes (no restart needed)
- 🧱 Extensible structure for custom logic

---

## 📁 Project Structure
├── config.json # Define your endpoints and target webhooks <br>
├── .env # Store your API key and port <br>
├── Dockerfile # Docker config <br>
├── index.js # Main application logic <br>
└── package.json # Dependencies and scripts<br>

---

## 🚀 Quick Start

```bash
docker run -d \
  -p 3000:3000 \
  -e API_KEY=your_secret_key \
  -v /path/to/config.json:/app/config.json \
  samosadlaker/wled-relay:latest
```
Manual Setup:
1. Clone repo & install dependencies
2. Configure .env and config.json
3. Start with npm start

## ⚙️ Configuration
`config.json`
```json
{
  "endpoints": [
    {
      "path": "/trigger-light",
      "webhook": "http://host.docker.internal:4567/light"
    },
    {
      "path": "/trigger-alarm",
      "webhook": "http://host.docker.internal:4567/alarm"
    }
  ]
}
```

`.env`
```env
PORT=3000                 # Server port
API_KEY=change_this       # Required for all requests
```

## 🔐 Authentication
Include your API key via either:
* Header: x-api-key: your_key
* Query param: ?key=your_key

## 🐳 Docker Compose
```yaml
services:
  relay:
    image: samosadlaker/wled-relay:latest
    ports:
      - "3000:3000"
    environment:
      - API_KEY=${API_KEY}
    volumes:
      - ./config.json:/app/config.json
    restart: unless-stopped
```

## 🌐 Usage Example
```bash
curl -X GET "http://your-server:3000/wled-on?key=your_key"
```