require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  { timestamps: true }
);

const Url = mongoose.model('Url', urlSchema);

function generateShortCode(length = 7) {
  return crypto
    .randomBytes(Math.ceil(length * 0.75))
    .toString('base64url')
    .slice(0, length);
}

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/shorten', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidHttpUrl(url)) {
      return res.status(400).json({ message: 'Please provide a valid http/https URL.' });
    }

    const existing = await Url.findOne({ originalUrl: url });
    if (existing) {
      return res.json({
        shortUrl: `${BASE_URL}/${existing.shortCode}`,
        shortCode: existing.shortCode,
        originalUrl: existing.originalUrl
      });
    }

    let shortCode;
    let collision = true;

    while (collision) {
      shortCode = generateShortCode(7);
      const found = await Url.findOne({ shortCode });
      collision = Boolean(found);
    }

    const created = await Url.create({ originalUrl: url, shortCode });

    return res.status(201).json({
      shortUrl: `${BASE_URL}/${created.shortCode}`,
      shortCode: created.shortCode,
      originalUrl: created.originalUrl
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const record = await Url.findOne({ shortCode });

    if (!record) {
      return res.status(404).json({ message: 'Short URL not found.' });
    }

    return res.redirect(record.originalUrl);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url_shortener';
    await mongoose.connect(mongoUri);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
