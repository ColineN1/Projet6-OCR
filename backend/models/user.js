//gestion des users
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
//unique = true => on peut s'inscrire 1 seule fois avec le user
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
//unique = true => on peut s'inscrire 1 seule fois avec le user 
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);