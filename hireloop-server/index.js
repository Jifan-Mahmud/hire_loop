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
    const userCollection = database.collection("user");
    const subscriptionCollection = database.collection("subscriptions");

    // ==========================================
    // SUBSCRIPTIONS & USER PLAN ROUTES
    // ==========================================

    // Upgrade or activate user plan (called upon successful payment or admin)
    app.post('/api/users/upgrade-plan', async (req, res) => {
      try {
        const { email, planId, sessionId } = req.body;
        if (!email || !planId) {
          return res.status(400).send({ error: "Email and planId are required." });
        }

        const cleanPlan = planId
          .replace('seeker-', '')
          .replace('recruiter-', '')
          .toLowerCase();

        // Update user record
        await userCollection.updateOne(
          { email: email },
          {
            $set: {
              plan: cleanPlan,
              planId: planId,
              planStatus: 'active',
              upgradedAt: new Date(),
            },
          },
          { upsert: false }
        );

        // Update recruiter company if exists
        await companyCollection.updateMany(
          { $or: [{ recruiterEmail: email }, { email: email }] },
          { $set: { plan: cleanPlan, planUpdatedAt: new Date() } }
        );

        // Record in subscriptions collection
        await subscriptionCollection.insertOne({
          email,
          planId,
          plan: cleanPlan,
          sessionId: sessionId || null,
          status: 'active',
          activatedAt: new Date(),
        });

        res.send({
          success: true,
          message: `Plan successfully activated to ${cleanPlan}!`,
          plan: cleanPlan,
        });
      } catch (error) {
        console.error("Error upgrading user plan:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get current plan and active subscription details for user
    app.get('/api/users/plan', async (req, res) => {
      try {
        const { email } = req.query;
        if (!email) {
          return res.status(400).send({ error: "Email query param is required." });
        }

        const user = await userCollection.findOne({ email });
        const plan = (user?.plan || "free").toLowerCase();

        res.send({
          email,
          plan,
          planId: user?.planId || `seeker-${plan}`,
          upgradedAt: user?.upgradedAt || null,
        });
      } catch (error) {
        console.error("Error fetching user plan:", error);
        res.status(500).send({ error: error.message });
      }
    });

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

    // Create a new job (Enforces Recruiter Plan limits: Free=3, Growth=10, Enterprise=50)
    app.post('/api/jobs', async (req, res) => {
      try {
        const newJob = req.body;

        // Check active job limits for recruiter
        let recruiterEmail = newJob.recruiterEmail;
        if (!recruiterEmail && newJob.companyId) {
          const comp = await companyCollection.findOne({
            $or: [
              ...(ObjectId.isValid(newJob.companyId) ? [{ _id: new ObjectId(newJob.companyId) }] : []),
              { companyId: newJob.companyId },
            ],
          });
          if (comp?.recruiterEmail) {
            recruiterEmail = comp.recruiterEmail;
          }
        }

        if (recruiterEmail) {
          const recruiterUser = await userCollection.findOne({ email: recruiterEmail });
          const plan = (recruiterUser?.plan || "free").toLowerCase();

          let maxActiveJobs = 3; // Free: 3 active jobs
          let planTitle = "Free Plan";
          if (plan === "growth") {
            maxActiveJobs = 10;
            planTitle = "Growth Plan";
          } else if (plan === "enterprise") {
            maxActiveJobs = 50;
            planTitle = "Enterprise Plan";
          }

          const countQuery = {
            $or: [
              { recruiterEmail: recruiterEmail },
              ...(newJob.companyId ? [{ companyId: newJob.companyId }] : []),
            ],
            status: { $ne: "closed" },
          };

          const activeJobsCount = await jobCollection.countDocuments(countQuery);
          if (activeJobsCount >= maxActiveJobs) {
            return res.status(403).send({
              error: `Active job post limit reached (${activeJobsCount}/${maxActiveJobs}). The ${planTitle} allows up to ${maxActiveJobs} active job posts. Please upgrade your plan or close an older job to post a new one.`,
              jobLimitReached: true,
              activeJobsCount,
              maxActiveJobs,
              plan,
            });
          }
        }

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

        // Check User Plan & Monthly Application Limit (Free=3, Pro=30, Premium=Unlimited)
        const applicantUser = await userCollection.findOne({
          email: applicationData.applicantEmail,
        });
        const userPlan = (applicantUser?.plan || "free").toLowerCase();

        let monthlyLimit = 3;
        let planTitle = "Free Plan";
        if (userPlan === "pro") {
          monthlyLimit = 30;
          planTitle = "Pro Plan";
        } else if (userPlan === "premium") {
          monthlyLimit = Infinity;
          planTitle = "Premium Plan";
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCount = await applicationCollection.countDocuments({
          applicantEmail: applicationData.applicantEmail,
          appliedAt: { $gte: startOfMonth },
        });

        if (monthlyLimit !== Infinity && monthlyCount >= monthlyLimit) {
          return res.status(403).send({
            error: `Monthly application limit reached (${monthlyCount}/${monthlyLimit}). You can apply to up to ${monthlyLimit} jobs per month on your ${planTitle}. Please upgrade your plan to apply for more jobs.`,
            monthlyLimitReached: true,
            monthlyCount,
            monthlyLimit,
            plan: userPlan,
          });
        }

        const newApplication = {
          ...applicationData,
          applicantPlan: userPlan,
          isBoosted: userPlan === "premium", // Premium feature: profile boost to recruiters
          status: "pending",
          appliedAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await applicationCollection.insertOne(newApplication);
        res.status(201).send({
          success: true,
          insertedId: result.insertedId,
          message: "Application submitted successfully!",
          applicantPlan: userPlan,
          monthlyUsed: monthlyCount + 1,
          monthlyRemaining:
            monthlyLimit === Infinity
              ? "Unlimited"
              : Math.max(0, monthlyLimit - (monthlyCount + 1)),
        });
      } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get applicant's monthly usage and dynamic plan limit details
    app.get('/api/applications/monthly-usage', async (req, res) => {
      try {
        const { applicantEmail } = req.query;
        if (!applicantEmail) {
          return res.status(400).send({ error: "applicantEmail query parameter is required." });
        }

        const applicantUser = await userCollection.findOne({
          email: applicantEmail,
        });
        const userPlan = (applicantUser?.plan || "free").toLowerCase();

        let monthlyLimit = 3;
        let planName = "Free";
        let price = "$0/forever";
        let features = [
          "Browse & save up to 10 jobs",
          "Apply to up to 3 jobs per month",
          "Basic profile",
          "Email alerts",
        ];

        if (userPlan === "pro") {
          monthlyLimit = 30;
          planName = "Pro";
          price = "$19/month";
          features = [
            "Apply to up to 30 jobs per month",
            "Unlimited saved jobs",
            "Application tracking",
            "Salary insights",
          ];
        } else if (userPlan === "premium") {
          monthlyLimit = 999999;
          planName = "Premium";
          price = "$39/month";
          features = [
            "Unlimited job applications",
            "Profile boost to recruiters",
            "Early access to new jobs",
            "Priority support",
          ];
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCount = await applicationCollection.countDocuments({
          applicantEmail,
          appliedAt: { $gte: startOfMonth },
        });

        const isPremium = userPlan === "premium";
        const isLimitReached = !isPremium && monthlyCount >= monthlyLimit;
        const remaining = isPremium ? "Unlimited" : Math.max(0, monthlyLimit - monthlyCount);

        res.send({
          plan: planName,
          planKey: userPlan,
          price,
          monthlyLimit: isPremium ? "Unlimited" : monthlyLimit,
          monthlyUsed: monthlyCount,
          monthlyRemaining: remaining,
          isLimitReached,
          isPremium,
          features,
        });
      } catch (error) {
        console.error("Error fetching monthly usage:", error);
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
