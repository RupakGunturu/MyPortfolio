import Project from '../models/project.js';

export const createProject = async (req, res) => {
  try {
    console.log('Req.body:', req.body);
    console.log('Req.files:', req.files);
    
    const { title, description, link, image } = req.body;
    
    // Create project with or without uploaded files
    const projectData = { title, description, link };
    
    if (req.files?.image) {
      projectData.image = req.files.image[0].filename;
    } else if (image) {
      projectData.image = image; // Use provided image URL
    }
    
    if (req.files?.file) {
      projectData.file = req.files.file[0].filename;
    }
    
    const project = await Project.create(projectData);
    res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};