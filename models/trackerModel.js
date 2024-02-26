const mongoose = require('mongoose');

const trackerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'foods',
      required: true,
    },
    details: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number,
    },
    eatenDate: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestampes: true }
);

const trackerModel = mongoose.model('trackers', trackerSchema);

module.exports = trackerModel;
