const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const router = Router();
const multer = require("multer");
const path   = require("path")

const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve('./public/uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const coverName = `${Date.now()}-${file.originalname}`;
    cb(null, coverName);
  }
});

  
const upload = multer({ storage: storage })

router.get("/add-blog",(req,res)=>{
    return res.render("addToBlog",{
        user: req.user
    });
})

router.post("/", upload.single("cover"), async (req, res) => {
  try {
    const { title, body } = req.body;

    // Make sure `blog` is defined correctly before trying to access `blog._id`
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageUrl: `/uploads/${req.file.filename}`
    });

    // Redirect to the blog page with a valid status code and URL
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/:id",async (req,res)=>{
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
  return res.render("blogs",{
    user: req.user,
    blog,
    comments
  })
})

router.post("/comment/:id",async (req,res) => {

    await Comment.create({
    content: req.body.content,
    createdBy: req.user._id,
    blogId: req.params.id
  });
  return res.redirect(`/blog/${req.params.id}`)
})

module.exports = router;
