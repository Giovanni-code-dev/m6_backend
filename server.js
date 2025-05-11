// const express = require('express');
import express from 'express';
import 'dotenv/config';
import db from './db.js';
//import Author from './models/Author.js';
import cors from 'cors';
import authorsRouter from './routes/author.route.js';
import blogPostsRouter from './routes/blogPost.route.js';
import authRouter from './routes/auth.route.js'

//import sgMail from('@sendgrid/mail') //importo sandgrid
//sgMail.setApiKey(process.env.SENDGRID_APY_KEY)


// imposto app express
const app = express();

// Inizializzo connessione a Mongo DB
db();

// middleware per abilitare chiamate ajax
app.use(cors());
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


/*
// Route per invio email con sendgrid
app.get('/send-email', async (req, res) => {
    
    console.log('/send-email');
    res.status(200).json({message: "Email inviata con successo!!!"})
    
    const msg = {
        to: 'test@example.com', // A chi voglio inviare 
        from: 'giovanni.dellelenti@gmail.com', // Nostra mail
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      }
      try {
      await sgMail.send(msg)
        .then((response) => {
          console.log(response[0].statusCode)
          console.log(response[0].headers)
          return res.status(response[0].statusCode).json({...response[0]})
        })
        .catch((error) => {
          console.error(error)
          return res.status(500).json({...error})
        })
    } catch(error) {
        console.error(error)
        return res.status(response[0].statusCode).json({...error})
    }
})
*/
app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});
