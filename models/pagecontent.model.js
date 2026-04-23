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
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PageContent', pageContentSchema);