const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const multer = require("multer");
const path   = require("path");
const router = Router();

const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve('./public/images');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const coverName = `${Date.now()}-${file.originalname}`;
    cb(null, coverName);
  }
});
const upload = multer({ storage: storage })

router.get("/signup", (req, res) => {
  return res.render("signup",{
    user:req.user
  });
});

router.get("/signin", (req, res) => {
  return res.render("signin",{
    user: req.user
  });
});

router.get("/logout", (req, res) => {
  return res.clearCookie("token").render("signin");
}); 

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const allBlogs = await Blog.find({});
    return res.cookie("token",token).redirect("/");
  } catch (error) {
    console.error("Authentication failed", error);
    return res.render("signin",{
      error: "invalid email or password"
    });
  }
});

router.post("/signup",upload.single("profileImageUrl"), async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    await User.create({
      fullName,
      email,
      password,
      profileImageUrl: `/images/${req.file.filename}`
    });
    const allBlogs = await Blog.find({});
    return res.render("homepage",{
      user: req.user,
      allBlogs
    });
  } catch (error) {
    console.error("Signup failed", error);
    return res.render("signup", { error: "Signup failed" });
  }
});

module.exports = router;
