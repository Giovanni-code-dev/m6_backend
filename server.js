import express from 'express';
import 'dotenv/config';
import db from './db.js';
import cors from 'cors';
import authorsRouter from './routes/author.route.js';
import blogPostsRouter from './routes/blogPost.route.js';
import authRouter from './routes/auth.route.js'

import emailRouter from './routes/email.route.js';

import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// imposto app express
const app = express();

// Inizializzo connessione a Mongo DB
db();

// middleware per abilitare chiamate ajax
app.use(cors({ origin: '*' }));

app.use(express.urlencoded({ extended: true })) //  NECESSARIO per multipart/form-data

app.use(express.json()); // Metodo far rispondere il server in formato JSON 

// Middleware globale per forzare il Content-Type a JSON
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
//esempio 
app.post('/', (req, res) => {

    console.log(req.body)

    if (req.body.cognome) {
        req.body.cognome = "fucchi"
    }
    req.body.acqua = "amara"

    if (req.body.number){

        req.body.number = parseInt(req.body.number)+ 10

    }

    res.json(req.body);

});


// Route per gli autori
app.use('/authors', authorsRouter);

// Route per i posts
app.use('/blog', blogPostsRouter);

app.use('/login', authRouter)

// Route per invio email con sendgrid

app.use('/send-email', emailRouter);


app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});

