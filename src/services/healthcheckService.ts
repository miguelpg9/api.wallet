import sequelize from "../config/database";

export const checkDatabaseConnection = async () => {
  await sequelize.authenticate();
};
