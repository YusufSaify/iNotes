const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        default: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.Delectus ex laborum ducimus, doloribus nemo sit tempore amet pariatur architecto hic aperiam ab placeat, beatae quae voluptas sint.Enim, error doloremque nemo, fuga tenetur commodi ab labore odit optio laborum ullam!"
    },
    image: {
        type: String
    },
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Post"
    },
    dateoncreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("user", UserSchema);