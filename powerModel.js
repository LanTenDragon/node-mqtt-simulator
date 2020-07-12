const mongoose = require('mongoose')
const Schema = mongoose.Schema

const powerSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  belongsTo: { type: Schema.Types.ObjectId, ref: 'socket' }
})

module.exports = mongoose.model('Power', powerSchema)

