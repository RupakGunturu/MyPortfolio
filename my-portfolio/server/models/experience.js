import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  iconType: {
    type: String,
    enum: ['briefcase', 'code', 'graduation'],
    default: 'briefcase'
  },
  date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience; 