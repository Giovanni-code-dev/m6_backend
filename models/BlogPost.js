import { Schema, model } from "mongoose"

// Schema embedded per i commenti
const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
}, {
  timestamps: true // Data creazione e modifica commento
})

// Schema principale per i blog post
const blogsSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: false,
  },
  readTime: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Author", // riferimento alla collection 
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  comments: [commentSchema], // Commenti embedded
}, {
  collection: "blogs",
  timestamps: true // Data creazione e modifica post
})

export default model("Blog", blogsSchema)
