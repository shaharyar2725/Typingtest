// Vercel serverless entry point.
// Exports the Express app directly — @vercel/node calls it per request.
// app.listen() is NOT called here; Vercel manages the server lifecycle.
import app from "./app";
import { seedAvatars } from "./lib/seed";

// Seed default avatars on cold start. seedAvatars() is idempotent — safe to call repeatedly.
void seedAvatars();

export default app;
