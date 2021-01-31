const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coinPriceSchema = new Schema({
  currency: { type: String, required: true },
  date: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required:true },
  volume: { type: Number, required:true },
  marketCap: { type: Number, required:false },
}, {
  timestamps: true,
});

const CoinPrice = mongoose.model('CoinPrice', coinPriceSchema);
module.exports = CoinPrice;