import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
    default: "",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PageContent', pageContentSchema);