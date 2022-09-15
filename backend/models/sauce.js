const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true}, // doit être compris entre 1 et 10
    likes: { type: Number, required: true },
    dislikes: { type: Number, required: true },
    usersLiked: {type: Array}, // String<userId>
    usersDisliked: {type: Array}, // rString<userId>
});

module.exports = mongoose.model('Sauce', sauceSchema);