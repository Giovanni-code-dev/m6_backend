import express from 'express';
import createHttpError from "http-errors"
import Author from '../models/Author.js';
import { createAccessToken } from "../lib/tools.js";
import { JWTAuthMiddleware } from "../lib/middlewares.js";
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client(process.env.GOOGLE_ID_CLIENT);

const router = express.Router();

//  POST /login
router.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await Author.checkCredentials(email, password)
    if (!user) return next(createHttpError(401, "Credenziali non valide"))

    // 👉 Payload con _id e role
    const token = await createAccessToken({
      _id: user._id,
      role: user.role || "user", // default "user"
    })

    res.send({ accessToken: token })
  } catch (error) {
    next(error)
  }
})

//  GET /login/me
router.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await Author.findById(req.user._id)
    if (!user) return next(createHttpError(404, "Utente non trovato"))
    res.send(user)
  } catch (error) {
    next(error)
  }
})

router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_ID_CLIENT,
  });
  const payload = ticket.getPayload();
  // payload.sub, payload.email, payload.name, payload.picture
  // Qui crei/verifichi utente e rispondi con il tuo token

  const userEmail = payload.email;
  const user = await Author.getIdByEmail(userEmail)

  const token = await createAccessToken({
    _id: user._id,
    role: user.role || "user", // default "user"

  })

  //res.send({ accessToken: token })
  
  res.send({ accessToken: token, success: true, user: payload });
});

export default router; 
