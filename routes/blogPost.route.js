// routes/blogpost.route.js
import express from 'express';
import BlogPost from '../models/BlogPost.js';
import Author from '../models/Author.js';
import cloudinaryUploader from '../uploads/cloudinary.js';
import { sendEmail } from '../utils/sendEmail.js'

const router = express.Router();

// GET all posts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, title } = req.query;

    const query = {};
    if (author) query.author = author;
    if (title) query.title = { $regex: title, $options: 'i' };

    const posts = await BlogPost.find(query)
      .populate('author')
      .limit(parseInt(limit))
      .skip(parseInt(limit) * (parseInt(page) - 1));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei blog post', error: error.message });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author');
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero del post' });
  }
});

// POST create new post
router.post('/', async (req, res) => {
  try {
    const { category, title, cover, readTime, author, content } = req.body;

    const foundAuthor = await Author.findById(author);
    if (!foundAuthor) return res.status(404).json({ message: 'Autore non trovato' });

    const newPost = new BlogPost({ category, title, cover, readTime, author, content });
    const savedPost = await newPost.save();

    // Invia email all'autore
    await sendEmail({
      to: foundAuthor.email,
      from: 'giovanni.dellelenti@gmail.com',
      subject: 'Hai pubblicato un nuovo post!',
      text: `Ciao ${foundAuthor.name}, hai appena pubblicato il post: "${title}".`,
      html: `<p> Ciao <strong>${foundAuthor.name}</strong>!<br>
      Hai appena pubblicato il tuo post: <em>${title}</em>.<br>
      Grazie per aver contribuito al nostro blog!</p>`,
    });

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: 'Errore nella creazione del post', error: error.message });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: 'Errore nella modifica del post', error: error.message });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post non trovato' });
    res.status(204).json({ message: "Cancellazione avvenuta!" });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella cancellazione del post' });
  }
});

// PATCH update post cover image
router.patch('/:id/cover', cloudinaryUploader.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File mancante o malformato" })
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { cover: req.file.path },
      { new: true }
    )

    res.status(200).json(updatedPost)
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il caricamento della cover', error: error.message })
  }
})


// =========================
// END POINT PER I COMMENTI
// =========================

// GET all comments with pagination and filtering
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const post = await BlogPost.findById(req.params.id).populate('comments.author');

    if (!post) return res.status(404).json({ message: 'Post non trovato' });

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);

    const paginatedComments = post.comments.slice(startIndex, endIndex);

    res.json({
      total: post.comments.length,
      page: parseInt(page),
      limit: parseInt(limit),
      comments: paginatedComments,
    });

  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero dei commenti', error: error.message });
  }
});

// GET single comment
router.get('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('comments.author');
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commento non trovato' });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero del commento', error: error.message });
  }
});

// POST new comment
router.post('/:id/comments', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    post.comments.push(req.body);
    await post.save();
    res.status(201).json({ message: "Commento aggiunto con successo!" });
  } catch (error) {
    res.status(400).json({ message: 'Errore nell\'aggiunta del commento', error: error.message });
  }
});

// PUT update comment
router.put('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commento non trovato' });
    comment.set(req.body);
    await post.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Errore nella modifica del commento', error: error.message });
  }
});

// DELETE comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commento non trovato' });
    comment.remove();
    await post.save();
    res.status(204).json({ message: "Cancellazione avvenuta!" });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella cancellazione del commento', error: error.message });
  }
});

export default router;
