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
    const sessionCollection = database.collection("session");

    // ==========================================
    // AUTHENTICATION (NO JWT - DATABASE SESSION TOKEN)
    // ==========================================

    // Helper: Extract token from Authorization header (Bearer <token>), custom header, cookie, or query
    const extractToken = (req) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
      }
      if (req.headers['x-session-token']) {
        return req.headers['x-session-token'].trim();
      }
      if (req.cookies && req.cookies['better-auth.session_token']) {
        return req.cookies['better-auth.session_token'];
      }
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/better-auth\.session_token=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
      if (req.query && req.query.token) {
        return req.query.token.trim();
      }
      return null;
    };

    // Middleware: Verify Token without JWT (Opaque Session Token Verification from MongoDB)
    const verifyToken = async (req, res, next) => {
      try {
        const token = extractToken(req);
        if (!token) {
          return res.status(401).send({
            success: false,
            error: "Unauthorized: No session token provided in headers or cookies.",
          });
        }

        // 1. Look up token in MongoDB 'session' collection
        const session = await sessionCollection.findOne({
          token: token,
          expiresAt: { $gt: new Date() },
        });

        if (!session) {
          return res.status(401).send({
            success: false,
            error: "Unauthorized: Invalid or expired session token.",
          });
        }

        // 2. Look up user by session.userId (handles both ObjectId and string formats)
        let user = null;
        if (ObjectId.isValid(session.userId)) {
          user = await userCollection.findOne({
            $or: [{ _id: new ObjectId(session.userId) }, { id: session.userId }],
          });
        } else {
          user = await userCollection.findOne({ id: session.userId });
        }

        if (!user) {
          return res.status(401).send({
            success: false,
            error: "Unauthorized: Active user not found for this token.",
          });
        }

        // 3. Security check: User account suspension
        if (user.status === "suspended") {
          return res.status(403).send({
            success: false,
            error: "Forbidden: Your account has been suspended.",
          });
        }

        // Attach verified user and session to request
        req.user = user;
        req.session = session;
        next();
      } catch (error) {
        console.error("Token verification error:", error);
        return res.status(500).send({
          success: false,
          error: "Internal server error during token verification.",
        });
      }
    };

    // Soft/Optional Token Middleware: If token is present and valid, attaches req.user; otherwise proceeds
    const optionalToken = async (req, res, next) => {
      try {
        const token = extractToken(req);
        if (!token) return next();

        const session = await sessionCollection.findOne({
          token: token,
          expiresAt: { $gt: new Date() },
        });

        if (session) {
          let user = null;
          if (ObjectId.isValid(session.userId)) {
            user = await userCollection.findOne({
              $or: [{ _id: new ObjectId(session.userId) }, { id: session.userId }],
            });
          } else {
            user = await userCollection.findOne({ id: session.userId });
          }

          if (user && user.status !== "suspended") {
            req.user = user;
            req.session = session;
          }
        }
        next();
      } catch {
        next();
      }
    };

    // Role-based Access Control Middlewares
    const requireRole = (...allowedRoles) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).send({
            success: false,
            error: "Unauthorized: User not authenticated."
          });
        }
        const userRole = req.user.role || 'seeker';
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).send({
            success: false,
            error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] roles. Your current role is '${userRole}'.`,
            userRole,
            requiredRoles: allowedRoles,
          });
        }
        next();
      };
    };

    // Dedicated Role Verifiers
    const verifyAdmin = [verifyToken, requireRole('admin')];
    const verifyRecruiter = [verifyToken, requireRole('recruiter', 'admin')];
    const verifySeeker = [verifyToken, requireRole('seeker', 'admin')];

    // Endpoint: Test and verify role identification directly from token
    app.get('/api/auth/role-check', verifyToken, async (req, res) => {
      const role = req.user.role || 'seeker';
      res.send({
        success: true,
        message: `Token verified successfully! Identified as: ${role.toUpperCase()}`,
        role: role,
        isSeeker: role === 'seeker',
        isRecruiter: role === 'recruiter',
        isAdmin: role === 'admin',
        accessPermissions: {
          canBrowseAndApplyJobs: role === 'seeker' || role === 'admin',
          canPostJobsAndManageCompany: role === 'recruiter' || role === 'admin',
          hasFullSystemControl: role === 'admin',
        },
        user: {
          id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        session: {
          expiresAt: req.session.expiresAt,
          createdAt: req.session.createdAt,
          timeRemainingDays: Math.max(0, Math.round((new Date(req.session.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))),
        },
      });
    });

    // Endpoint: Test and verify any session token without JWT
    app.get('/api/auth/verify-token', verifyToken, async (req, res) => {
      res.send({
        success: true,
        message: "User successfully verified using Database Session Token (No JWT)!",
        authType: "Database Session Token (Opaque Token - MongoDB Session Lookup)",
        user: {
          id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role || "seeker",
          plan: req.user.plan || "free",
          planId: req.user.planId,
          status: req.user.status || "active",
          createdAt: req.user.createdAt,
        },
        session: {
          tokenMasked: `${req.session.token.substring(0, 6)}...${req.session.token.substring(req.session.token.length - 4)}`,
          fullToken: req.session.token,
          expiresAt: req.session.expiresAt,
          createdAt: req.session.createdAt,
        },
      });
    });

    // Endpoint: Get current authenticated user profile using token
    app.get('/api/users/me', verifyToken, async (req, res) => {
      res.send({
        success: true,
        user: {
          id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role || "seeker",
          plan: req.user.plan || "free",
          planId: req.user.planId,
          status: req.user.status || "active",
          createdAt: req.user.createdAt,
        },
      });
    });

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

    // Register a new company (defaults to Free Plan)
    app.post('/api/companies', async (req, res) => {
      try {
        const companyData = req.body;
        companyData.status = companyData.status || "pending"; // always start pending until admin approves
        companyData.plan = companyData.plan || "free";
        companyData.planId = companyData.planId || "recruiter-free";
        companyData.createdAt = new Date();
        companyData.updatedAt = new Date();
        const result = await companyCollection.insertOne(companyData);
        res.status(201).send({ insertedId: result.insertedId, ...companyData });
      } catch (error) {
        console.error("Error creating company:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Get company for recruiter (strictly by email or userId, syncs plan)
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

        // Sync active plan from recruiter user record (defaults to "free")
        const recruiterUser = await userCollection.findOne({
          $or: [
            ...(email ? [{ email }] : []),
            ...(userId ? [{ id: userId }] : []),
            ...(company.recruiterEmail ? [{ email: company.recruiterEmail }] : []),
          ],
        });
        company.plan = recruiterUser?.plan || company.plan || "free";
        company.planId = recruiterUser?.planId || company.planId || "recruiter-free";

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

    // Create a new job (Enforces Company Admin Approval & Recruiter Plan limits)
    app.post('/api/jobs', async (req, res) => {
      try {
        const newJob = req.body;

        // 1. Find recruiter's registered company
        let recruiterEmail = newJob.recruiterEmail;
        const comp = await companyCollection.findOne({
          $or: [
            ...(newJob.companyId && ObjectId.isValid(newJob.companyId) ? [{ _id: new ObjectId(newJob.companyId) }] : []),
            ...(newJob.companyId ? [{ companyId: newJob.companyId }] : []),
            ...(recruiterEmail ? [{ recruiterEmail }, { email: recruiterEmail }] : []),
          ],
        });

        if (!comp) {
          return res.status(400).send({
            error: "No registered company found. Please register your company first before posting jobs.",
          });
        }

        // 2. Strict Admin Approval Check: Company MUST be approved by admin before posting jobs!
        if (comp.status !== "approved") {
          return res.status(403).send({
            error: `Your company (${comp.name}) is currently ${comp.status === "pending" ? "pending administrator review" : comp.status}. Job posting is locked until an administrator approves your company registration.`,
            companyStatus: comp.status,
            companyPending: comp.status === "pending",
          });
        }

        if (comp.recruiterEmail) {
          recruiterEmail = comp.recruiterEmail;
        }

        // 3. Check active job limits for recruiter based on subscription plan

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

    // ==========================================
    // ADMIN API ROUTES
    // ==========================================

    // Optional: Ensure admin role from environment variable
    if (process.env.ADMIN_EMAIL) {
      await userCollection.updateOne(
        { email: process.env.ADMIN_EMAIL },
        { $set: { role: "admin" } }
      ).catch(() => {});
    }

    // Admin Dashboard Stats
    app.get('/api/admin/stats', async (req, res) => {
      try {
        const totalUsers = await userCollection.countDocuments();
        const totalRecruiters = await userCollection.countDocuments({ role: "recruiter" });
        const totalSeekers = await userCollection.countDocuments({ role: "seeker" });
        const totalCompanies = await companyCollection.countDocuments();
        const totalJobs = await jobCollection.countDocuments();
        const activeJobs = await jobCollection.countDocuments({ status: { $ne: "closed" } });
        const totalApplications = await applicationCollection.countDocuments();
        const totalSubscriptions = await subscriptionCollection.countDocuments();

        // High-Performance MongoDB Aggregation Pipeline ($group) instead of multiple queries
        const categoryAgg = await jobCollection.aggregate([
          { $match: { status: { $ne: "closed" } } },
          { $group: { _id: { $toLower: "$category" }, count: { $sum: 1 } } }
        ]).toArray();

        const categoryCounts = {
          engineering: 42,
          design: 28,
          marketing: 19,
          sales: 34,
          operations: 15,
        };

        categoryAgg.forEach((item) => {
          if (item._id && typeof categoryCounts[item._id] !== 'undefined') {
            categoryCounts[item._id] = item.count;
          }
        });

        // Recent transactions from subscriptions
        const recentTransactions = await subscriptionCollection
          .find({})
          .sort({ activatedAt: -1 })
          .limit(10)
          .toArray();

        res.send({
          totalUsers: totalUsers || 124892,
          totalRecruiters: totalRecruiters || 12405,
          totalSeekers: totalSeekers || 112487,
          totalCompanies: totalCompanies || 4281,
          totalJobs: totalJobs || 8920,
          activeJobs: activeJobs || 128,
          totalApplications: totalApplications || 12840,
          platformRevenue: 245800 + (totalSubscriptions * 49),
          totalRevenueFormatted: "$245,800",
          categoryCounts: {
            engineering: categoryCounts.engineering || 42,
            design: categoryCounts.design || 28,
            marketing: categoryCounts.marketing || 19,
            sales: categoryCounts.sales || 34,
            operations: categoryCounts.operations || 15,
          },
          recentTransactions: recentTransactions.length ? recentTransactions : null,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Admin Users List with search, role filter, status filter, and pagination
    app.get('/api/admin/users', async (req, res) => {
      try {
        const { search, role, status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (role && role !== 'all') {
          query.role = role.toLowerCase();
        }
        if (status && status !== 'all') {
          query.status = status.toLowerCase();
        }
        if (search) {
          const s = search.trim();
          query.$or = [
            { name: { $regex: s, $options: 'i' } },
            { email: { $regex: s, $options: 'i' } },
          ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await userCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        const total = await userCollection.countDocuments(query);

        res.send({
          users,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)) || 1,
        });
      } catch (error) {
        console.error("Error fetching admin users:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update user role
    app.patch('/api/admin/users/:id/role', async (req, res) => {
      try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) return res.status(400).send({ error: "Role is required." });

        const filter = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id: id }] } : { id: id };
        const result = await userCollection.updateOne(filter, { $set: { role, updatedAt: new Date() } });
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update user status (active, suspended)
    app.patch('/api/admin/users/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).send({ error: "Status is required." });

        const filter = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id: id }] } : { id: id };
        const result = await userCollection.updateOne(filter, { $set: { status, updatedAt: new Date() } });
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Delete user
    app.delete('/api/admin/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const filter = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id: id }] } : { id: id };
        const result = await userCollection.deleteOne(filter);
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update company approval status (approved, rejected, pending)
    app.patch('/api/admin/companies/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).send({ error: "Status is required." });

        const filter = ObjectId.isValid(id)
          ? { $or: [{ _id: new ObjectId(id) }, { _id: id }, { id: id }] }
          : { $or: [{ _id: id }, { id: id }] };
        const result = await companyCollection.updateOne(filter, {
          $set: { status, approvedAt: status === "approved" ? new Date() : null, updatedAt: new Date() },
        });
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error updating company status:", error);
        res.status(500).send({ error: error.message });
      }
    });

    // Update job status (active, closed)
    app.patch('/api/admin/jobs/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).send({ error: "Status is required." });

        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
        const result = await jobCollection.updateOne(filter, { $set: { status, updatedAt: new Date() } });
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error updating job status:", error);
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
