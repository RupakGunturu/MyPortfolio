import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GridFSBucket } from "mongodb";
import fs from "fs";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// -------------------- Multer Setup --------------------

// Multer for certificates — memory storage for GridFS
const multerMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
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

// Serve uploaded user images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Schemas & Models --------------------

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  fileId: mongoose.ObjectId,
  filename: String,
  imageUrl: String
}, { timestamps: true });
const Certificate = mongoose.model("Certificate", certificateSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  bio: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});
const User = mongoose.model("User", userSchema);

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
const Experience = mongoose.model("Experience", experienceSchema);

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
const Contact = mongoose.model("Contact", contactSchema);

const aboutSchema = new mongoose.Schema({
  data: { type: Object, default: {} }
});
const About = mongoose.model("About", aboutSchema);

// -------------------- Certificate Images for Random Assignment --------------------

const certImages = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLFZBG2PYmWOT81iUFfesPYTJVg7rNe2YIM9FXjX-Vlj_FkLH54MBzc9eLIBMQbuUMIo&usqp=CAU',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Nh9l0oOTzpzuUsqi6jxT3txXjD2bTUagBascKyzzWFMvyuW7Z0QOT650oDLDIclHmDQ&usqp=CAU',
  'https://miro.medium.com/v2/resize:fit:1358/0*2ApW5OWboyV571oB.png',
  'https://www.deliveryhero.com/wp-content/uploads/2021/04/DH_Blog_Header_WomenInTech_2000x1100px_2_Blue-1200x660.png'
];

// -------------------- Routes --------------------

// Basic test route
app.get("/", (req, res) => res.send("✅ Server is running"));

// ---- Skills ----
app.post('/api/skill', async (req, res) => {
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

// ---- User ----

// Get user (single)
app.get("/api/user", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user || { name: "", bio: "", imageUrl: "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user with optional user image upload (disk)
app.put("/api/user", uploadUserImage.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, bio, imageUrl } = req.body;
    let finalImageUrl = imageUrl;

    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
      console.log("New image URL:", finalImageUrl);
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
    };

    console.log("Update data:", updateData);

    const updated = await User.findOneAndUpdate({}, updateData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });

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

// ---- Experience ----
app.get("/api/experience", async (req, res) => {
  try {
    const ex = await Experience.find();
    res.json(ex);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Certificates ----

// Upload certificate with file saved in GridFS
app.post("/api/certificates", multerMemory.single("certificate"), async (req, res) => {
  try {
    const { title, issuer, date } = req.body;
    if (!title || !issuer || !date) {
      return res.status(400).json({ error: "Missing title, issuer or date" });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "certificates" });

    let fileId = null;
    let filename = null;

    if (req.file) {
      const uploadStream = bucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        { metadata: { title, issuer } }
      );

      const streamFinished = new Promise((resolve, reject) => {
        uploadStream.on("finish", () => {
          fileId = uploadStream.id;
          filename = uploadStream.filename;
          resolve();
        });
        uploadStream.on("error", reject);
      });

      uploadStream.end(req.file.buffer);
      await streamFinished;
    }

    // Assign random image URL to certificate
    const randomImage = certImages[Math.floor(Math.random() * certImages.length)];

    const newCert = await Certificate.create({
      title,
      issuer,
      date: new Date(date),
      fileId,
      filename,
      imageUrl: randomImage
    });

    res.status(201).json({
      ...newCert.toObject(),
      fileUrl: fileId ? `/api/certificates/file/${fileId}` : null
    });
  } catch (error) {
    console.error("POST /api/certificates error:", error);
    res.status(500).json({ error: error.message });
  }
});

// List all certificates
app.get("/api/certificates", async (req, res) => {
  try {
    const list = await Certificate.find().sort({ createdAt: -1 });
    res.json(
      list.map(c => ({
        ...c.toObject(),
        date: c.date.toISOString().split("T")[0],
        fileUrl: c.fileId ? `/api/certificates/file/${c.fileId}` : null
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve certificate PDF from GridFS
app.get("/api/certificates/file/:id", (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "certificates" });
    const id = new mongoose.Types.ObjectId(req.params.id);
    const stream = bucket.openDownloadStream(id);
    stream.on("file", file => {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file.filename}"`
      });
    });
    stream.on("error", () => res.status(404).send("File not found"));
    stream.pipe(res);
  } catch (e) {
    res.status(400).json({ error: "Invalid file id" });
  }
});

// Delete a certificate and its file in GridFS
app.delete("/api/certificates/:id", async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ error: "Not found" });

    if (cert.fileId) {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: "certificates" });
      await bucket.delete(cert.fileId);
    }

    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Contact Form ----
app.post("/api/contact", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- About ----
app.get('/api/about', async (req, res) => {
  try {
    const doc = await About.findOne({});
    res.json(doc?.data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/about', async (req, res) => {
  try {
    const exists = await About.findOne({});
    if (exists) {
      exists.data = req.body;
      await exists.save();
      return res.json(exists);
    }
    const about = await About.create({ data: req.body });
    res.status(201).json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// -------------------- Connect to MongoDB and Start Server --------------------

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});