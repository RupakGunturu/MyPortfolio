import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GridFSBucket } from "mongodb";
import fs from "fs";
import connectDB from './config/db.js';
import { getProjects } from './controllers/projectController.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import registerRoute from './routes/register.js';
import bcrypt from 'bcryptjs';
import RegisteredUser from './models/registeredUser.js';
import Project from './models/project.js';
import transporter from './utils/mailer.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_images',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const cloudinaryParser = multer({ storage: cloudinaryStorage });

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

dotenv.config();

// Connect to database
connectDB();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 9000;

// Set JWT_SECRET
process.env.JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-a-dotenv-file';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure required directories exist
[path.join(__dirname, "uploads"), path.join(__dirname, "images")].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve uploaded user images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve images folder statically with 404 handling
app.use("/images", express.static(path.join(__dirname, "images")), (req, res) => {
  res.status(404).end();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// Error handling middleware for payload too large
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413) {
    return res.status(413).json({ 
      error: 'Payload too large', 
      message: 'The image file is too large. Please use a smaller image (max 50MB).' 
    });
  }
  
  // Handle raw-body errors
  if (err.message && err.message.includes('request entity too large')) {
    return res.status(413).json({ 
      error: 'Payload too large', 
      message: 'The image file is too large. Please use a smaller image (max 50MB).' 
    });
  }
  
  next(err);
});

// -------------------- Multer Setup --------------------

// Multer for certificates — memory storage for GridFS
const multerMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Multer for user image uploads — disk storage
const uploadUserImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multer for certificate uploads — use memory storage for GridFS
const uploadCertificate = multerMemory;

// Multer setup for registered user profile updates
const uploadRegisteredUser = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// -------------------- Schemas & Models --------------------

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  contentType: { type: String },
  url: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', required: true }
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

const skillSchema = new mongoose.Schema({
  title: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', required: true }
});
const Skill = mongoose.model("Skill", skillSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', required: false }
}, { timestamps: true });
const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

const aboutSchema = new mongoose.Schema({
  data: { type: Object, default: {} },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', required: true, unique: true }
});
const About = mongoose.model("About", aboutSchema);

// --- Mongoose Model (inline) ---
const experienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisteredUser', required: true },
  iconType: { type: String, required: true, enum: ['briefcase', 'code', 'graduation'] },
  date: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
});

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);

// -------------------- Routes --------------------

// Basic test route
app.get("/", (req, res) => res.send("✅ Server is running"));

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const userCount = await RegisteredUser.countDocuments();
    res.json({ 
      message: "Database connection successful", 
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: error.message 
    });
  }
});

// Test user update endpoint
app.post("/api/test-update", async (req, res) => {
  try {
    const { userId, fullname, githubUrl, linkedinUrl } = req.body;
    console.log("Test update request:", { userId, fullname, githubUrl, linkedinUrl });
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const updateData = {
      fullname: fullname || "Test User",
      githubUrl: githubUrl || "",
      linkedinUrl: linkedinUrl || ""
    };
    
    console.log("Test update data:", updateData);
    
    const updated = await RegisteredUser.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log("Test update successful:", updated);
    res.json({ 
      message: "Test update successful", 
      user: {
        _id: updated._id,
        fullname: updated.fullname,
        githubUrl: updated.githubUrl,
        linkedinUrl: updated.linkedinUrl
      }
    });
  } catch (error) {
    console.error("Test update error:", error);
    res.status(500).json({ 
      error: "Test update failed", 
      details: error.message 
    });
  }
});

// List all users (for testing - shows each user has unique data)
app.get("/api/all-users", async (req, res) => {
  try {
    const users = await RegisteredUser.find({}, 'fullname username githubUrl linkedinUrl email');
    res.json({
      message: "All users with their unique profiles",
      userCount: users.length,
      users: users.map(user => ({
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        email: user.email
      }))
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ 
      error: "Failed to fetch users", 
      details: error.message 
    });
  }
});

// Define Routes

// ---- Skills ----

// Get all skills for a specific user
app.get("/api/skills", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const skills = await Skill.find({ user: userId }).sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch skills", error: error.message });
  }
});

// Add a new skill
app.post("/api/skills", async (req, res) => {
  try {
    const { title, level, userId } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ message: "Title and userId are required" });
    }
    const newSkill = new Skill({ title, level, user: userId });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: "Failed to add skill", error: error.message });
  }
});

// Update a skill
app.put("/api/skills/:id", async (req, res) => {
  try {
    const { title, level, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Check if the skill belongs to the user
    if (skill.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this skill' });
    }
    
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      { title, level },
      { new: true }
    );
    res.json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: "Failed to update skill", error: error.message });
  }
});

// Delete a skill
app.delete("/api/skills/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Check if the skill belongs to the user
    if (skill.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this skill' });
    }
    
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete skill", error: error.message });
  }
});

// ---- User ----

// Get user (by userId)
app.get("/api/user", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const user = await RegisteredUser.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cloudinary-based profile image upload route for registered_users
app.put('/api/registered_user', uploadRegisteredUser.single('image'), async (req, res) => {
  try {
    console.log('PUT /api/registered_user called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File received' : 'No file');
    
    const { userId, fullname, githubUrl, linkedinUrl } = req.body;
    
    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const updateFields = { fullname, githubUrl, linkedinUrl };
    
    if (req.file) {
      console.log('Processing file upload to Cloudinary:', req.file.originalname);
      
      // Upload the file buffer to Cloudinary
      const stream = cloudinary.uploader.upload_stream({
        folder: 'profile_images',
        resource_type: 'image',
      }, async (error, result) => {
        if (error) {
          console.error('Cloudinary upload failed:', error);
          return res.status(500).json({ error: 'Cloudinary upload failed', details: error.message });
        }
        
        console.log('Cloudinary upload successful:', result.secure_url);
        updateFields.imageUrl = result.secure_url;
        
        try {
          const updatedUser = await RegisteredUser.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
          );
          
          if (!updatedUser) {
            console.log('User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
          }
          
          console.log('User updated successfully:', updatedUser._id);
          res.json(updatedUser);
        } catch (dbError) {
          console.error('Database update error:', dbError);
          res.status(500).json({ error: 'Database update failed', details: dbError.message });
        }
      });
      
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    } else {
      console.log('No file uploaded, updating other fields only');
      
      try {
        const updatedUser = await RegisteredUser.findByIdAndUpdate(
          userId,
          updateFields,
          { new: true }
        );
        
        if (!updatedUser) {
          console.log('User not found:', userId);
          return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User updated successfully (no image):', updatedUser._id);
        res.json(updatedUser);
      } catch (dbError) {
        console.error('Database update error:', dbError);
        res.status(500).json({ error: 'Database update failed', details: dbError.message });
      }
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ---- Certificates ----

// Upload certificate with file saved in GridFS
app.post('/api/certificates', uploadCertificate.single('file'), async (req, res) => {
  console.log('--- /api/certificates POST called ---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const { title, issuer, date, userId } = req.body;
    const file = req.file;

    if (!title || !issuer || !date || !file || !userId) {
      console.error('Missing required fields:', { title, issuer, date, file, userId });
      return res.status(400).json({ 
        error: 'Title, issuer, date, file, and userId are all required',
        debug: { title, issuer, date, file, userId }
      });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'certificates'
    });

    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: { title, issuer, date: new Date(date) }
    });

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      return res.status(500).json({ error: 'File upload failed', debug: error.message });
    });

    uploadStream.on('finish', async () => {
      try {
        const newCert = await Certificate.create({
          title,
          issuer,
          date: new Date(date),
          fileId: uploadStream.id,
          filename: uploadStream.filename,
          contentType: file.mimetype,
          url: `/api/certificates/file/${uploadStream.id}`,
          user: userId
        });

        res.status(201).json({
          message: 'Certificate uploaded successfully',
          certificate: {
            _id: newCert._id,
            title: newCert.title,
            issuer: newCert.issuer,
            date: newCert.date.toISOString().split('T')[0],
            filename: newCert.filename,
            url: newCert.url,
            createdAt: newCert.createdAt
          }
        });
      } catch (error) {
        console.error('Database save error:', error);
        res.status(500).json({ error: 'Failed to save certificate record', debug: error.message });
      }
    });

    uploadStream.end(file.buffer);

  } catch (error) {
    console.error('Certificate upload error:', error);
    res.status(500).json({ error: 'Internal server error', debug: error.message });
  }
});

// Get all certificates for a specific user
app.get('/api/certificates', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const certificates = await Certificate.find({ user: userId }).sort({ createdAt: -1 });
    
    const result = certificates.map(cert => ({
      _id: cert._id,
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date.toISOString().split('T')[0],
      filename: cert.filename,
      url: cert.url,
      contentType: cert.contentType,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Download certificate file
app.get('/api/certificates/file/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid file ID');
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'certificates'
    });

    // First check if file exists in GridFS
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).send('File not found');
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(fileId);

    // Set proper headers
    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    // Stream the file to the client
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download stream error:', error);
      res.status(500).send('Error streaming file');
    });

  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Internal server error');
  }
});

// Delete certificate
app.delete('/api/certificates/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const certificateId = new mongoose.Types.ObjectId(req.params.id);
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Find the certificate to get the fileId and check ownership
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    // Check if the certificate belongs to the user
    if (certificate.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this certificate' });
    }

    // Delete from GridFS if file exists
    if (certificate.fileId) {
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'certificates'
      });
      
      try {
        await bucket.delete(certificate.fileId);
      } catch (error) {
        console.log('No file to delete in GridFS');
      }
    }

    // Delete the certificate record
    await Certificate.deleteOne({ _id: certificateId });

    res.json({ 
      success: true, 
      message: 'Certificate deleted successfully',
      deletedId: certificateId
    });

  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Error deleting certificate' });
  }
});

// ---- About ----

// Get about data for a specific user
app.get("/api/about", async (req, res) => {
  const { userId } = req.query;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid or missing userId' });
  }
  try {
    const about = await About.findOne({ user: userId });
    if (!about) {
      return res.json({ data: {} });
    }
    res.json({ data: about.data || {} });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch about", error: error.message });
  }
});

// Update about data (singleton)
app.put("/api/about", async (req, res) => {
  try {
    const { data, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    let about = await About.findOne({ user: userId });
    if (about) {
      about.data = { ...data }; // flatten, don't nest
      await about.save();
    } else {
      about = new About({ data: { ...data }, user: userId });
      await about.save();
    }
    res.json({ data: about.data });
  } catch (error) {
    res.status(400).json({ message: "Failed to update about", error: error.message });
  }
});

// ---- Contact ----
app.post("/api/contact", async (req, res) => {
  console.log("[CONTACT] POST /api/contact body:", req.body); // Debug log
  try {
    const { name, email, message, userId } = req.body;
    if (!name || !email || !message || !userId) {
      return res.status(400).json({ message: "Name, email, message, and userId are required" });
    }
    const contactData = { name, email, message, user: userId };
    // Look up the user's email
    const user = await RegisteredUser.findById(userId);
    if (!user || !user.email) {
      return res.status(400).json({ message: "Portfolio owner not found or missing email." });
    }
    const destinationEmail = user.email;
    const newContact = new Contact(contactData);
    await newContact.save();

    // Send email to the portfolio owner
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: destinationEmail,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`
    });

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to submit contact form", error: error.message });
  }
});

// Get contact messages for a specific user (if they have any)
app.get("/api/contact", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const contacts = await Contact.find({ user: userId }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contact messages", error: error.message });
  }
});

// --- API Endpoints ---

// Get all experiences
app.get('/api/experiences', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const experiences = await Experience.find({ user: userId }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experiences", error: error.message });
  }
});

// Add a new experience
app.post('/api/experiences', async (req, res) => {
  try {
    const { iconType, date, title, company, description, userId } = req.body;
    if (!date || !title || !company || !description || !userId) {
      return res.status(400).json({ message: "All fields including userId are required" });
    }
    const validIconTypes = ['briefcase', 'code', 'graduation'];
    if (!validIconTypes.includes(iconType)) {
      return res.status(400).json({ message: "Invalid iconType" });
    }
    const newExp = new Experience({ iconType, date, title, company, description, user: userId });
    await newExp.save();
    res.status(201).json(newExp);
  } catch (error) {
    res.status(400).json({ message: "Failed to add experience", error: error.message });
  }
});

// Delete an experience by ID
app.delete('/api/experiences/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    // Check if the experience belongs to the user
    if (experience.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this experience' });
    }
    
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete experience", error: error.message });
  }
});

// Bulk update experiences (replace all)
app.put('/api/experiences', async (req, res) => {
  try {
    const { experiences, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!Array.isArray(experiences)) {
      return res.status(400).json({ message: 'Experiences must be an array' });
    }

    // Validate each experience
    for (const exp of experiences) {
      if (!exp.date || !exp.title || !exp.company || !exp.description) {
        return res.status(400).json({ 
          message: 'All fields (date, title, company, description) are required for each experience' 
        });
      }
      
      const validIconTypes = ['briefcase', 'code', 'graduation'];
      if (!validIconTypes.includes(exp.iconType)) {
        return res.status(400).json({ 
          message: 'Invalid iconType. Must be one of: briefcase, code, graduation' 
        });
      }
    }

    // Delete all existing experiences for this user
    await Experience.deleteMany({ user: userId });
    
    // Insert new experiences with user ID
    const experiencesWithUser = experiences.map(exp => ({ ...exp, user: userId }));
    const savedExperiences = await Experience.insertMany(experiencesWithUser);
    
    res.json(savedExperiences);
  } catch (error) {
    res.status(400).json({ message: "Failed to bulk update experiences", error: error.message });
  }
});

// ---- Projects ----

// Get all projects for a specific user
app.get("/api/projects", async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Fetching projects for userId:', userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
    console.log('Found projects:', projects.length, 'for user:', userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
});

// Add a new project
app.post("/api/projects", async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    const { title, description, image, file, link, userId } = req.body;
    if (!title || !description || !userId) {
      return res.status(400).json({ message: "Title, description, and userId are required" });
    }
    const newProject = new Project({ title, description, image, file, link, user: userId });
    await newProject.save();
    console.log('Project created successfully:', newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ message: "Failed to add project", error: error.message });
  }
});

// Delete a project by ID
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Deleting project:', req.params.id, 'for user:', userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log('Found project:', project.title, 'belongs to user:', project.user.toString());
    
    // Check if the project belongs to the user
    if (project.user.toString() !== userId) {
      console.log('Authorization failed: project user', project.user.toString(), '!= requested user', userId);
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }
    
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    console.log('Project deleted successfully:', deletedProject.title);
    res.json({ message: "Project deleted successfully", deletedProject });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(400).json({ message: "Failed to delete project", error: error.message });
  }
});

// Update a project by ID
app.put("/api/projects/:id", async (req, res) => {
  try {
    const { title, description, image, file, link, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if the project belongs to the user
    if (project.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, image, file, link },
      { new: true }
    );
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: "Failed to update project", error: error.message });
  }
});

// --- Auth Routes ---
app.post(
  '/api/auth/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('username', 'A unique username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  (req, res) => registerUser(req, res, RegisteredUser)
);

app.post(
  '/api/auth/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res) => loginUser(req, res, RegisteredUser)
);

// --- Project Routes ---
// This route is commented out as it conflicts with the user-specific projects route above
// app.get('/api/projects', getProjects);

// --- Certificate Routes ---
const certificates = []; // Placeholder
app.get('/api/certificates', (req, res) => {
  res.json(certificates);
});

// --- Registered User Count Endpoint ---
app.get('/api/user-count', async (req, res) => {
  try {
    const count = await RegisteredUser.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
app.get('/api/auth', async (req, res) => {
  try {
    const user = await RegisteredUser.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Register Route ---
// Register all /api routes (including Cloudinary image upload)
app.use('/api', registerRoute);

// Registration route
app.post(
  '/api/register',
  [
    check('fullname', 'Full name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullname, username, email, password } = req.body;
    try {
      let user = await RegisteredUser.findOne({ $or: [{ username }, { email }] });
      if (user) {
        return res.status(400).json({ msg: 'Username or email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new RegisteredUser({ fullname, username, email, password: hashedPassword });
      await user.save();
      // JWT token
      const payload = { user: { id: user._id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
      res.status(201).json({ 
        msg: 'Registration successful', 
        token, 
        user: { 
          _id: user._id,
          fullname, 
          username, 
          email 
        } 
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ msg: 'Username or email already exists' });
      }
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  }
);

// Registered user count route
app.get('/api/register/count', async (req, res) => {
  try {
    const count = await RegisteredUser.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user count', error: err.message });
  }
});

// Login route for registered_users
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegisteredUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // JWT token
    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
    res.json({ 
      msg: 'Login successful', 
      token, 
      user: { 
        _id: user._id,
        fullname: user.fullname, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// --- Portfolio Route ---
app.get('/api/portfolio/:username', async (req, res) => {
  const { username } = req.params;
  const user = await RegisteredUser.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  // Flatten the user object for the frontend
  res.json({
    name: user.fullname,
    imageUrl: user.imageUrl,
    bio: user.bio,
    techStackMessage: user.techStackMessage,
    githubUrl: user.githubUrl,
    linkedinUrl: user.linkedinUrl,
    // Add other fields as needed
  });
});

// GET /api/users/username/:username (case-insensitive)
app.get('/api/users/username/:username', async (req, res) => {
  console.log('Username param:', req.params.username);
  try {
    const user = await RegisteredUser.findOne({
      username: { $regex: `^${req.params.username}$`, $options: 'i' }
    });
    console.log('User found:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Test Cloudinary upload route
app.post('/api/test-upload', async (req, res) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
      { public_id: 'shoes' }
    );
    res.json({ url: uploadResult.secure_url, result: uploadResult });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// -------------------- Connect to MongoDB & Start Server --------------------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB 🚀");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });
