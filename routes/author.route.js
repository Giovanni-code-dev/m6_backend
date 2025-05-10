import express from 'express';
import Author from '../models/Author.js';
import BlogPost from '../models/BlogPost.js';
import multer from "multer"
import cloudinaryUploader from '../uploads/cloudinary.js'

const router = express.Router();

// crea un novo autore con POST
router.post('/', async (req, res) => {
    try {
        const { nome, cognome, email, data_di_nascita, avatar } = req.body;

        // Validazione minima (puoi anche usare una libreria come Joi in futuro)
        if (!nome || !cognome) {
            return res.status(400).json({ error: 'nome e cognome sono obbligatori' });
        }

        const newAuthor = new Author({
            nome,
            cognome,
            email,
            data_di_nascita,
            avatar,
        });

        const savedAuthor = await newAuthor.save();
        res.status(201).json(savedAuthor);
    } catch (error) {
        console.error('Errore nella creazione autore:', error);
        res.status(500).json({ error: 'Errore nel salvataggio dell\'autore' });
    }
});

// prende tutti gli autori presenti nel db
router.get('/', async (req, res) => {

    try {

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;


        console.log(page, limit)

        const authors = await Author.find()
            .limit(limit)
            .skip(limit * (page - 1)); // prende tutti gli autori
        res.json(authors);
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il recupero degli autori' });
    }
});

// prende un autore specifico per id
router.get('/:id', async (req, res) => {
    console.log(req.params.id)
    try {
        const authors = await Author.findById(req.params.id); // prende un autore specifico
        res.status(200).json(authors);
    } catch (error) {
        res.status(404).json({ message: 'Autore non trovato!' });
    }
});

// GET tutti i post di un autore specifico
router.get('/:id/posts', async (req, res) => {
    try {
        const posts = await BlogPost.find({ author: req.params.id }).populate('author');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei post dell’autore' });
    }
});

// modifica autore presente nel db con PUT
router.put('/:id', async (req, res) => {
    try {
        const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAuthor);
    } catch (error) {
        res.status(500).json({ message: 'Errore nella PUT' });
    }
})

// elimina autore presente in db con DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedAuthor = await Author.findByIdAndDelete(req.params.id); // elimina un autore specificato da id
        if (!deletedAuthor) {
            return
            res.status(404).json({ messagge: "Autore non trovato!" });
        }

        res.json(deletedAuthor);
    } catch (error) {
        res.status(500).json({ message: 'Errore nella DELETE' });
    }

})

// modifica avatar img se presente nel db con PATCH
router.patch("/:id/avatar", cloudinaryUploader.single("avatar"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File mancante o malformato" })
      }
  
      const updatedAuthor = await Author.findByIdAndUpdate(
        req.params.id,
        { avatar: req.file.path },
        { new: true }
      )
  
      res.status(200).json(updatedAuthor)
    } catch (error) {
      res.status(500).json({ message: "Errore durante il caricamento dell'avatar", error: error.message })
    }
  })
  
  




export default router;
