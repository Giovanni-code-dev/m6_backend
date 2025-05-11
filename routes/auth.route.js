import express from 'express';
import createHttpError from "http-errors"
import Author from '../models/Author.js';
import { createAccessToken } from "../lib/tools.js"
import { JWTAuthMiddleware } from "../lib/middlewares.js"


const router = express.Router();


// 🔐 POST /login
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

// 👤 GET /login/me
router.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await Author.findById(req.user._id)
    if (!user) return next(createHttpError(404, "Utente non trovato"))
    res.send(user)
  } catch (error) {
    next(error)
  }
})



export default router; 
