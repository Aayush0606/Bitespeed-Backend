import { DB } from "./DB/db.js";

//! CREATE TABLE IN DB IF NOT EXIST
export const connectDB = async () => {
  const query = `CREATE TABLE IF NOT EXISTS Contact(
          id INT PRIMARY KEY  NOT NULL AUTO_INCREMENT,
          phoneNumber varchar(10),
          email varchar(255),
          linkedId INT,
          linkPrecedence ENUM("secondary", "primary")  NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT NOW(),
          updatedAt DATETIME NOT NULL DEFAULT NOW(),
          deletedAt DATETIME
      )`;
  const [result] = await DB.query(query);
  console.log(`DB started successfully!!`);
};

//! HELPER FUNCTION TO VISUALIZE DB
export const showDB = async () => {
  const query = `SELECT * FROM CONTACT `;
  const [result] = await DB.query(query);
  return result;
};

//! GET DETAILS FOR GIVEN PHONE NUMBER OR EMAIL
export const getData = async (searchField, searchValue) => {
  const query = `SELECT * FROM CONTACT WHERE ${searchField}='${searchValue}';`;
  console.log(query);

  const [result] = await DB.query(query);
  return result;
};

//! INSERT THE NEW VALUES IN DB
export const insertDB = async (record) => {
  const query = `INSERT INTO CONTACT 
                (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    record.phoneNumber,
    record.email,
    record.linkedId,
    record.linkPrecedence,
    record.createdAt,
    record.updatedAt,
    record.deletedAt,
  ];
  console.log(query);
  console.log(values);
  const [result] = await DB.query(query, values);
};
