const connectToMongo = require("./db");
const express = require("express");
const User = require("./models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const fetchuser = require("./middleware/fetchuser");
const Notes = require("./models/Notes");
var cors = require("cors");

const JWT_SECRET = "JUBIUUUHDNQRNVI";

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());

const router1 = express.Router();
const router2 = express.Router();
//midleware use for req.body
app.use(express.json());

// //Available Routes
// app.use("api/auth", require("./routes/auth"));
// app.use("api/notes", require("./routes/notes"));

//for Auth
//ROUTE1:-Create a User using :POST  No login required
router1.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("email", "Enter a valid email").isEmail({ min: 5 }),
    body("password", "Password mst  be atleast 5 charcter").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    let success = false;
    //If they err the give bad request and err
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ success, error: error.array() });
    }

    try {
      //check wheter the user with this email exist already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry this user is already exist" });
      }

      //using bcrypt to mix password,hash and salt in db
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      // .then((user) => res.json(user))
      //  .catch((err) => console.log(err));

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      // res.json(user);
      success = true;
      res.json({ success, authToken });

      const newUser = new User({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      newUser
        .save()
        .then(() => res.json("User Added"))
        .catch((err) => res.status(400).json("Error " + err));
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occur");
    }
  }
);

//ROUTE2:-Authenticate a user using:POST NoLogin Required
router1.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail({ min: 5 }),
    body("password", "Password can't be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    //If they err the give bad request and err
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct crendentails",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct crendentails",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server occur ");
    }
  }
);

//ROUTE3:-Get login info user details using :POSt "/getuser" login required

router1.post(
  "/getuser",
  [
    body("email", "Enter a valid email").isEmail({ min: 5 }),
    body("password", "Password can't be blank").exists(),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server occur ");
    }
  }
);

//Notes
//ROUTER4:-get all the notes using GET:-"/fetchallnotes" login required
router2.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({
      user: req.user.id,
    });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server occur ");
  }
});
//ROUTER4:-Add a new  notes using Post:-"/fetchallnotes" login required
router2.post(
  "/addnotes",
  [
    body("title", "Enter a valid title").isLength({ min: 4 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //If they err the return a bad request and err
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server occur ");
    }
  }
);

//ROUTER5:-Update a existing notes using Post:-"/updatenotes" login required
router2.put("/updatenotes/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    //create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server occur ");
  }
});

//ROUTER5:Delete a notes delete : /deletenotes login required
router2.delete("/deletenotes/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    //Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    //Allow deletion only if user own this Notes
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({ Success: "note have been deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server occur ");
  }
});

app.use(router1);
app.use(router2);

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`iNotebook  backend listening at  https://localhost:${port}`);
});
