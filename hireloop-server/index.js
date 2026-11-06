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
    const applicationCollection = database.collection("applications");

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

    // Get company for recruiter (strictly by email or userId)
    app.get('/api/companies/my-company', async (req, res) => {
      try {
        const { email, userId } = req.query;
        if (!email && !userId) {
          return res.status(401).send({ error: "Unauthorized: User not authenticated" });
        }

        const conditions = [];
        if (email) {
          conditions.push({ recruiterEmail: email }, { email: email });
        }
        if (userId) {
          conditions.push({ recruiterId: userId }, { userId: userId });
        }

        let company = await companyCollection.findOne({ $or: conditions });

        // If not found, check if there is an unassigned company (e.g. from previous registration)
        if (!company && (email || userId)) {
          const unassigned = await companyCollection.findOne({
            $or: [
              { recruiterEmail: "recruiter@example.com" },
              { recruiterId: "recruiter-default-id" },
            ],
          });
          if (unassigned) {
            await companyCollection.updateOne(
              { _id: unassigned._id },
              { $set: { recruiterEmail: email, recruiterId: userId || unassigned.recruiterId } }
            );
            unassigned.recruiterEmail = email;
            company = unassigned;
          }
        }

        if (!company) {
          return res.status(404).send({ error: "No company registered yet for this user" });
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

    // Get all jobs (supports companyId, status, category, type, isRemote, search)
    app.get('/api/jobs', async (req, res) => {
      try {
        const query = {};
        if (req.query.companyId) {
          const cId = req.query.companyId;
          if (ObjectId.isValid(cId)) {
            query.$or = [{ companyId: cId }, { companyId: new ObjectId(cId) }];
          } else {
            query.companyId = cId;
          }
        }
        if (req.query.status) {
          query.status = req.query.status;
        }
        if (req.query.category && req.query.category !== 'all') {
          query.category = req.query.category.toLowerCase();
        }
        if (req.query.type && req.query.type !== 'all') {
          query.type = req.query.type.toLowerCase();
        }
        if (req.query.isRemote !== undefined && req.query.isRemote !== 'all') {
          query.isRemote = req.query.isRemote === 'true';
        }
        if (req.query.search) {
          const s = req.query.search.trim();
          query.$or = [
            { title: { $regex: s, $options: 'i' } },
            { companyName: { $regex: s, $options: 'i' } },
            { location: { $regex: s, $options: 'i' } },
          ];
        }
        const cursor = jobCollection.find(query).sort({ createdAt: -1 });
        const results = await cursor.toArray();
        res.send(results);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).send({ error: error.message });
      }
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

    // ==========================================
    // APPLICATIONS API ROUTES
    // ==========================================

    // Submit a new application (Only Job Seekers allowed)
    app.post('/api/applications', async (req, res) => {
      try {
        const applicationData = req.body;

        // Verify applicant role: Only Job Seekers can apply
        if (applicationData.applicantRole && applicationData.applicantRole !== 'seeker') {
          return res.status(403).send({
            error: "Only Job Seekers can apply for jobs. Recruiters are not allowed to apply.",
          });
        }

        if (!applicationData.jobId || !applicationData.applicantEmail) {
          return res.status(400).send({ error: "Job ID and Applicant Email are required." });
        }

        // Check if already applied
        const existing = await applicationCollection.findOne({
          jobId: applicationData.jobId,
          applicantEmail: applicationData.applicantEmail,
        });

        if (existing) {
          return res.status(409).send({
            error: "You have already applied for this position.",
            applicationId: existing._id,
          });
        }

        const newApplication = {
          ...applicationData,
          status: "pending",
          appliedAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await applicationCollection.insertOne(newApplication);
        res.status(201).send({
          success: true,
          insertedId: result.insertedId,
          message: "Application submitted successfully!",
        });
      } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Check if user already applied to a specific job
    app.get('/api/applications/check', async (req, res) => {
      try {
        const { jobId, applicantEmail } = req.query;
        if (!jobId || !applicantEmail) {
          return res.status(400).send({ error: "jobId and applicantEmail are required." });
        }
        const application = await applicationCollection.findOne({
          jobId,
          applicantEmail,
        });
        res.send({ hasApplied: !!application, application });
      } catch (error) {
        console.error("Error checking application status:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get applications (filter by jobId, applicantEmail, companyId)
    app.get('/api/applications', async (req, res) => {
      try {
        const query = {};
        if (req.query.jobId) query.jobId = req.query.jobId;
        if (req.query.applicantEmail) query.applicantEmail = req.query.applicantEmail;
        if (req.query.companyId) query.companyId = req.query.companyId;

        const results = await applicationCollection.find(query).sort({ appliedAt: -1 }).toArray();
        res.send(results);
      } catch (error) {
        console.error("Error fetching applications:", error);
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
