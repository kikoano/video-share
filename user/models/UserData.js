import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserDataSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    avatar_imgurl: {
        type: String,
        required: true,
    },
});

export default mongoose.model("UserData", UserDataSchema);

