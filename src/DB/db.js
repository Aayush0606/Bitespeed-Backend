import mysql from "mysql";
import { SQL_HOST, SQL_PASSWORD, SQL_USER, SQL_DB } from "../constants.js";

export const DB = mysql.createConnection({
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DB,
});

export const connectDB = async () => {
  return new Promise((resolve, reject) => {
    DB.connect((err) => {
      if (err) return reject(err);
      const query = `CREATE TABLE IF NOT EXISTS Contact(
                      id INT PRIMARY KEY  NOT NULL,
                      phoneNumber varchar(10),
                      email varchar(255),
                      linkedId INT,
                      linkPrecedence ENUM("secondary", "primary")  NOT NULL,
                      createdAt DATETIME NOT NULL,
                      updatedAt DATETIME NOT NULL,
                      deletedAt DATETIME
                  )`;

      DB.query(query, (err, results, fields) => {
        if (err) return reject(err);
      });

      DB.end((err) => {
        if (err) return reject(err);
        console.log(`DB Connected successfully!!`);
        resolve();
      });
    });
  });
};
