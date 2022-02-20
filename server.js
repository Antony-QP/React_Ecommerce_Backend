const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");

// App
const app = express();

// Set up database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(`Database error ${err}`));

// Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

// Routes middleware
app.use("/api", authRoutes);

fs.readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

// Choose port that hosts the server
const port = process.env.PORT || 8000;

app.listen(port, console.log(`Server is running on port ${port}`));
