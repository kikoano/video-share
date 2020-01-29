import express from "express";
import router1 from "./routes/routes1";
import { mongoURI } from "./config/keys";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app = express();
const port = 3001;

//connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', function () {
  console.log("Connected to database");
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/users", router1);

app.listen(port, () => console.log("User microservice listening on port " + port + "!"));