# Node.js URL Shortener (MongoDB)

A simple URL shortener API built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Start MongoDB locally (or update `MONGODB_URI` in `.env`).
4. Start server:
   ```bash
   npm start
   ```

## API

### Create short URL

`POST /shorten`

Body:
```json
{
  "url": "https://example.com/some/long/path"
}
```

Response:
```json
{
  "shortUrl": "http://localhost:3000/AbC12xY",
  "shortCode": "AbC12xY",
  "originalUrl": "https://example.com/some/long/path"
}
```

### Redirect

`GET /:shortCode`

Opens the original URL in the browser.
