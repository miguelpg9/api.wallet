import app from "./app";
import sequelize from "./config/database";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server running");
    });
  })
  .catch((error: any) => {
    logger.error("Unable to connect to the database:", error);
  });
