import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "DB en use:",
  process.env.DB_NAME,
  "NODE_ENV:",
  process.env.NODE_ENV,
);

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  },
);

import "../models";

export default sequelize;
