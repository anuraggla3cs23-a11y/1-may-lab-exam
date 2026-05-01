const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
require("dotenv").config();

const Url = require("./models/Url");

const app = express();
app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/urlShortener")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const BASE_URL = "http://localhost:5000";

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  try {
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json(url);
    }

    const shortCode = shortid.generate();
    const shortUrl = `${BASE_URL}/${shortCode}`;

    url = new Url({
      originalUrl,
      shortCode,
      shortUrl
    });

    await url.save();
    res.json(url);

  } catch (err) {
    res.status(500).json("Server error");
  }
});

app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json("Not found");
    }

  } catch (err) {
    res.status(500).json("Server error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));