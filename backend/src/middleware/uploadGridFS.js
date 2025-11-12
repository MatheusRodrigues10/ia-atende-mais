const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const connectToDatabase = require('../config/database');

const storage = new GridFsStorage({
  db: connectToDatabase().then((connection) => connection.db),
  file: (req, file) => ({
    bucketName: 'uploads',
    filename: `${Date.now()}-${file.originalname}`
  })
});

const uploadGridFS = multer({ storage });

module.exports = { uploadGridFS };
