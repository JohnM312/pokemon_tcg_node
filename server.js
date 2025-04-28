const mongoose = require('mongoose');
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
mongoose
    .connect(
    "mongodb+srv://JohnM312:jj1917MAI@cluster0.hl7jiys.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )   
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Couldn't connect to MongoDB", error);
    });

const cardSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 },
    type: { type: String, required: true },
    hp: { type: Number, required: true, min: 1 },
    abilities: { type: [String], required: true },
    rarity: { type: String, required: true },
    set: { type: String, required: true },
    img_name: { type: String, required: true } // Path to the image
});

const Card = mongoose.model('Card', cardSchema);

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
app.post('/api/pokemon', upload.single('image'), async (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }

  const { name, type, hp, abilities, rarity, set } = req.body;

  if (!name || !type || !hp || !abilities || !rarity || !set) {
    return res.status(400).json({ success: false, message: 'Please Provide Required Form Data' });
  }

  // Joi Validation
  const { error } = validateCard(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const newCard = new Card({
    name: req.body.name,
    type: req.body.type,
    hp: req.body.hp,
    abilities: req.body.abilities.split(","),
    rarity: req.body.rarity,
    set: req.body.set,
    img_name: 'images/' + req.file.filename
  });

  try {
    const savedCard = await newCard.save();
    res.status(201).json({ success: true, message: 'Card added successfully!', card: savedCard });
  } catch (err) {
    console.error("Error saving card:", err);
    res.status(500).json({ success: false, message: 'Failed to save card.', error: err });
  }
});

app.put('/api/pokemon/:id', upload.single('image'), async (req, res) => {
    try {
        const cardId = req.params.id;
        const { name, type, hp, abilities, rarity, set } = req.body;
        const card = await Card.findByIdAndUpdate(cardId, {
            name: name,
            type: type,
            hp: hp,
            abilities: abilities.split(','),
            rarity: rarity,
            set: set,
            img_name: req.file ? 'images/' + req.file.filename : req.body.img_name // Use existing image if no new image is uploaded
        }, { new: true });

        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        res.json({ success: true, message: 'Card updated successfully', card: card });
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({ success: false, message: 'Failed to update card.', error: error });
    }
});

app.delete('/api/pokemon/:id', async (req, res) => {
    try {
        const cardId = req.params.id;
        const card = await Card.findByIdAndDelete(cardId);

        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        res.json({ success: true, message: 'Card deleted successfully!' }); // Return success message
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ success: false, message: 'Failed to delete card.', error: error });
    }
});

app.get('/api/pokemon', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        console.error("Error getting cards:", error);
        res.status(500).json({ success: false, message: 'Failed to get cards', error: error });
    }
});

app.listen(port, ()=>{
    console.log("I'm listening");
});