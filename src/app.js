import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  connectDB,
  getData,
  insertContactDB,
  insertChildrenDB,
  generateResponse,
} from "./utils.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;

  //! IF BOTH PHONE NO AND EMAIL IS BLANK, RETURN AS BAD REQUEST
  if (
    (!email || email.trim() === "") &&
    (!phoneNumber || phoneNumber.trim() === "")
  )
    return res
      .status(400)
      .json({ msg: "Either Phone Number or Email is required!!" });

  const emailParent = await getData("email", email);
  const phoneParent = await getData("phoneNumber", phoneNumber);
  //! FIRST TIME ENCOUNTRING SUCH RECORD
  if (!emailParent && !phoneParent) {
    const newRecordData = {
      phoneNumber: phoneNumber || null,
      email: email || null,
      linkedId: null,
      linkPrecedence: "primary",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const parentData = await insertContactDB(newRecordData);
    const userResponse = await generateResponse(parentData.insertId);
    return res.status(200).json(userResponse);
  }

  //! IF ONLY ONE OF THE TWO EXIST
  else if (!emailParent || !phoneParent) {
    const parentId = emailParent
      ? emailParent.linkedId || emailParent.id
      : phoneParent.linkedId || phoneParent.id;
    const newRecordData = {
      phoneNumber: phoneNumber || null,
      email: email || null,
      linkedId: parentId,
      linkPrecedence: "secondary",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const childData = await insertContactDB(newRecordData);
    await insertChildrenDB(parentId, childData.insertId);
    const userResponse = await generateResponse(parentId);
    return res.status(200).json(userResponse);
  }

  res.json({});
});

export default app;
