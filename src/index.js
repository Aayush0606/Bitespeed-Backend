import "dotenv/config";
import { PORT } from "./constants.js";
import app from "./app.js";
import { connectDB } from "./utils.js";

const startServer = async () => {
  //! THIS MAKE SURE THAT TABLES ARE CREATED BEFORE ANY BACKEND OPERATION
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server started at http://localhost:${PORT}`);
  });
};

startServer();
