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

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/wled-relay.git
cd wled-relay
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
```bash
cp .env.example .env
```
or
```env
PORT=3000
API_KEY=your_super_secret_key
```

### 4. Config.json
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
---

## 🐳 Docker

### 1. Build image
```bash
docker build -t wled-relay .
```

### 2. Run container
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/config.json:/app/config.json \
  --name relay \
  webhook-relay
```
> 🐧 On Linux, you may need to use --network host or adjust the internal webhook URLs.

or

#### 🧪 To use it:
```bash
docker-compose up -d
```
#### 🔄 To rebuild after changes:
```bash
docker-compose up -d --build
```

---

## 🔐 Security
All endpoints require an API key provided via:

* Query parameter: ?key=your_api_key
* Or header: x-api-key: your_api_key

---

## 🛑 404 for Unknown Routes
Any unregistered endpoint will return a proper 404 Not Found.


