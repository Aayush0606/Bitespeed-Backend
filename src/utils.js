import { DB } from "./DB/db.js";

//! CREATE TABLE IN DB IF NOT EXIST
export const connectDB = async () => {
  //! this is the given contact table
  const query1 = `
  CREATE TABLE IF NOT EXISTS CONTACT(
    id INT PRIMARY KEY  NOT NULL AUTO_INCREMENT,
    phoneNumber varchar(10),
    email varchar(255),
    linkedId INT,
    linkPrecedence ENUM("secondary", "primary")  NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME
  );`;
  //! this table will store a realtion between parent and child
  //! it will store all children of a parent, this will make it easy to find them
  //! this will also make the process of removing children easy
  //! the relation is pid->cid, evey time a child is added, we will create new entry for it
  //! all the linkedId will point root parent, and this will make it easier to find root parent in one step
  const query2 = `
  CREATE TABLE IF NOT EXISTS CHILDREN(
    pid INT NOT NULL,
    cid INT NOT NULL
  );`;
  await DB.query(query1);
  await DB.query(query2);
  console.log(`DB started successfully!!`);
};

export const clearDB = async () => {
  let query = `DROP TABLE CONTACT,CHILDREN`;
  await DB.query(query);
  // query = `DELETE TABLE CHILDREN;`;
  // await DB.query(query);
};

//! HELPER FUNCTION TO VISUALIZE DB
export const showDB = async () => {
  const query = `SELECT * FROM CONTACT `;
  const [result] = await DB.query(query);
  return result;
};

//! GET DETAILS FOR GIVEN ID
//! THIS FUNCTION RETURNS A USER FOR GIVENN ID
//! THE DATA RETURED IS A ROW IN CONTACT TABLE
export const getUser = async (id) => {
  const query = `SELECT * FROM CONTACT WHERE id = ?;`;
  const [result] = await DB.query(query, [id]);
  return result[0];
};

//! GET ALL CHILDRENS FOR GIVEN ID
//! FUNCTION USED TO FETCH ALL CHILDRENS OF GIVEN PARENT ID
//! RETURN AN ARRAY OF OBJECT CONTAING [{pid,cid}]
export const getChildrens = async (id) => {
  const query = `SELECT * FROM CHILDREN WHERE pid = ?;`;
  const [result] = await DB.query(query, [id]);
  return result;
};

//! GET DETAILS FOR GIVEN PHONE NUMBER OR EMAIL
//! THIS FUNCTION IS USED FOR CHECKING IF THIS USER IS NEW OR EXISTING
//! THIS RETURNS THE ROW OF CONTACT TABLE IF IT EXIST
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
//! IN CASE WHERE TWO DISTINCT USER COMBINE ie WHEN BOTH PRIMARY USERS HAVE TO MERGE
//! WE WILL UPDATE  THE PARENT OF LATEST USER WITH OLDER ONE AND CHANGE THE CHILDRENS PARENT TOO
//! WE WILL ALSO ADD THE CURRENT USER AS CHILD OF PARENT
export const updateParent = async (cid, pid) => {
  let query = `UPDATE CONTACT SET linkedId= ? WHERE id= ?`;
  await DB.query(query, [pid, cid]);
  query = `UPDATE CHILDREN SET pid= ? WHERE pid= ?`;
  insertChildrenDB(pid, cid);
  await DB.query(query, [pid, cid]);
};

//! FUNCTION TO GENERATE RESPONSE OBJECT
//! THIS WILL GENERATE THE RESPONSE FOR OUR API ENDPOINT
//! THIS WILL FIRST TAKE THE PARENT ID AS INPUT AND CREATE A BASE WITH THAT
//! THEN IT WILL QUERY ALL IT'S CHILDREN FOR DATA AND FILL THE TABLE
//! WE CAN USE JOINS TO OPTIMISE THIS FURTURE
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
  //! used to make sure values are distinct(joins can also be used)
  const numberSet = new Set();
  const emailSet = new Set();
  //! start by adding parents detail in the answer
  if (parentData.email) {
    emailSet.add(parentData.email);
    userResponse.contact.emails.push(parentData.email);
  }
  if (parentData.phoneNumber) {
    numberSet.add(parentData.phoneNumber);
    userResponse.contact.phoneNumbers.push(parentData.phoneNumber);
  }
  //! fetch all the childrens
  const childrenData = await getChildrens(parentId);
  //! traverse all children and add them in answer
  for (let index = 0; index < childrenData.length; index++) {
    const currUser = await getUser(childrenData[index].cid);
    if (currUser.phoneNumber && !numberSet.has(currUser.phoneNumber)) {
      userResponse.contact.phoneNumbers.push(currUser.phoneNumber);
      //! keep adding values in set to avoid duplicates
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
