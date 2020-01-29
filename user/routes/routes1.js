import express from "express";
import UserData from "../models/UserData";

const router = express.Router();

router.post("/register", async (req, res) => {
    /*/ let data = req.body;
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
     await User.findOne({ username: username }, (err, user) => {
         if (!user)
             return res.send("User not found!");
         const match = bcrypt.compareSync(password, user.password);
         if (!match)
             return res.send("Wrong password!");
         id = user.id;
     });*/
});

router.get("/", async (req, res) => {
    await UserData.find({}, function(err, users) {
        res.status(200).json(users);
     });
});

router.post("/", async (req, res) => {
    const data = req.body;
    const user = new UserData({
        user_id: req.headers.id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_imgurl: (data.avatar_imgurl || "")
    });
    user.save((err) => {
        if (err)
            return res.status(404).json(err);
        res.status(200).send("UserData created");
    });
});

router.get("/:id", async (req, res) => {
    await UserData.find({user_id:req.params.id}, (err, user) => {
        if (!user)
            return res.status(404).send("User not found!");
            res.status(200).json(user);

    });
});

export default router;