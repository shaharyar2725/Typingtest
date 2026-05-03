// Vercel serverless entry point.
// Exports the Express app directly — @vercel/node calls it per request.
// app.listen() is NOT called here; Vercel manages the server lifecycle.
import app from "../src/app";
import { seedAvatars } from "../src/lib/seed";

// Seed default avatars on cold start. seedAvatars() is idempotent — safe to call repeatedly.
void seedAvatars();

export default app;
