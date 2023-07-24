const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.Db_User}:${process.env.Db_pass}@cluster0.ez7uet8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const collegeCollection = client.db("admissionDB").collection("colleges");
    const admissionCollection = client
      .db("admissionDB")
      .collection("admissions");
    app.get("/allColleges", async (req, res) => {
      const colleges = await collegeCollection.find({}).toArray();
      res.send(colleges);
    });
    app.get("/college/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const college = await collegeCollection.findOne(query);
      res.send(college);
    });

    app.post("/admissions", async (req, res) => {
      const data = req.body;
      // console.log(data);
      const query = { _id: new ObjectId(data.collegeId) };
      const existing = await admissionCollection.findOne(query);
      if (existing) {
        res.send("You are already admit");
      }
      const result = await admissionCollection.insertOne(data);
      res.send(result);
    });

    app.get("/student/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      const result = await admissionCollection.findOne(query);
      res.send(result);
    });
    app.get("/myCollege/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.post("/addReview/:collegeName", async (req, res) => {
      const collegeName = req.params.collegeName;
      const newReview = req.body;
      collegeCollection.findOneAndUpdate(
        { name: collegeName },
        { $push: { reviews: newReview } },
        { new: true },
        (err, updatedDocument) => {
          if (err) {
            console.error("Error adding review:", err);
            return res.status(500).send({ error: "Failed to add review." });
          }
          // Return the updated document (optional)
          res.send(updatedDocument);
        }
      );
    });

    app.patch("/editProfile/:id", async (req, res) => {
      const id = req.params.id;
      const { name, email, subject, selectCollegeName } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: name,
          email: email,
          subject: subject,
          selectCollegeName: selectCollegeName,
        },
      };
      const result = await admissionCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server running is ${port}`);
});
