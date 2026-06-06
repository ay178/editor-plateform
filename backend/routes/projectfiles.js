const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { auth } = require('../middleware/auth');
const HiringRequest = require('../models/HiringRequest');
const ProjectFile = require('../models/ProjectFile');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer - memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/avi', 'video/mkv',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only video and image files allowed'));
  }
});

// Upload file to Cloudinary
const uploadToCloudinary = (buffer, mimetype, folder) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video') ? 'video' : 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// POST /api/project-files/:requestId — upload file
router.post('/:requestId', auth, upload.single('file'), async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check hiring request exists and is accepted
    const hiringRequest = await HiringRequest.findById(requestId)
      .populate('client editor');

    if (!hiringRequest) 
      return res.status(404).json({ message: 'Hiring request not found' });

    if (hiringRequest.status !== 'accepted' && hiringRequest.status !== 'completed')
      return res.status(403).json({ message: 'Files can only be shared on accepted projects' });

    // Check user is part of this request
    const isClient = hiringRequest.client._id.toString() === req.user._id.toString();
    const isEditor = hiringRequest.editor._id.toString() === req.user._id.toString();

    if (!isClient && !isEditor)
      return res.status(403).json({ message: 'Not authorized' });

    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Cloudinary
    const folder = `edithire/${requestId}`;
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, folder);

    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    // Save to DB
    let projectFile = await ProjectFile.findOne({
      hiringRequest: requestId,
      uploadedBy: req.user._id
    });

    if (!projectFile) {
      projectFile = new ProjectFile({
        hiringRequest: requestId,
        uploadedBy: req.user._id,
        role: req.user.role,
        files: []
      });
    }

    projectFile.files.push({
      name: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: fileType,
      size: req.file.size
    });

    await projectFile.save();

    res.json({
      message: 'File uploaded successfully',
      file: projectFile.files[projectFile.files.length - 1]
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/project-files/:requestId — get all files
router.get('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const hiringRequest = await HiringRequest.findById(requestId);
    if (!hiringRequest)
      return res.status(404).json({ message: 'Not found' });

    // Check user is part of this request
    const isClient = hiringRequest.client.toString() === req.user._id.toString();
    const isEditor = hiringRequest.editor.toString() === req.user._id.toString();

    if (!isClient && !isEditor)
      return res.status(403).json({ message: 'Not authorized' });

    const files = await ProjectFile.find({ hiringRequest: requestId })
      .populate('uploadedBy', 'name role avatar');

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/project-files/:requestId/:fileId
router.delete('/:requestId/:fileId', auth, async (req, res) => {
  try {
    const { requestId, fileId } = req.params;

    const projectFile = await ProjectFile.findOne({
      hiringRequest: requestId,
      uploadedBy: req.user._id
    });

    if (!projectFile)
      return res.status(404).json({ message: 'Not found' });

    const file = projectFile.files.id(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Delete from Cloudinary
    if (file.publicId) {
      const resourceType = file.type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType });
    }

    file.deleteOne();
    await projectFile.save();

    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
