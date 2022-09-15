//On veut que la logique métier ici avec des controllers
const Sauce = require('../models/sauce');
const fs = require('fs'); 

// Afficher toutes les sauces 
exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

// Créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce ajouté !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

// Afficher une sauce 
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

//Modifier une sauce 
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) { //Seul l'utilisateur qui a créé la sauce peut la supprimer
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                //Suppression de l'image de la BD et de la sauce
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};


// Permet de savoir si l'id est présent dans un tableau
function idIsPresent(userId, array) {
    return array.includes(userId)
}

//L'utilisateur aime une sauce 
exports.likeSauce = (req, res, next) => {
    const sauceObject = { ...req.body };
    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // recuperation de l'id depuis le service auth
            const userId = req.auth.userId
            // Option like +1
            const likeOption = req.body.like
            if(likeOption === 1 && !idIsPresent(userId, sauce.usersLiked)){
                Sauce.updateOne({_id:req.params.id}, {$inc:{likes: 1}, $push: {usersLiked:userId}})
                    .then(() =>{ res.status(200).json({message: "Vouz aimez cette sauce!"})})
                    .catch(error =>{ res.status(400).json({error: error});})
            }
            // Option Dislike -1
            if (likeOption === -1 && !idIsPresent(userId, sauce.usersDisliked)) {
                Sauce.updateOne({_id:req.params.id}, {$inc:{dislikes: 1}, $push: {usersDisliked:userId}})
                    .then(() =>{ res.status(200).json({message: "Vouz n'aimez pas cette sauce!"})})
                    .catch(error =>{ res.status(400).json({error: error});})
            }
            // Option annuler le dislike
            if (likeOption === 0 && idIsPresent(userId, sauce.usersDisliked)) {
                Sauce.updateOne({_id:req.params.id}, {$inc:{dislikes: -1}, $pull: {usersDisliked:userId}})
                    .then(() =>{ res.status(200).json({message: "Vouz avez annulé votre dislike!"})})
                    .catch(error =>{ res.status(400).json({error: error});})
            }
            // Option annuler le like
            if (likeOption === 0 && idIsPresent(userId, sauce.usersLiked)) {
                Sauce.updateOne({_id:req.params.id}, {$inc:{likes: -1}, $pull: {usersLiked:userId}})
                    .then(() =>{ res.status(200).json({message: "Vouz avez annulé votre like!"})})
                    .catch(error =>{ res.status(400).json({error: error});})
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};