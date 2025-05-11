import createHttpError from "http-errors"
import { verifyAccessToken } from "./tools.js"

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(createHttpError(401, "Token mancante"))
  }

  const token = req.headers.authorization.replace("Bearer ", "")
  try {
    const payload = await verifyAccessToken(token)

    // 👉 req.user include _id e role
    req.user = {
      _id: payload._id,
      role: payload.role || "user",
    }

    next()
  } catch (error) {
    next(createHttpError(401, "Token non valido o scaduto"))
  }
}
