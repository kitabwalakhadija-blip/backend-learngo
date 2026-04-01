// const mongoose = require("mongoose");
// const CourseTableSchema = new mongoose.Schema({
//   Id: Number,
//   title: String,
//   name: String,
//   discription: String,
//   duration: String,
//   link: String,
//   CourseDetail: String,
// });
// module.exports = mongoose.model("Coursetable", CourseTableSchema);
const mongoose = require("mongoose");
const CourseTableSchema = new mongoose.Schema({
  Id: Number,
  title: String,
  name: String,
  description: String,
  duration: String,
  link: String,
  CourseDetail: String,
});
module.exports = mongoose.model("Coursetable", CourseTableSchema);
