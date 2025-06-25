import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser' }
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

