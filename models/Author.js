import { Schema, model } from "mongoose"
import bcrypt from "bcrypt"

const authorSchema = new Schema(
  {
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    data_di_nascita: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true, collection: "authors" }
)

// Middleware che hash la password prima del salvataggio
authorSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashed = await bcrypt.hash(this.password, 10)
    this.password = hashed
  }
})

// Rimozione campi sensibili dalla risposta JSON
authorSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.__v
  delete user.createdAt
  delete user.updatedAt
  return user
}

// Metodo statico per verificare email + password (login)
authorSchema.statics.checkCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email })
  if (!user) return null

  const match = await bcrypt.compare(plainPW, user.password)
  return match ? user : null
}

export default model("Author", authorSchema)
