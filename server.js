const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

const deleteByFlexibleId = async (Model, id, fallbackField) => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(String(id))) {
    const deletedByObjectId = await Model.findByIdAndDelete(id);
    if (deletedByObjectId) {
      return deletedByObjectId;
    }
  }

  if (!fallbackField) {
    return null;
  }

  const normalizedId = Number.isNaN(Number(id)) ? id : Number(id);
  return Model.findOneAndDelete({ [fallbackField]: normalizedId });
};

const deleteByCandidateIds = async (Model, candidates = [], fallbackFields = []) => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "") {
      continue;
    }

    if (mongoose.Types.ObjectId.isValid(String(candidate))) {
      const deletedByObjectId = await Model.findByIdAndDelete(candidate);
      if (deletedByObjectId) {
        return deletedByObjectId;
      }
    }

    for (const field of fallbackFields) {
      const normalizedCandidate = Number.isNaN(Number(candidate))
        ? candidate
        : Number(candidate);
      const deletedByFallback = await Model.findOneAndDelete({
        [field]: normalizedCandidate,
      });

      if (deletedByFallback) {
        return deletedByFallback;
      }
    }
  }

  return null;
};

const deleteByDisplayIndex = async (Model, displayIndex, sort) => {
  const numericIndex = Number(displayIndex);

  if (!Number.isInteger(numericIndex) || numericIndex <= 0) {
    return null;
  }

  const records = await Model.find()
    .sort(sort)
    .skip(numericIndex - 1)
    .limit(1);

  const targetRecord = records[0];

  if (!targetRecord) {
    return null;
  }

  return Model.findByIdAndDelete(targetRecord._id);
};

const normalizeOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeEnquiryPayload = (data = {}) => {
  const payload = { ...data };

  delete payload._id;
  delete payload.__v;
  delete payload.Eid;
  delete payload.__rowId;

  payload.phone = normalizeOptionalNumber(payload.phone);
  payload.ContactNo = normalizeOptionalNumber(payload.ContactNo);

  if (payload.CID === "" || payload.CID === null || payload.CID === undefined) {
    delete payload.CID;
  }

  payload.CID = normalizeOptionalNumber(payload.CID);

  if (payload.CID === undefined) {
    delete payload.CID;
  }

  return payload;
};

const pickEnquiryFields = (data = {}) => {
  const allowedFields = [
    "EnquiryDate",
    "Department",
    "ConsellerName",
    "WantToTakeAdmission",
    "Qualification",
    "Percentage",
    "SuggestedCourse",
    "PurposeOfCourse",
    "CID",
    "student_name",
    "phone",
    "mobile",
    "email",
    "permanent_address",
    "temporary_address",
    "ContactNo",
    "father_name",
    "Occupation_father",
    "organisation",
    "designation",
    "mother_name",
    "Occupation_mother",
    "Siblings",
    "HowDidYouComeToKnowAboutUs",
  ];

  return allowedFields.reduce((acc, key) => {
    if (data[key] !== undefined) {
      acc[key] = data[key];
    }

    return acc;
  }, {});
};

const getNextSequenceValue = async (Model, field) => {
  const lastRecord = await Model.findOne({ [field]: { $type: "number" } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();

  return (lastRecord?.[field] || 0) + 1;
};

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
    const updated = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json(updated);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json(error);
  }
});

/* ================= ENQUIRY ROUTES ================= */

app.post("/api/Enquirytable", async (req, res) => {
  try {
    let data = normalizeEnquiryPayload(req.body);
    data.EnquiryDate = data.EnquiryDate || new Date();
    data.Eid = await getNextSequenceValue(Enquiry, "Eid");

    let course = null;

    if (!data.CID && data.WantToTakeAdmission) {
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
      if (typeof course.Id === "number") {
        data.CID = course.Id;
      } else {
        const orderedCourses = await Course.find().sort({ _id: 1 }).lean();
        const fallbackIndex = orderedCourses.findIndex(
          (orderedCourse) => String(orderedCourse._id) === String(course._id),
        );

        if (fallbackIndex >= 0) {
          data.CID = fallbackIndex + 1;
        }
      }
    }

    console.log("Final CID:", data.CID);

    const enquiry = new Enquiry(data);
    const savedEnquiry = await enquiry.save();

    const followup = new Followup({
      Eid: savedEnquiry.Eid,
      sourceEnquiryId: savedEnquiry._id,
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
      EnquiryDate: savedEnquiry.EnquiryDate || new Date(),
      FollowupDate: null,
    });

    await followup.save();

    res.json(savedEnquiry);
  } catch (error) {
    console.error("ENQUIRY ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to save enquiry",
      details: error.errors || null,
    });
  }
});
app.get("/api/Enquirytable", async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .sort({ EnquiryDate: -1, _id: -1 });
    const normalizedEnquiries = enquiries.map((enquiry, index) => {
      const record = enquiry.toObject();

      return {
        ...record,
        Eid: typeof record.Eid === "number" ? record.Eid : index + 1,
      };
    });

    res.json(normalizedEnquiries);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Enquirytable/:id", async (req, res) => {
  try {
    let deleted = await deleteByCandidateIds(
      Enquiry,
      [
        req.params.id,
        req.body?._id,
        req.body?.__rowId,
        req.body?.Eid,
      ],
      ["Eid"],
    );

    if (!deleted) {
      deleted = await deleteByDisplayIndex(
        Enquiry,
        req.params.id,
        { EnquiryDate: -1, _id: -1 },
      );
    }

    if (!deleted) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    const followupDeleteFilter = {
      $or: [
        { sourceEnquiryId: deleted._id },
        { Eid: deleted.Eid },
      ],
    };

    await Followup.deleteMany(followupDeleteFilter);

    res.json({ message: "Enquiry and related follow-up records deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});
app.put("/api/Enquirytable/:id", async (req, res) => {
  try {
    const rawIds = [
      req.params.id,
      req.body?.Eid,
      req.body?._id,
      req.body?.__rowId,
    ];
    const candidateId = rawIds.find((value) => {
      if (value === null || value === undefined || value === "") {
        return false;
      }
      return true;
    });
    const updateData = pickEnquiryFields(normalizeEnquiryPayload(req.body));

    console.log("ENQUIRY UPDATE ID:", candidateId);
    console.log("ENQUIRY UPDATE DATA:", updateData);

    if (!candidateId) {
      return res.status(400).json({ message: "Invalid enquiry id" });
    }

    const updated = await Enquiry.findByIdAndUpdate(
      candidateId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json(updated);
  } catch (error) {
    console.log("ENQUIRY UPDATE ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update enquiry",
      name: error.name || "Error",
      details: error.errors || null,
    });
  }
});


/* ================= FOLLOWUP ROUTES ================= */

app.post("/api/Followuptable", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.Eid !== undefined && payload.Eid !== null && payload.Eid !== "") {
      payload.Eid = Number(payload.Eid);
    } else {
      payload.Eid = await getNextSequenceValue(Followup, "Eid");
    }

    const followup = new Followup(payload);
    const savedFollowup = await followup.save();
    res.json(savedFollowup);
  } catch (error) {
    console.error("FOLLOWUP SAVE ERROR:", error);
    res.status(500).json(error);
  }
});

app.get("/api/Followuptable", async (req, res) => {
  try {
    const followups = await Followup.find().sort({ EnquiryDate: -1, _id: -1 });
    const normalizedFollowups = followups.map((followup, index) => {
      const record = followup.toObject();

      return {
        ...record,
        Eid: typeof record.Eid === "number" ? record.Eid : index + 1,
      };
    });

    res.json(normalizedFollowups);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Followuptable/:id", async (req, res) => {
  try {
    let deleted = await deleteByCandidateIds(
      Followup,
      [
        req.params.id,
        req.body?._id,
        req.body?.sourceEnquiryId,
        req.body?.Eid,
      ],
      ["Eid", "sourceEnquiryId"],
    );

    if (!deleted) {
      deleted = await deleteByDisplayIndex(
        Followup,
        req.params.id,
        { EnquiryDate: -1, _id: -1 },
      );
    }

    if (!deleted) {
      return res.status(404).json({ message: "Follow-up not found" });
    }

    res.json({ message: "Followup Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});
app.put("/api/Followuptable/:id", async (req, res) => {
  try {
    const updated = await Followup.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({ message: "Followup not found" });
    }

    res.json(updated);
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
    const deleted = await deleteByFlexibleId(Contact, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/api/ContactUstable/:id", async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json(error);
  }
});



/* ================= COURSE ROUTES =================  */

app.post("/api/Coursetable", async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      Id: await getNextSequenceValue(Course, "Id"),
    });
    const saved = await course.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/Coursetable", async (req, res) => {
  try {
    const courses = await Course.find().sort({ _id: 1 });
    const normalizedCourses = courses.map((course, index) => {
      const record = course.toObject();

      return {
        ...record,
        Id: record.Id || index + 1,
      };
    });

    res.json(normalizedCourses);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/api/Coursetable/:id", async (req, res) => {
  try {
    const deleted = await deleteByFlexibleId(Course, req.params.id, "Id");

    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course Deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});
app.put("/api/Coursetable/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.log("COURSE UPDATE ERROR:", error);
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
