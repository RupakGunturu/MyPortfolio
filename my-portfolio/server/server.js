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
import { check } from 'express-validator';
import jwt from 'jsonwebtoken';

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

// -------------------- Schemas & Models --------------------

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  contentType: { type: String },
  url: { type: String }
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

const skillSchema = new mongoose.Schema({
  title: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  }
});
const Skill = mongoose.model("Skill", skillSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });
const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

const aboutSchema = new mongoose.Schema({
  data: { type: Object, default: {} }
});
const About = mongoose.model("About", aboutSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  bio: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  techStackMessage: { type: String, default: "Currently working with React & Next.js" }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// --- Mongoose Model (inline) ---
const experienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

// Define Routes

// ---- Skills ----
app.post('/api/skill', auth, async (req, res) => {
  try {
    const newSkill = new Skill({
      title: req.body.title,
      level: req.body.level || 'intermediate'
    });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/skill", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/skill/:id', auth, async (req, res) => {
  console.log('DELETE request to /api/skill/:id', req.params.id);

  try {
    const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
    if (!deletedSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.status(200).json({ message: 'Deleted', skill: deletedSkill });
  } catch (err) {
    console.error('Error during deletion:', err);
    res.status(500).json({ message: 'Error deleting skill' });
  }
});


// ---- User ----

// Get user (single)
app.get("/api/user", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user || { name: "", bio: "", imageUrl: "", techStackMessage: "Currently working with React & Next.js" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user with optional user image upload (disk)
app.put("/api/user", auth, uploadUserImage.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, bio, techStackMessage } = req.body;
    let finalImageUrl;

    if (req.file) {
      // Save relative path to serve static image
      finalImageUrl = `/uploads/${req.file.filename}`;
      console.log("New image URL:", finalImageUrl);
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(techStackMessage !== undefined && { techStackMessage }),
      ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
    };

    console.log("Update data:", updateData);

    // Only update the user whose id matches the JWT
    const updated = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ error: 'User not found or not authorized' });
    }

    console.log("Updated user:", updated);
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/user error:", err);
    res.status(500).json({ 
      error: err.message,
      details: "Image upload failed. Please check server logs."
    });
  }
});

// ---- Certificates ----

// Upload certificate with file saved in GridFS
app.post('/api/certificates', auth, uploadCertificate.single('file'), async (req, res) => {
  console.log('--- /api/certificates POST called ---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const { title, issuer, date } = req.body;
    const file = req.file;

    if (!title || !issuer || !date || !file) {
      console.error('Missing required fields:', { title, issuer, date, file });
      return res.status(400).json({ 
        error: 'Title, issuer, date, and file are all required',
        debug: { title, issuer, date, file }
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
          url: `/api/certificates/file/${uploadStream.id}`
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

// Get all certificates
app.get('/api/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    
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
app.delete('/api/certificates/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const certificateId = new mongoose.Types.ObjectId(req.params.id);
    
    // Find the certificate to get the fileId
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
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

// Get about data (singleton)
app.get("/api/about", async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about ? about.data : {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update about data (singleton)
app.put("/api/about", auth, async (req, res) => {
  try {
    const data = req.body;
    const updated = await About.findOneAndUpdate({}, { data }, { upsert: true, new: true });
    res.json(updated.data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- Contact ----
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ success: true, message: 'Message received!', data: newContact });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// --- API Endpoints ---

// Get all experiences
app.get('/api/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ date: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experiences", error: error.message });
  }
});

// Add a new experience
app.post('/api/experiences', auth, async (req, res) => {
  try {
    const { iconType, date, title, company, description } = req.body;
    if (!date || !title || !company || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const validIconTypes = ['briefcase', 'code', 'graduation'];
    if (!validIconTypes.includes(iconType)) {
      return res.status(400).json({ message: "Invalid iconType" });
    }
    const newExp = new Experience({ iconType, date, title, company, description, user: req.user.id });
    await newExp.save();
    res.status(201).json(newExp);
  } catch (error) {
    res.status(400).json({ message: "Failed to add experience", error: error.message });
  }
});

// Delete an experience by ID
app.delete('/api/experiences/:id', auth, async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    if (exp.user.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    await exp.deleteOne();
    res.json({ message: "Deleted", deleted: exp });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete experience", error: error.message });
  }
});

// Bulk update experiences (replace all)
app.put('/api/experiences', auth, async (req, res) => {
  try {
    const { experiences } = req.body;
    if (!Array.isArray(experiences)) {
      return res.status(400).json({ message: "Experiences must be an array" });
    }
    // Remove all experiences for this user
    await Experience.deleteMany({ user: req.user.id });
    // Insert new experiences for this user
    const toInsert = experiences.map(exp => ({ ...exp, user: req.user.id }));
    const savedExperiences = await Experience.insertMany(toInsert);
    res.json(savedExperiences);
  } catch (error) {
    res.status(400).json({ message: "Failed to bulk update experiences", error: error.message });
  }
});

// ---- Projects ----

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String, default: "" }
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
});

// Add a new project
app.post("/api/projects", async (req, res) => {
  try {
    const { name, link, image } = req.body;
    
    // Validate required fields
    if (!name || !link) {
      return res.status(400).json({ message: "Name and link are required" });
    }

    // Validate image size if provided (base64 images can be large)
    if (image && image.length > 50 * 1024 * 1024) { // 50MB limit
      return res.status(413).json({ 
        message: "Image file is too large. Please use a smaller image (max 50MB)." 
      });
    }

    const newProject = new Project({ 
      name, 
      link, 
      image: image || "https://via.placeholder.com/400x300?text=Project+Preview" 
    });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(400).json({ message: "Failed to add project", error: error.message });
  }
});

// Delete a project by ID
app.delete("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.user.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    await project.deleteOne();
    res.json({ message: "Deleted", deleted: project });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
});

// Update a project by ID
app.put("/api/projects/:id", auth, async (req, res) => {
  try {
    const { name, link, image } = req.body;
    if (!name || !link) {
      return res.status(400).json({ message: "Name and link are required" });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.user.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    project.name = name;
    project.link = link;
    project.image = image;
    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
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
  registerUser
);

app.post(
  '/api/auth/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// --- Project Routes ---
app.get('/api/projects', getProjects);

// --- Certificate Routes ---
const certificates = []; // Placeholder
app.get('/api/certificates', (req, res) => {
  res.json(certificates);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// --- Middleware ---
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

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
app.get('/api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// -------------------- Connect to MongoDB & Start Server --------------------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((e) => {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  });