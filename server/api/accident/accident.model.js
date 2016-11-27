'use strict';

import mongoose from 'mongoose';

var mediaSchema = mongoose.Schema({
  name: String,
  path: String,
  type: String,
  uploadDate: {
    type: Date,
    default: Date.now},
});

var reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  saverity: {
    type: Number,
    min: 0,
    max: 5
  },
  reviewText: {
    type: String,
    required: false
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  medias: [mediaSchema]
});

var AccidentSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  name: String,
  address: String,
  coords: {
    type: [Number],
    index: '2dsphere'
  },
  reviews: [reviewSchema],
  active: Boolean
});

export default mongoose.model('Accident', AccidentSchema);
