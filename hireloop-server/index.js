require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    const companyCollection = database.collection("companies");

    // ==========================================
    // COMPANIES API ROUTES
    // ==========================================

    // Register a new company
    app.post('/api/companies', async (req, res) => {
      try {
        const companyData = req.body;
        companyData.status = companyData.status || "pending"; // always start pending until admin approves
        companyData.createdAt = new Date();
        companyData.updatedAt = new Date();
        const result = await companyCollection.insertOne(companyData);
        res.status(201).send({ insertedId: result.insertedId, ...companyData });
      } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get company for recruiter (by email, userId, or fallback)
    app.get('/api/companies/my-company', async (req, res) => {
      try {
        const { email, userId } = req.query;
        let query = {};
        if (email || userId) {
          const conditions = [];
          if (email) {
            conditions.push({ recruiterEmail: email }, { email: email });
          }
          if (userId) {
            conditions.push({ recruiterId: userId }, { userId: userId });
          }
          query = { $or: conditions };
        }

        let company = null;
        if (Object.keys(query).length > 0) {
          company = await companyCollection.findOne(query);
        }
        
        // If not found by query, fallback to the latest company if any exists (for smooth dev/demo)
        if (!company) {
          company = await companyCollection.findOne({}, { sort: { createdAt: -1 } });
        }

        if (!company) {
          return res.status(404).send({ error: "No company registered yet" });
        }
        res.send(company);
      } catch (error) {
        console.error("Error fetching my-company:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get all companies (with optional status or query filter)
    app.get('/api/companies', async (req, res) => {
      try {
        const query = {};
        if (req.query.status) {
          query.status = req.query.status;
        }
        if (req.query.recruiterEmail) {
          query.recruiterEmail = req.query.recruiterEmail;
        }
        const cursor = companyCollection.find(query).sort({ createdAt: -1 });
        const results = await cursor.toArray();
        res.send(results);
      } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get single company by id
    app.get('/api/companies/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const company = await companyCollection.findOne({ _id: new ObjectId(id) });
        if (!company) {
          return res.status(404).send({ error: "Company not found" });
        }
        res.send(company);
      } catch (error) {
        console.error("Error fetching company by id:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update company details
    app.patch('/api/companies/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = { ...req.body, updatedAt: new Date() };
        delete updateData._id; // prevent updating immutable _id
        const result = await companyCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating company:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // ==========================================
    // JOBS API ROUTES
    // ==========================================

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
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
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
