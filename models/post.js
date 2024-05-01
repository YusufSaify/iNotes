const mongoose = require('mongoose');
const { Schema, model } = mongoose;



const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: [],
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    totaltimeassigned: {
        type: Number
    },
    asignedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    rating: {
        type: Number,
        default: 3
    },
    peoplerated: {
        type: Number
    },
    availability: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: true
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
