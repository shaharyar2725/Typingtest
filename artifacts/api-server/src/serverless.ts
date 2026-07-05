// Vercel serverless entry point.
// Exports the Express app directly — @vercel/node calls it per request.
// app.listen() is NOT called here; Vercel manages the server lifecycle.
import app from "./app";

export default app;
