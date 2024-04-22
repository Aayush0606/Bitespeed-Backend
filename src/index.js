import "dotenv/config";
import { PORT } from "./constants.js";
import app from "./app.js";
import { connectDB } from "./DB/db.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server started at http://localhost: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to connect DB ${err}`);
    process.exit(1);
  });
