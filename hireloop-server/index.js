require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("hire_Loop");
    const jobCollection = database.collection("jobs");

    // Create a new job
    app.post('/api/jobs', async (req, res) => {
      try {
        const newJob = req.body;
        newJob.createdAt = new Date();
        const result = await jobCollection.insertOne(newJob);
        res.send(result);
      } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get all jobs
    app.get('/api/jobs', async (req, res) => {
      const query = {};
      if(req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if(req.query.status) {
        query.status = req.query.status;
      }
      const cursor = jobCollection.find(query);
      const results = await cursor.toArray();
      res.send(results);
    });

    // Get single job by id
    app.get('/api/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const job = await jobCollection.findOne({ _id: new ObjectId(id) });
        if (!job) {
          return res.status(404).send({ error: "Job not found" });
        }
        res.send(job);
      } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Delete job by id
    app.delete('/api/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update job status or details
    app.patch('/api/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = { ...req.body };
        delete updateData._id; // prevent updating immutable _id
        const result = await jobCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send({ error: error.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('HireLoop API Server is running!');
});

app.listen(port, () => {
  console.log(`HireLoop server listening on port ${port}`);
});
