const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
   res.send('API is Working');
});

mongoose.connect(process.env.DB_URL)
.then(() => {
   console.log('MongoDB Connected Successfully');
   app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})
.catch((err) => console.log(err));
