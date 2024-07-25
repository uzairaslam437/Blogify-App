const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require("./connection");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const {cheakForAuthenticationToken} = require("./middlewares/authentication");
const connectionString = "mongodb://127.0.0.1:27017/blogApp";
const PORT = 8000;
const Blog = require("./models/blog")

connectMongoDB(connectionString);

// Set up the view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Use middleware on the app
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cheakForAuthenticationToken("token"));
app.use(express.static(path.resolve("./public")))  //error of full path ??? why ?

// Use the user router
app.use("/user", userRouter);
app.use("/blog",blogRouter);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  console.log("blogs:",allBlogs)
  return res.render("homepage",{
    user: req.user,
    allBlogs
  })
});

app.listen(PORT, () => {
  console.log("Connected to port:", PORT);
});
