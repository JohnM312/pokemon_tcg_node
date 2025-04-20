const express = require("express");
const cors = require("cors");
const app = express();
const Joi = require('joi'); // Import Joi
const multer = require('multer'); // Import multer
const port = process.env.PORT || 3001;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let pokemonCards = [
    [
        {
            "_id": 1,
            "name": "Pikachu",
            "img_name": "images/Pikachu V.jpg",
            "type": "Electric",
            "hp": 190,
            "abilities": ["Lightning Blast (100+)"],
            "rarity": "V",
            "set": "Base Set"
        },
        {
            "_id": 2,
            "name": "Charizard",
            "img_name": "images/Charizard EX.png",
            "type": "Fire",
            "hp": 120,
            "abilities": ["Slash (60)", "Crimson Storm (200)"],
            "rarity": "EX",
            "set": "Base Set"
        },
        {
            "_id": 3,
            "name": "Blastoise",
            "img_name": "images/Blastoise EX.png",
            "type": "Water",
            "hp": 100,
            "abilities": ["Surf (40)", "Hydro Bazooka (100)"],
            "rarity": "EX",
            "set": "Base Set"
        },
        {
            "_id": 4,
            "name": "Venusaur",
            "img_name": "images/Venasaur EX.png",
            "type": "Grass",
            "hp": 110,
            "abilities": ["Giant Bloom (100)", "Razor Leaf (60)"],
            "rarity": "EX",
            "set": "Base Set"
        },
        {
            "_id": 5,
            "name": "Gengar",
            "img_name": "images/Gengar Uncommon.png",
            "type": "Ghost",
            "hp": 90,
            "abilities": ["Hypnoblast (90)"],
            "rarity": "Uncommon",
            "set": "Haunted Shadows"
        },
        {
            "_id": 6,
            "name": "Mewtwo",
            "img_name": "images/Mewtwo EX.png",
            "type": "Psychic",
            "hp": 130,
            "abilities": ["Psychic Sphere (50)", "Psydrive (120)"],
            "rarity": "EX",
            "set": "Psychic Masters"
        },
        {
            "_id": 7,
            "name": "Lucario",
            "img_name": "images/Lucario Uncommon.png",
            "type": "Fighting",
            "hp": 100,
            "abilities": ["Avenging Knuckle (30+)", "Accelerating Stab (120)"],
            "rarity": "Uncommon",
            "set": "Battle Warriors"
        },
        {
            "_id": 8,
            "name": "Rayquaza",
            "img_name": "images/Rayquaza EX.jpg",
            "type": "Dragon",
            "hp": 140,
            "abilities": ["Intensifying Burn (10+)", "Dragon Pulse (100)"],
            "rarity": "EX",
            "set": "Sky Legends"
        }
    ]
];

const cardSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    hp: Joi.number().integer().positive().required(),
    abilities: Joi.array().items(Joi.string()).required(),
    rarity: Joi.string().required(),
    set: Joi.string().required()
});

const validateCard = (card) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        type: Joi.string().required(),
        hp: Joi.number().integer().positive().required(),
        abilities: Joi.array().items(Joi.string()).required(),
        rarity: Joi.string().required(),
        set: Joi.string().required()
    });

    return schema.validate(card);
};

// POST Endpoint for Adding New Pokemon
app.post('http://localhost:3000/pokemon-tcg-reacts/catalog', upload.single('image'), (req, res) => {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }
   const { name, type, hp, abilities, rarity, set } = req.body;
    if(!name || !type || !hp || !abilities || !rarity || !set) {
      return res.status(400).json({ success: false, message: 'Please Provide Required Form Data'})
    }
    const newCard = {
        _id: pokemonCards.length > 0 ? pokemonCards[pokemonCards.length - 1]._id + 1 : 1,
        name: req.body.name,
        type: req.body.type,
        hp: req.body.hp,
        abilities: req.body.abilities.split(","),
        rarity: req.body.rarity,
        set: req.body.set,
        img_name: 'images/' + req.file.filename
    };
    pokemonCards.push(newCard);

    res.status(201).json({ success: true, message: 'Card added successfully!', card: newCard });
});

app.put('http://localhost:3000/pokemon-tcg-reacts/catalog:id', upload.single('image'), (req, res) => {
    const cardId = parseInt(req.params.id);
    const cardIndex = pokemonCards.findIndex(card => card._id === cardId);

    if (cardIndex === -1) {
        return res.status(404).json({ success: false, message: 'Card not found' });
    }

    // Update the Pokémon card based on index
    const updatePokemon = {
        _id: cardId,
        name: req.body.name,
        type: req.body.type,
        hp: req.body.hp,
        abilities: req.body.abilities.split(","),
        rarity: req.body.rarity,
        set: req.body.set,
        img_name: req.file ? "images/" + req.file.filename : pokemonCards[cardIndex].img_name,
    }

    pokemonCards[cardIndex] = updatePokemon

    res.json({ success: true, message: 'Card updated successfully', card: pokemonCards[cardIndex]});
});

//DELETE Route from api
app.delete('http://localhost:3000/pokemon-tcg-reacts/catalog:id', (req, res) => {
    const cardId = parseInt(req.params.id); // Parse the ID
    const cardIndex = pokemonCards.findIndex(card => card._id === cardId);

      if (cardIndex === -1) {
        return res.status(404).json({ success: false, message: 'Card not found' });
      }

    pokemonCards.splice(cardIndex, 1);
      res.json({ success: true, message: 'Card deleted successfully!' }); // Return success message
  });

app.get('http://localhost:3000/pokemon-tcg-reacts/catalog', (req, res)=>{
    res.json(pokemonCards);
});

app.listen(port, ()=>{
    console.log("I'm listening");
});