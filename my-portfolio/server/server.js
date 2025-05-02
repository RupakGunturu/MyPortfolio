// server.js
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GridFSBucket } from "mongodb";

dotenv.config();
const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 9000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Schemas & Models ─────────────────────────────────────────────────────────
const certificateSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  issuer:   { type: String, required: true },
  date:     { type: Date,   required: true },
  fileId:   mongoose.ObjectId,
  filename: String
}, { timestamps: true });
const Certificate = mongoose.model("Certificate", certificateSchema);

const userSchema = new mongoose.Schema({
  name:     { type: String, default: "" },
  bio:      { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});
const User = mongoose.model("User", userSchema);

const experienceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
});
const Experience = mongoose.model("Experience", experienceSchema);

// ─── Start up & DB ────────────────────────────────────────────────────────────
async function start() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("✅ MongoDB connected");

  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "certificates" });
  console.log("✅ GridFSBucket ready");

  // ─── Multer setup for memory storage ───────────────────────────────────────
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  });

  // ─── Routes ──────────────────────────────────────────────────────────────────

  const certImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLFZBG2PYmWOT81iUFfesPYTJVg7rNe2YIM9FXjX-Vlj_FkLH54MBzc9eLIBMQbuUMIo&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Nh9l0oOTzpzuUsqi6jxT3txXjD2bTUagBascKyzzWFMvyuW7Z0QOT650oDLDIclHmDQ&usqp=CAU',
    'https://miro.medium.com/v2/resize:fit:1358/0*2ApW5OWboyV571oB.png',
    'https://www.deliveryhero.com/wp-content/uploads/2021/04/DH_Blog_Header_WomenInTech_2000x1100px_2_Blue-1200x660.png'
  ];

  // Health check
  app.get("/", (req, res) => res.send("✅ Server is running"));

  // Create Certificate (with optional PDF)
  app.post("/api/certificates", upload.single("certificate"), async (req, res) => {
  try {
    const { title, issuer, date } = req.body;
    if (!title || !issuer || !date) {
      return res.status(400).json({ error: "Missing title, issuer or date" });
    }

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

    // 🟢 Generate a truly fresh random image URL here
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

  // List Certificates
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
      console.error("GET /api/certificates error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Serve PDF by fileId
  app.get("/api/certificates/file/:id", (req, res) => {
    try {
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

  // Delete Certificate
  app.delete("/api/certificates/:id", async (req, res) => {
    try {
      const cert = await Certificate.findByIdAndDelete(req.params.id);
      if (!cert) return res.status(404).json({ error: "Not found" });
      if (cert.fileId) await bucket.delete(cert.fileId);
      res.json({ message: "Deleted" });
    } catch (e) {
      console.error("DELETE /api/certificates error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // User route
  app.get("/api/user", async (req, res) => {
    try {
      const user = await User.findOne();
      res.json(user || { name: "", bio: "", imageUrl: "" });
    } catch (e) {
      console.error("GET /api/user error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Experience route
  app.get("/api/experience", async (req, res) => {
    try {
      const ex = await Experience.find();
      res.json(ex);
    } catch (e) {
      console.error("GET /api/experience error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Listening on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
