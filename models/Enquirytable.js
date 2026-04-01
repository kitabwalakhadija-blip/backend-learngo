// // const mongoose = require("mongoose");
// // const EnquirytableSchema= new mongoose.Schema({
// //     sname: String,
// //     Eid:Number,
// //     Cid:Number,
// //     Conselname:String,
// //     Department:String,
// //     PhoneNo:Number,
// //     WantToTakeAdd:String,
// //     PurposeOfCourse:String,
// //     Email:String,
// //     Cname:String,
// //     Address:String,
// //     FContactNo:Number,
// //     Fathername:String,
// //     FOccupation:String,
// //     Organization:String,
// //     MotherName:String,
// //     MOccupation:String,
// //     BrotherSister:String,
// //     HowDidYouToComeToKnow:String,
// //     qual: String,
// //     perc: Number,
// // })
// // module.exports = mongoose.model("Enquiry", EnquirytableSchema);
// const mongoose = require("mongoose");

// const enquirySchema = new mongoose.Schema({
//   Eid: String,
//   student_name: String,
//   phone: String,
//   CID: String,
//   Department: String,
//   ConsellerName: String,
//   Percentage: String,
//   Qualification: String,
//   WantToTakeAdmission: String,
//   PurposeOfCourse: String,
//   SuggestedCourse: String,
//   email: String,
//   Cname: String,
//   Address: String,
//   ContactNo: String,
//   father_name: String,
//   Occupation_father: String,
//   Organisation: String,
//   MotherName: String,
//   Occupation_mother: String,
//   BrotherSister: String,
//   Source: String,
// });

// module.exports = mongoose.model("Enquirytable", enquirySchema);
const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  Eid: Number,
  EnquiryDate: {
    type: Date,
    default: Date.now,
  },
  Department: String,
  ConsellerName: String,
  WantToTakeAdmission: String,
  Qualification: String,
  Percentage: String,
  SuggestedCourse: String,
  PurposeOfCourse: String,
  CID: Number,
  
  student_name: String,
  phone: Number,
  mobile: String,
  email: String,
  permanent_address: String,
  temporary_address: String,
  ContactNo: Number,
  father_name: String,
  Occupation_father: String,
  organisation: String,
  designation: String,
  mother_name: String,
  Occupation_mother: String,
  Siblings: String,
  HowDidYouComeToKnowAboutUs: String,
});

module.exports = mongoose.model("Enquirytable", enquirySchema);
