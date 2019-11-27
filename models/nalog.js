const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const nalogSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  duguje: {
      type: Number,
      required:true
    },
  potrazuje: {
    type: Number,
    required:true
  },
  year: 
    {
    type: Number,
    required: true
  }
, date: {
    type: Date,
    required: true
},
  opis: {
    type: String,
    required: true
  },
  locked: {
      type: Boolean,
      required: true
  },
  stavovi: [
    {
       stav: {
            type: Schema.Types.ObjectId,
            ref: "Stav",
            required: true
        }
    }
  ],  
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
});

module.exports = mongoose.model("Nalog", nalogSchema);
