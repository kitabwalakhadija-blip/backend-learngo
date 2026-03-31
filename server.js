const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

/* ================= MIDDLEWARE (TOP) ================= */

app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */

connectDB();

/* ================= MODELS ================= */

const User = require("./models/User");
const Enquiry = require("./models/Enquirytable");
const Contact = require("./models/ContactUstable");
const Followup = require("./models/Followuptable");
const Course = require("./models/Coursetable");
const Faculty = require("./models/Facultytable");

/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.send("Hello from express");
});

/* ================= USER ROUTES ================= */

app.post("/api/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= FACULTY ROUTES ================= */

// ✅ ADD FACULTY
app.post("/api/Facultytable", async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    const savedFaculty = await faculty.save();
    res.json(savedFaculty);
  } catch (error) {
    console.error("FACULTY SAVE ERROR:", error);
    res.status(500).json(error);
  }
});

// ✅ GET FACULTY
app.get("/api/Facultytable", async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (error) {
    console.error("FACULTY FETCH ERROR:", error);
    res.status(500).json(error);
  }
});

// ✅ DELETE FACULTY
app.delete("/api/Facultytable/:id", async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty Deleted" });
  } catch (error) {
    console.error("FACULTY DELETE ERROR:", error);
    res.status(500).json(error);
  }
});
app.put("/api/Facultytable/:id", async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json(error);
  }
});

/* ================= ENQUIRY ROUTES ================= */

app.post("/api/Enquirytable", async (req, res) => {
  try {
    let data = req.body;

    let course = null;

    if (data.WantToTakeAdmission) {
      const typedCourse = data.WantToTakeAdmission.toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "")
        .trim();

      const allCourses = await Course.find();

      course = allCourses.find((c) => {
        const dbTitle = (c.title || "")
          .toLowerCase()
          .replace(/\./g, "")
          .replace(/\s+/g, "")
          .trim();

        return dbTitle === typedCourse;
      });

      // if exact not found then partial match
      if (!course) {
        course = allCourses.find((c) => {
          const dbTitle = (c.title || "")
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/\s+/g, "")
            .trim();

          return dbTitle.includes(typedCourse);
        });
      }
    }

    console.log("Incoming WantToTakeAdmission:", data.WantToTakeAdmission);
    console.log("Matched Course:", course);

    if (course) {
      data.CID = course._id;
    }

    console.log("Final CID:", data.CID);

    const enquiry = new Enquiry(data);
    const savedEnquiry = await enquiry.save();

    const followup = new Followup({
      Eid: savedEnquiry._id,
      student_name: savedEnquiry.student_name || "",
      phone: savedEnquiry.phone || "",
      permanent_address: savedEnquiry.permanent_address || "",
      Department: savedEnquiry.Department || "",
      ConsellerName: savedEnquiry.ConsellerName || "",
      WantToTakeAdmission: savedEnquiry.WantToTakeAdmission || "",
      SuggestedCourse: savedEnquiry.SuggestedCourse || "",
      email: savedEnquiry.email || "",
      Cname: "",
      followup_detail: "",
      response: "",
      EnquiryDate: new Date(),
      FollowupDate: null,
    });

    await followup.save();

    res.json(savedEnquiry);
  } catch (error) {
    console.error("ENQUIRY ERROR:", error);
    res.status(500).json(error);
  }
});
app.get("/api/Enquirytable", async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("CID");
    res.json(enquiries);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Enquirytable/:id", async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Enquiry Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ================= FOLLOWUP ROUTES ================= */

app.get("/api/Followuptable", async (req, res) => {
  try {
    const followups = await Followup.find();
    res.json(followups);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Followuptable/:id", async (req, res) => {
  try {
    await Followup.findByIdAndDelete(req.params.id);
    res.json({ message: "Followup Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ================= CONTACT ROUTES ================= */

app.post("/api/ContactUstable", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.json(newContact);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/api/ContactUstable", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/ContactUstable/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ================= COURSE ROUTES ================= */

app.post("/api/Coursetable", async (req, res) => {
  try {
    const course = new Course(req.body);
    const saved = await course.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/Coursetable", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Coursetable/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});
// Faculty login route
app.post("/api/facultylogin", async (req, res) => {
  try {
    const { UserID, Password } = req.body;

    console.log("LOGIN DATA:", UserID, Password); // debug

    const faculty = await Faculty.findOne({
      UserID: UserID,
      Password: Password,
    });

    if (!faculty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ faculty });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json(error);
  }
});
/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
