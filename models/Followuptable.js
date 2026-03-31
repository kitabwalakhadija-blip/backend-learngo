const mongoose = require("mongoose");

const FollowuptableSchema = new mongoose.Schema({
  Eid: String,

  student_name: String,
  phone: Number,
  permanent_address: String,
  Department: String,
  ConsellerName: String,

  WantToTakeAdmission: String,
  SuggestedCourse: String,

  email: String,

  Cname: String,
  Address: String,

  followup_detail: String,
  response: String,

  FollowUpDate: Date,
  EnquiryDate: Date,
});

module.exports = mongoose.model("Followuptable", FollowuptableSchema);
