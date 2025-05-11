import createHttpError from "http-errors"
import { verifyAccessToken } from "./tools.js"

// Middleware: verifica token JWT
export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Token mancante. Inserisci un token Bearer nell'header."))
  } else {
    const token = req.headers.authorization.replace("Bearer ", "")
    try {
      const payload = await verifyAccessToken(token)
      req.user = { _id: payload._id, role: payload.role }
      next()
    } catch (error) {
      console.log(error)
      next(createHttpError(401, "Token non valido. Fai login di nuovo."))
    }
  }
}

// Middleware: consenti solo agli admin
export const adminOnly = (req, res, next) => {
  if (req.user.role === "admin") {
    next()
  } else {
    next(createHttpError(403, "Accesso riservato agli admin."))
  }
}
