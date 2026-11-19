import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGO_DB_URI);
const db = client.db(process.env.AUTH_DB_NAME || "hire_Loop");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: { 
    enabled: true, 
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (৭ দিন মেয়াদ)
    updateAge: 60 * 60 * 24, // 1 day (প্রতিদিন সেশন অটো-আপডেট হবে)
  },
   user: {
       additionalFields: {
          role: {
              default : "seeker"
            },
          plan: {
              default : "free"
            },
          planId: {
              default : "seeker-free"
            },
        }
    }
});
