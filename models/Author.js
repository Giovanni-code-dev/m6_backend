import { Schema, model } from "mongoose"

const authorSchema = new Schema(
  {
    nome: {
        type: String,
        required: true
    },
    cognome: {
        type: String ,
        required: true

    },
    email: {
        type: String ,
        required: true,
        unique: true

    }, 
    data_di_nascita: {
        type: String,
        required: true

    },
    avatar: {
        type: String,
        required: false

    }
  }

)

export default model("Author", authorSchema)
