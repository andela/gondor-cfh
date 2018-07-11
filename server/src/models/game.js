import mongoose from 'mongoose';

const { Schema } = mongoose;

// Game Schema
const GameSchema = new Schema({
  gameId: {
    type: Number,
  },
  players: [],
  winner: {
    type: String
  },
  rounds: {
    type: Number
  },
}, { timestamps: true });

export default mongoose.model('Game', GameSchema);
