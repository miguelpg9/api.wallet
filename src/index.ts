import app from "./app";
import sequelize from "./config/database";

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Unable to connect to the database:", error);
  });
