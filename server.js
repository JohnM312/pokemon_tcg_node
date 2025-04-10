const express = require("express");
const cors = require("cors");
const app = express();
const Joi = require('joi'); 
const multer = require('multer'); 
const port = process.env.PORT || 3001; 
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

let pokemonCards = [
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
        "hp": 180,
        "abilities": ["Slash (60)", "Crimson Storm (200)"],
        "rarity": "EX",
        "set": "Base Set"
    },
    {
        "_id": 3,
        "name": "Blastoise",
        "img_name": "images/Blastoise EX.png",
        "type": "Water",
        "hp": 180,
        "abilities": ["Surf (40)", "Hydro Bazooka (100+)"],
        "rarity": "EX",
        "set": "Base Set"
    },
    {
        "_id": 4,
        "name": "Venusaur",
        "img_name": "images/Venasaur EX.png",
        "type": "Grass",
        "hp": 190,
        "abilities": ["Giant Bloom (100)", "Razor Leaf (60)"],
        "rarity": "EX",
        "set": "Base Set"
    },
    {
        "_id": 5,
        "name": "Gengar",
        "img_name": "images/Gengar Uncommon.png",
        "type": "Ghost",
        "hp": 110,
        abilities: ["Hypnoblast (90)"],
        rarity: "Uncommon",
        set: "Haunted Shadows",
    },
    {
        "_id": 6,
        "name": "Mewtwo",
        "img_name": "images/Mewtwo EX.png",
        "type": "Psychic",
        "hp": 150,
        abilities: ["Psychic Sphere (50)", "Psydrive (120)"],
        rarity: "EX",
        set: "Psychic Masters",
    },
    {
        "_id": 7,
        "name": "Lucario",
        "img_name": "images/Lucario Uncommon.png",
        "type": "Fighting",
        "hp": 130,
        abilities: ["Avenging Knuckle (30+)", "Accelerating Stab (120)"],
        rarity: "Uncommon",
        set: "Battle Warriors",
    },
    {
        "_id": 8,
        "name": "Rayquaza",
        "img_name": "images/Rayquaza EX.jpg",
        "type": "Dragon",
        "hp": 170,
        abilities: ["Intensifying Burn (10+)", "Dragon Pulse (100)"],
        rarity: "EX",
        set: "Sky Legends"
    }
];


// POST Endpoint for Adding New Pokemon
app.post('/api/pokemon', upload.single('image'), (req, res) => {
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
        name: name,
        type: type,
        hp: hp,
        abilities: abilities.split(","),
        rarity: rarity,
        set: set,
        img_name: 'images/' + req.file.filename // Store the image file name
    };
    pokemonCards.push(newCard);

    res.status(201).json({ success: true, message: 'Card added successfully!', card: newCard });
});

app.get('/api/pokemon', (req, res)=>{
    res.json(pokemonCards);
});

app.listen(port, ()=>{
    console.log("I'm listening");
});