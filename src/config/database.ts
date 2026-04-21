import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/user";
import { Category } from "../models/category";
import { Transaction } from "../models/transaction";

dotenv.config();

console.log(
  "DB un use: ",
  process.env.DB_NAME,
  "NODE_ENV: ",
  process.env.NODE_ENV,
);

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  models: [User, Category, Transaction],
  logging: false,
});

export default sequelize;
