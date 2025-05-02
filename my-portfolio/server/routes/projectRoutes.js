const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/projectController');
const router  = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/add', upload.fields([
  { name: 'image' }, 
  { name: 'file' }
]), ctrl.createProject);

router.get('/', ctrl.getProjects);

module.exports = router;
