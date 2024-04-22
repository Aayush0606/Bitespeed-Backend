import "dotenv/config";
import express from "express";
import cors from "cors";
import { getData, insertDB, showDB } from "./utils.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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

  const emailPreviousRecord = await getData("email", email);
  const phoneNumberPreviousRecord = await getData("phoneNumber", phoneNumber);
  //! FIRST TIME ENCOUNTRING SUCH RECORD
  if (
    emailPreviousRecord.length === 0 &&
    phoneNumberPreviousRecord.length === 0
  ) {
    const newRecordData = {
      phoneNumber: phoneNumber || null,
      email: email || null,
      linkedId: null,
      linkPrecedence: "primary",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    await insertDB(newRecordData);
    const dbShow = await showDB();
    return res.status(200).json(dbShow);
  }
  res.json({});
});

export default app;
