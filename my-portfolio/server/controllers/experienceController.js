import Experience from '../models/experience.js';

// Get all experiences
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ message: 'Failed to fetch experiences', error: error.message });
  }
};

// Get single experience by ID
export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ message: 'Failed to fetch experience', error: error.message });
  }
};

// Create new experience
export const createExperience = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { iconType, date, title, company, description } = req.body;
    
    console.log('Extracted values:', { iconType, date, title, company, description });
    
    // Validate required fields
    if (!date || !title || !company || !description) {
      console.log('Validation failed - missing fields:', { date: !!date, title: !!title, company: !!company, description: !!description });
      return res.status(400).json({ 
        message: 'All fields (date, title, company, description) are required' 
      });
    }

    // Validate iconType
    const validIconTypes = ['briefcase', 'code', 'graduation'];
    if (!validIconTypes.includes(iconType)) {
      return res.status(400).json({ 
        message: 'Invalid iconType. Must be one of: briefcase, code, graduation' 
      });
    }

    const newExperience = new Experience({
      iconType,
      date,
      title,
      company,
      description
    });

    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(400).json({ message: 'Failed to create experience', error: error.message });
  }
};

// Update experience by ID
export const updateExperience = async (req, res) => {
  try {
    const { iconType, date, title, company, description } = req.body;
    
    // Validate required fields
    if (!date || !title || !company || !description) {
      return res.status(400).json({ 
        message: 'All fields (date, title, company, description) are required' 
      });
    }

    // Validate iconType
    const validIconTypes = ['briefcase', 'code', 'graduation'];
    if (!validIconTypes.includes(iconType)) {
      return res.status(400).json({ 
        message: 'Invalid iconType. Must be one of: briefcase, code, graduation' 
      });
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      {
        iconType,
        date,
        title,
        company,
        description
      },
      { new: true, runValidators: true }
    );

    if (!updatedExperience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(400).json({ message: 'Failed to update experience', error: error.message });
  }
};

// Delete experience by ID
export const deleteExperience = async (req, res) => {
  try {
    const deletedExperience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!deletedExperience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json({ 
      message: 'Experience deleted successfully',
      deletedExperience 
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Failed to delete experience', error: error.message });
  }
};

// Bulk update experiences (replace all)
export const bulkUpdateExperiences = async (req, res) => {
  try {
    const { experiences } = req.body;
    
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

    // Delete all existing experiences
    await Experience.deleteMany({});
    
    // Insert new experiences
    const savedExperiences = await Experience.insertMany(experiences);
    
    res.json(savedExperiences);
  } catch (error) {
    console.error('Error bulk updating experiences:', error);
    res.status(400).json({ message: 'Failed to bulk update experiences', error: error.message });
  }
};

// Initialize default experiences if none exist
export const initializeDefaultExperiences = async (req, res) => {
  try {
    const existingCount = await Experience.countDocuments();
    
    if (existingCount > 0) {
      return res.json({ message: 'Experiences already exist', count: existingCount });
    }

    const defaultExperiences = [
      {
        iconType: 'briefcase',
        date: 'Summer 2023',
        title: 'Software Engineer Intern',
        company: 'Tech Solutions Inc.',
        description: 'Developed and maintained features for a large-scale web application using React and Node.js. Collaborated with a team of 10 engineers.',
      },
      {
        iconType: 'code',
        date: 'Spring 2023',
        title: 'Full-Stack Portfolio Project',
        company: 'University Coursework',
        description: 'Built a full-stack MERN application to showcase my skills. Implemented user authentication, a RESTful API, and a responsive frontend.',
      },
      {
        iconType: 'graduation',
        date: '2020 - 2024',
        title: 'B.Sc. in Computer Science',
        company: 'University of Technology',
        description: 'Focused on algorithms, data structures, and software engineering principles. Maintained a 3.8 GPA.',
      },
    ];

    const savedExperiences = await Experience.insertMany(defaultExperiences);
    res.status(201).json({ 
      message: 'Default experiences created successfully',
      experiences: savedExperiences 
    });
  } catch (error) {
    console.error('Error initializing default experiences:', error);
    res.status(500).json({ message: 'Failed to initialize default experiences', error: error.message });
  }
}; 