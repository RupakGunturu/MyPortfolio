// import express from 'express';
// import multer from 'multer';
// import mongoose from 'mongoose';
// import { GridFSBucket } from 'mongodb';

// app.post("/api/certificates", multerMemory.single("certificate"), async (req, res) => {
//   try {
//     const { title, issuer, date } = req.body;
//     if (!title || !issuer || !date) {
//       return res.status(400).json({ error: "Title, issuer and date are required" });
//     }

//     const db = mongoose.connection.db;
//     const bucket = new GridFSBucket(db, { bucketName: "certificates" });

//     let fileId = null;
//     let filename = null;
//     let contentType = null;

//     if (req.file) {
//       contentType = req.file.mimetype;
//       const uploadStream = bucket.openUploadStream(
//         `${Date.now()}-${req.file.originalname}`,
//         { 
//           metadata: { title, issuer },
//           contentType 
//         }
//       );

//       await new Promise((resolve, reject) => {
//         uploadStream.end(req.file.buffer);
//         uploadStream.on("finish", () => {
//           fileId = uploadStream.id;
//           filename = uploadStream.filename;
//           resolve();
//         });
//         uploadStream.on("error", reject);
//       });
//     }

//     const newCert = await Certificate.create({
//       title,
//       issuer,
//       date: new Date(date),
//       fileId,
//       filename,
//       contentType
//     });

//     res.status(201).json({
//       ...newCert.toObject(),
//       fileUrl: fileId ? `/api/certificates/file/${fileId}` : null
//     });
//   } catch (error) {
//     console.error("Certificate upload error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get all certificates
// app.get("/api/certificates", async (req, res) => {
//   try {
//     const certificates = await Certificate.find().sort({ createdAt: -1 });
    
//     const result = certificates.map(cert => ({
//       ...cert.toObject(),
//       date: cert.date.toISOString().split("T")[0],
//       fileUrl: cert.fileId ? `/api/certificates/file/${cert.fileId}` : null,
//       isImage: cert.contentType?.startsWith('image/') || false
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error("Get certificates error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Download certificate file
// app.get("/api/certificates/file/:id", async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).send("Invalid file ID");
//     }

//     const db = mongoose.connection.db;
//     const bucket = new GridFSBucket(db, { bucketName: "certificates" });
//     const fileId = new mongoose.Types.ObjectId(req.params.id);

//     const files = await bucket.find({ _id: fileId }).toArray();
//     if (files.length === 0) {
//       return res.status(404).send("File not found");
//     }

//     const file = files[0];
//     const downloadStream = bucket.openDownloadStream(fileId);

//     res.set({
//       "Content-Type": file.contentType || "application/octet-stream",
//       "Content-Disposition": `inline; filename="${file.filename}"`
//     });

//     downloadStream.pipe(res);
//   } catch (error) {
//     console.error("File download error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete certificate
// app.delete("/api/certificates/:id", async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: "Invalid ID format" });
//     }

//     const fileId = new mongoose.Types.ObjectId(req.params.id);
//     const db = mongoose.connection.db;
//     const bucket = new GridFSBucket(db, { bucketName: "certificates" });

//     // Delete from GridFS if exists
//     try {
//       await bucket.delete(fileId);
//     } catch (err) {
//       console.log("No file in GridFS to delete");
//     }

//     // Delete from MongoDB collection
//     const result = await Certificate.deleteOne({ _id: fileId });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: "Certificate not found" });
//     }

//     res.json({ success: true, message: "Certificate deleted" });
//   } catch (error) {
//     console.error("Delete certificate error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });