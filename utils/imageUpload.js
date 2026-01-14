const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../uploads');
const tempDir = path.join(__dirname, '../temp_uploads');

// Ensure directories exist
[uploadDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

exports.uploadImage = async (file) => {
  try {
    if (!file) {
      console.log('No file provided for upload');
      return null;
    }

    console.log('Uploading file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // Check if file exists in temp location
    if (!fs.existsSync(file.path)) {
      console.error('Temp file not found:', file.path);
      throw new Error('Temp file not found');
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    console.log('Moving file from temp to uploads:', {
      from: file.path,
      to: filePath,
      fileName: fileName
    });

    // Move the file from temp to uploads directory
    await fs.promises.rename(file.path, filePath);

    // Verify the file was moved successfully
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not moved successfully');
    }

    const relativePath = `uploads/${fileName}`;
    console.log('Image uploaded successfully:', relativePath);
    
    return relativePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

exports.deleteImage = async (filePath) => {
  try {
    if (!filePath) return;

    const fullPath = path.join(__dirname, '../', filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};