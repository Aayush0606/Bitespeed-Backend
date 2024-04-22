import mysql from "mysql2";
import { SQL_HOST, SQL_PASSWORD, SQL_USER, SQL_DB } from "../constants.js";

//! SQL2 USED TO CREATE DB INSTANCE, THIS INSTANCE WILL BE USED THROUGHOUT TO ACCESS DB
export const DB = mysql
  .createPool({
    host: SQL_HOST,
    user: SQL_USER,
    password: SQL_PASSWORD,
    database: SQL_DB,
  })
  .promise();
