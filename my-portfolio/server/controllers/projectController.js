const Project = require('../models/project');

exports.createProject = async (req, res) => {
try {
console.log('Req.body:', req.body);
console.log('Req.files:', req.files);
const { title, description, link } = req.body;
if (!req.files.image || !req.files.file) return res.status(400).json({ error: 'Missing files' });
const image = req.files.image[0].filename;
const file  = req.files.file[0].filename;
const project = await Project.create({ title, description, link, image, file });
res.status(201).json({ project });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
};

exports.getProjects = async (req, res) => {
try {
const projects = await Project.find().sort({ createdAt: -1 });
res.json(projects);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
};