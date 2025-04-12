// backend/server.js
const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/upload", uploadRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
