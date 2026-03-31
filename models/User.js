const mongoose = require("mongoose");
const userSchema= new mongoose.Schema({
    sname: String,
    qual: String,
    perc: Number,
})
module.exports = mongoose.model("User",userSchema);