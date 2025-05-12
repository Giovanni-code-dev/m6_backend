import express from 'express'
import Author from '../models/Author.js'
import BlogPost from '../models/BlogPost.js'
import cloudinaryUploader from '../uploads/cloudinary.js'
import { JWTAuthMiddleware, adminOnly } from '../lib/middlewares.js'
import { sendEmail } from '../utils/sendEmail.js';



const router = express.Router()

// registrazione
router.post('/', async (req, res) => {
  try {
    const { nome, cognome, email, data_di_nascita, avatar, password } = req.body;

    if (!nome || !cognome || !email || !password) {
      return res.status(400).json({ error: 'nome, cognome, email e password sono obbligatori' });
    }

    //Controllo duplicato
    const existingAuthor = await Author.findOne({ email });
    if (existingAuthor) {
      return res.status(409).json({ error: 'Email già registrata' });
    }

    const newAuthor = new Author({
      nome,
      cognome,
      email,
      password,
      data_di_nascita,
      avatar,
    });

    const savedAuthor = await newAuthor.save();

    //Invio email
    await sendEmail({
      to: savedAuthor.email,
      from: 'giovanni.dellelenti@gmail.com',
      subject: 'Benvenuto su Strive Blog!',
      text: `Ciao ${savedAuthor.nome}, grazie per esserti registrato.`,
      html: `<strong>Benvenuto ${savedAuthor.nome}</strong><br>La tua registrazione è andata a buon fine! 🎉`,
    });

    res.status(201).json(savedAuthor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel salvataggio dell\'autore' });
  }
});



// altre routes

router.get('/', JWTAuthMiddleware, async (req, res) => {
  try {
    const authors = await Author.find()
    res.json(authors)
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il recupero degli autori' })
  }
})

router.get('/:id', JWTAuthMiddleware, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.status(200).json(author)
  } catch (error) {
    res.status(404).json({ message: 'Autore non trovato!' })
  }
})

router.get('/:id/posts', JWTAuthMiddleware, async (req, res) => {
  try {
    const posts = await BlogPost.find({ author: req.params.id }).populate('author')
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei post dell’autore' })
  }
})

router.put('/:id', JWTAuthMiddleware, async (req, res) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updatedAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Errore nella PUT' })
  }
})

router.delete('/:id', JWTAuthMiddleware, async (req, res) => {
  try {
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id)
    if (!deletedAuthor) {
      return res.status(404).json({ message: "Autore non trovato!" })
    }
    res.json(deletedAuthor)
  } catch (error) {
    res.status(500).json({ message: 'Errore nella DELETE' })
  }
})

router.patch("/:id/avatar", JWTAuthMiddleware, cloudinaryUploader.single("avatar"), async (req, res) => {
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

export default router
