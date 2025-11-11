const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => ({
    bucketName: 'uploads',
    filename: `${Date.now()}-${file.originalname}`
  })
});

const uploadGridFS = multer({ storage });

module.exports = { uploadGridFS };
