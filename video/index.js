import express from "express"

const app = express();
const port = 3002;

let videos = [
    {
        id: 1,
        userId: 1,
        name: "My video"
    },
    {
        id: 1,
        userId: 1,
        name: "Testing video"
    },
    {
        id: 1,
        userId: 1,
        name: "Gaming"
    },
    {
        id: 1,
        userId: 2,
        name: "music"
    }
];
app.get("/api/v1/videos", (req, res) => {
    res.send(videos);
});

app.listen(port, () => console.log("User microservice listening on port " + port + "!"));