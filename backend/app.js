const express = require('express');

const app = express();

app.use(express.json());

//-------------------- Utilisateur -------------------
const userRoutes = require('./routes/user');
app.use('/api/auth', userRoutes);

// ------- Futur ajout des routes -------------------
// const 
// app.use
//erreur CORS
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
//   });
// --------------------------------------------------

// utilisation de MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://userdb01:userdb01@cluster0.b8l0fx1.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

module.exports = app;