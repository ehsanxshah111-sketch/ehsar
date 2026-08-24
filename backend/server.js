// Local development entrypoint only. On Vercel, app.js is deployed directly
// as the serverless function (see backend/app.js) and this file never runs -
// app.js already calls dotenv.config()/connectDB() itself so it works
// correctly either way.
import app from "./app.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ehsar server running on port ${PORT}`));
