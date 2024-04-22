import { DB } from "./DB/db.js";

//! CREATE TABLE IN DB IF NOT EXIST
export const connectDB = async () => {
  const query1 = `
  CREATE TABLE IF NOT EXISTS CONTACT(
    id INT PRIMARY KEY  NOT NULL AUTO_INCREMENT,
    phoneNumber varchar(10),
    email varchar(255),
    linkedId INT,
    linkPrecedence ENUM("secondary", "primary")  NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME
  );`;
  const query2 = `
  CREATE TABLE IF NOT EXISTS CHILDREN(
    pid INT NOT NULL,
    cid INT NOT NULL
  );`;
  await DB.query(query1);
  await DB.query(query2);
  console.log(`DB started successfully!!`);
};

//! HELPER FUNCTION TO VISUALIZE DB
export const showDB = async () => {
  const query = `SELECT * FROM CONTACT `;
  const [result] = await DB.query(query);
  return result;
};

//! GET DETAILS FOR GIVEN ID
export const getUser = async (id) => {
  const query = `SELECT * FROM CONTACT WHERE id = ?;`;
  const [result] = await DB.query(query, [id]);
  return result[0];
};

//! GET ALL CHILDRENS FOR GIVEN ID
export const getChildrens = async (id) => {
  const query = `SELECT * FROM CHILDREN WHERE pid = ?;`;
  const [result] = await DB.query(query, [id]);
  return result;
};

//! GET DETAILS FOR GIVEN PHONE NUMBER OR EMAIL
export const getData = async (searchField, searchValue) => {
  const query = `SELECT * FROM CONTACT WHERE ${searchField}='${searchValue}';`;
  const [result] = await DB.query(query);
  return result.length > 0 ? result[0] : null;
};

//! INSERT THE NEW VALUES IN CONTACT DB
export const insertContactDB = async (record) => {
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
  const [result] = await DB.query(query, values);
  return result;
};

//! INSERT THE NEW VALUES IN CHILDREN DB
export const insertChildrenDB = async (pid, cid) => {
  const query = `INSERT INTO CHILDREN (pid, cid) VALUES (?, ?)`;
  const [result] = await DB.query(query, [pid, cid]);
  return result;
};

//! UPDATE THE PARENT OF THE NODE
export const updateParent = async (cid, pid) => {
  let query = `UPDATE CONTACT SET linkedId= ? WHERE id= ?`;
  await DB.query(query, [pid, cid]);
  query = `UPDATE CHILDREN SET pid= ? WHERE pid= ?`;
  insertChildrenDB(pid, cid);
  await DB.query(query, [pid, cid]);
};

//! FUNCTION TO GENERATE RESPONSE OBJECT
export const generateResponse = async (parentId) => {
  const userResponse = {
    contact: {
      primaryContatctId: parentId,
      emails: [],
      phoneNumbers: [],
      secondaryContactIds: [],
    },
  };
  const parentData = await getUser(parentId);
  const numberSet = new Set();
  const emailSet = new Set();
  if (parentData.email) {
    emailSet.add(parentData.email);
    userResponse.contact.emails.push(parentData.email);
  }
  if (parentData.phoneNumber) {
    numberSet.add(parentData.phoneNumber);
    userResponse.contact.phoneNumbers.push(parentData.phoneNumber);
  }
  const childrenData = await getChildrens(parentId);
  for (let index = 0; index < childrenData.length; index++) {
    const currUser = await getUser(childrenData[index].cid);
    if (currUser.phoneNumber && !numberSet.has(currUser.phoneNumber)) {
      userResponse.contact.phoneNumbers.push(currUser.phoneNumber);
      numberSet.add(currUser.phoneNumber);
    }
    if (currUser.email && !emailSet.has(currUser.email)) {
      userResponse.contact.emails.push(currUser.email);
      emailSet.add(currUser.email);
    }
    userResponse.contact.secondaryContactIds.push(currUser.id);
  }
  return userResponse;
};
