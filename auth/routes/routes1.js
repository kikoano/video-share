import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();
const cert = fs.readFileSync("./config/private.pem");
const certRefresh = fs.readFileSync("./config/privateRefresh.pem");
const publicKey = fs.readFileSync("./config/public.pem");
const publicRefresh = fs.readFileSync("./config/publicRefresh.pem");

router.post("/register", async (req, res) => {
    let data = req.body;
    const hash = await bcrypt.hash(data.password, 10);
    const user = new User({
        username: data.username,
        email: data.email,
        password: hash
    });
    user.save((err) => {
        if (err)
            return res.status(404).json(err);
        res.status(200).send("Successful registration");
    });
});

//Login user and create jwt and refresh token
router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let id;

    await User.findOne({ username: username }, (err, user) => {
        if (!user)
            return res.send("User not found!");
        const match = bcrypt.compareSync(password, user.password);
        if (!match)
            return res.send("Wrong password!");
        id = user.id;
    });
    //create jwt token
    const token = jwt.sign({
        "id": id
    }, cert, { algorithm: "RS256", expiresIn: "10m" });

    //create refresh token
    const refreshToken = jwt.sign({
        "id": id
    }, certRefresh, { algorithm: "RS256", expiresIn: "60d" });
    await User.findByIdAndUpdate(id, { refreshToken: refreshToken });

    res.cookie('token', token, {
        expires: new Date(Date.now() + 600000),
        secure: false, // set to true if your using https
        httpOnly: true,
    });
    res.cookie('refreshToken', refreshToken, {
        expires: new Date(Date.now() + 5184000000),
        secure: false, // set to true if your using https
        httpOnly: true,
    });
    res.status(200).json("Successful login");
});
router.get("/test", async (req, res) => {

    res.status(200).send(req.headers.id + " Test data!");
});

router.get("/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken === undefined)
        return res.status(403).json("No client refresh token!");

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, publicRefresh);
    } catch (err) {
        return res.status(403).json(err);
    }
    let equal = false;
    await User.findById(decoded.id, (err, user) => {
        if (refreshToken == user.refreshToken) {
            equal = true;
        }
    });
    if (equal) {
        //create jwt token
        const newToken = jwt.sign({
            "id": decoded.id
        }, cert, { algorithm: "RS256", expiresIn: "10m" });

        res.cookie("token", newToken, {
            expires: new Date(Date.now() + 600000),
            secure: false,
            httpOnly: true,
        });
        return res.status(200).json(decoded);
    }
    else
        return res.status(403).json("Refresh tokens dont match!");
});
router.get("/auth", (req, res) => {
    let token = req.cookies.token;
    if (token === undefined) {
        return res.status(403).json("No token!");
    }
    let decoded;
    try {
        decoded = jwt.verify(token, publicKey);
    } catch (err) {
        return res.status(403).json(err);
    }
    return res.status(200).json(decoded);
});

router.patch("/logout", async (req, res) => {
    await User.findByIdAndUpdate(req.headers.id, { refreshToken: null }, (err) => {
        if (err)
            return res.status(200).send("User not logged in!");
    });
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).send("User logout!");
});
export default router;