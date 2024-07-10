//code for connect to database
const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/inotebook?directConnection=true";

mongoose.set("strictQuery", true);

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("mongoose connect successfullly");
  });
};

module.exports = connectToMongo;
