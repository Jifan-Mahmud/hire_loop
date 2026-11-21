import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";

let cachedClient = null;

async function getDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_DB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.AUTH_DB_NAME || "hire_Loop");
}

export async function GET() {
  try {
    const reqHeaders = await headers();
    let sessionUser = null;

    // 1. Try Better-Auth official server session helper
    try {
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });
      if (session?.user) {
        sessionUser = session.user;
      }
    } catch (err) {
      console.warn("auth.api.getSession fallback triggered:", err.message);
    }

    const db = await getDatabase();

    // 2. Fallback: Lookup session token in MongoDB 'session' collection directly
    if (!sessionUser) {
      const cookieHeader = reqHeaders.get("cookie") || "";
      const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        const token = decodeURIComponent(match[1].trim());
        const activeSession = await db.collection("session").findOne({
          token,
          expiresAt: { $gt: new Date() },
        });
        if (activeSession) {
          sessionUser = { id: activeSession.userId };
        }
      }
    }

    if (!sessionUser) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // 3. Fetch latest, live user document from MongoDB
    const userCollection = db.collection("user");
    const userId = sessionUser.id;
    const filter = ObjectId.isValid(userId)
      ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }, ...(sessionUser.email ? [{ email: sessionUser.email }] : [])] }
      : { $or: [{ id: userId }, ...(sessionUser.email ? [{ email: sessionUser.email }] : [])] };

    const liveUser = await userCollection.findOne(filter);

    if (!liveUser) {
      return NextResponse.json({
        authenticated: true,
        user: sessionUser,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: liveUser._id ? liveUser._id.toString() : liveUser.id,
        name: liveUser.name || sessionUser.name || "User",
        email: liveUser.email || sessionUser.email,
        role: liveUser.role || "seeker",
        status: liveUser.status || "active",
        plan: liveUser.plan || "free",
        planId: liveUser.planId || `${liveUser.role || "seeker"}-free`,
        image: liveUser.image || sessionUser.image || null,
      },
    });
  } catch (error) {
    console.error("Error in /api/user/sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
