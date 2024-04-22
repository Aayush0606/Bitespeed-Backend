import mysql from "mysql2";
import { SQL_HOST, SQL_PASSWORD, SQL_USER, SQL_DB } from "../constants.js";

export const DB = mysql
  .createPool({
    host: SQL_HOST,
    user: SQL_USER,
    password: SQL_PASSWORD,
    database: SQL_DB,
  })
  .promise();
