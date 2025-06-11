const express = require('express');
const Blog = require('../models/Blog');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const { verifyToken, verifyAdmin } = require('../middleware/auth');


// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure 'uploads/' exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST /api/blogs - Create blog post
router.post('/', upload.fields([{ name: 'coverImage' }, { name: 'video' }]), async (req, res) => {
  const { title, content, author } = req.body;

  const blog = new Blog({
    title,
    slug: slugify(title, { lower: true }),
    content,
    author,
    coverImage: req.files['coverImage'] ? req.files['coverImage'][0].filename : null,
    video: req.files['video'] ? req.files['video'][0].filename : null,
  });

  try {
    await blog.save();
    res.status(201).json({ msg: 'Blog created', blog });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating blog', error: err.message });
  }
});

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching blogs' });
  }
});

// GET single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    res.json(blog);
  } catch (err) {
    res.status(404).json({ msg: 'Blog not found' });
  }
});

// PUT update blog
/*router.put('/:id', async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: 'Blog updated', blog: updated });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating blog' });
  }
});*/

router.put('/:id', upload.fields([{ name: 'coverImage' }, { name: 'video' }]), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      content: req.body.content,
    };

    // Update slug if title is changed
    if (req.body.title) {
      updateData.slug = slugify(req.body.title, { lower: true });
    }

    if (req.files['coverImage']) {
      updateData.coverImage = req.files['coverImage'][0].filename;
    }

    if (req.files['video']) {
      updateData.video = req.files['video'][0].filename;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ msg: 'Blog updated', blog: updatedBlog });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating blog', error: err.message });
  }
});


// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting blog' });
  }
});

// Delete a blog post (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      await Blog.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Blog deleted successfully' });
    } catch (err) {
      res.status(500).json({ msg: 'Error deleting blog', error: err.message });
    }
  });

  
module.exports = router;
