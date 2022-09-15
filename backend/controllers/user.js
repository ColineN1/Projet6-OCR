// On ajoute des tokens 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Dans cette fonction sign up :
//     nous appelons la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois.
//     dans notre bloc then , nous créons un utilisateur et l'enregistrons dans la base de données, en renvoyant une réponse (de réussite ou d'échec) 
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
};

//  Dans cette fonction login:
//     Nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
//         - Dans le cas contraire, nous renvoyons une erreur 401 Unauthorized.
//         - Si l'e-mail correspond à un utilisateur existant, nous continuons.
//     Nous utilisons la fonction compare de bcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :
//         - S'ils ne correspondent pas, nous renvoyons une erreur 401 Unauthorized avec le même message que lorsque l’utilisateur n’a pas été trouvé, afin de ne pas laisser quelqu’un vérifier si une autre personne est inscrite sur notre site.
//         - S'ils correspondent, les informations d'identification de notre utilisateur sont valides. Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token. Ce token est une chaîne générique pour l'instant.
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        //Dans le code ci-dessus :
                        //     Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.
                        //     Ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token).
                        //     Nous utilisons une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token.
                        //     Nous définissons la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures.
                        //     Nous renvoyons le token au front-end avec notre réponse.
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};