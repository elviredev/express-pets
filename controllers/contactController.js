const validator = require("validator")
const nodemailer = require("nodemailer")
const sanitizeHtml = require("sanitize-html")
const { ObjectId } = require("mongodb");
const petsCollection = require("../db").db().collection("pets")
const contactsCollection = require("../db").db().collection("contacts")

// Config sanitize-html
const sanitizeOptions = {
    allowedTags: [],
    allowedAttributes: {}
}

/*
 * Soumettre le formulaire de contact
 */
exports.submitContact = async function (req, res, next) {
    // Détection du spam "chiot"
    if (req.body.secret.toUpperCase() !== "CHIOT") {
        console.log("spam détécté...")
        return res.json({message: "Désolé!"})
    }

    // S'assurer qu'on transmet des données de type chaînes et non des objets à MongoDB
    if (typeof req.body.name != "string") {
        req.body.name = ""
    }

    if (typeof req.body.email != "string") {
        req.body.email = ""
    }

    if (typeof req.body.comment != "string") {
        req.body.comment = ""
    }

    // Vérifier si email valide
    if (!validator.isEmail(req.body.email)) {
        console.log("email invalide détécté...")
        return res.json({message: "Désolé!"})
    }

    // Vérifier si ID valide
    if (!ObjectId.isValid(req.body.petId)) {
        console.log("ID invalide détécté...")
        return res.json({message: "Désolé!"})
    }

    // Vérifier que l'id du pet est de type id mongodb
    req.body.petId = new ObjectId(req.body.petId)

    // Vérifier si l'ID existe bien en BDD
    const doesPetExist = await petsCollection.findOne({ _id: req.body.petId })

    // Si l'animal n'existe pas en BDD
    if (!doesPetExist) {
        console.log("Cet animal n'existe pas...")
        return res.json({message: "Désolé!"})
    }

    // Créer un Objet de données à enregistrer en BDD
    const ourObject = {
        petId: req.body.petId,
        name: sanitizeHtml(req.body.name, sanitizeOptions),
        email: sanitizeHtml(req.body.email, sanitizeOptions),
        comment: sanitizeHtml(req.body.comment, sanitizeOptions)
    }

    console.log(ourObject)

    // Configurer email via mailtrap avec NodeJS
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAPUSERNAME,
            pass: process.env.MAILTRAPPASSWORD
        }
    })

    try {
        // Envoyer email à l'utilisateur intéressé par l'animal
        const promise1 = transport.sendMail({
            to: ourObject.email,
            from:"petadoption@localhost",
            subject: `Merci pour votre intérêt pour ${doesPetExist.name}`,
            html: `<h3 style="color:purple; font-size: 30px; font-weight: normal">Merci beaucoup !</h3>
               <p>Nous apprécions votre intérêt pour ${doesPetExist.name} et un membre de l'équipe prendra contact avec vous rapidement. Vous trouverez ci-dessous une copie du message que vous nous avez envoyé pour vos dossiers personnels.</p> 
               <p><em>${ourObject.comment}</em></p>
               `
        })
        // Envoyer un email à l'administrateur du site web
        const promise2 = transport.sendMail({
            to: "petadoption@localhost",
            from:"petadoption@localhost",
            subject: `Quelqu'un est intéressé par ${doesPetExist.name}`,
            html: `<h3 style="color:purple; font-size: 30px; font-weight: normal">Nouveau Contact !</h3>
               <p>
               Nom: ${ourObject.name}<br>
               Animal concerné: ${doesPetExist.name}<br>
               Email: ${ourObject.email}<br>
               Message: ${ourObject.comment}: 
               </p>
               `
        })

        // Insérer contacts en BDD
        const promise3 = await contactsCollection.insertOne(ourObject)

        await Promise.all([promise1, promise2, promise3])
    } catch (err) {
        next(err)
    }

    res.send("Merci de nous avoir envoyer les données")
}

/*
 * Afficher les contacts correspondant à un animal
 */
exports.viewPetContacts = async (req, res) => {
    // Vérifier si ID valide
    if (!ObjectId.isValid(req.params.id)) {
        console.log("ID invalide")
        return res.redirect("/")
    }

    // Vérifier que le pet existe en BDD
    const pet = await petsCollection.findOne({_id: new ObjectId(req.params.id)})
    if (!pet) {
        console.log("Cet animal n'existe pas!")
        return res.redirect("/")
    }

    const contacts = await contactsCollection.find({petId: new ObjectId(req.params.id)}).toArray()
    res.render("pet-contacts", { contacts, pet })
}