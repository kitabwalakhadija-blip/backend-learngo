const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  FacName: String,
  FacEmail: String,
  StudentAssign: String,
  FacDepartment: String,
  Experience: String,
  FacQualification: String,
  Address: String,
  FacPhoneNo: String,
  UserID: String,
  Password: String,
});

module.exports = mongoose.model("Facultytable", FacultySchema);
