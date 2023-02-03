const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const connectDb = require("./config/db");

const app = express();
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Testing");
});

app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/pay", require("./routes/paymentRoutes"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`port ${port}`));
