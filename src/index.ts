import "@/configs/loadEnv";
import { CustomError, envConfig, routesConfig } from "@/configs";
import logger from "@/configs/logger.config";
import "@/configs/passport.config";
import { connectMultipleDB } from "@/database/connect.db";
import { connectToRedis } from "@/database/redis.db";
import {
  executePrescriptDB,
  executePrescriptRedis,
} from "@/database/script.db";
import { errorMiddleware } from "@/middlewares";
import { enableServerMiddleware } from "@/middlewares/server.middleware";
import { apis } from "@/routes";
import { startCronJobs } from "@/services/cron.service";
import { handleServerShutDown } from "@/utils/server";
import { swaggerSpec } from "@/utils/swagger";
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import path from "path";
import swaggerUi from "swagger-ui-express";

// const a = "teacher";
// console.log(prisma[a]);
const app = express();

// Views
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "hbs");

// Middlewares
enableServerMiddleware(app);

// Routers
app.get(routesConfig.landingPage, (req: Request, res: Response) => {
  res.render("home", {
    name: envConfig.NAME,
  });
});
app.use(
  routesConfig.swagger.docs,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);
app.get(routesConfig.swagger.json, (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json(swaggerSpec);
});
app.use(routesConfig.apis, apis);
app.all("*", () => {
  throw new CustomError(
    "Not found operation on this route",
    StatusCodes.NOT_FOUND,
  );
});

// Error middleware must always be the last middleware
app.use(errorMiddleware);

const startServer = () => {
  return app.listen(Number(envConfig.PORT), () => {
    logger.info(`Server is running on ${envConfig.BASE_URL}`);
    logger.info(`Swagger Docs is available at ${envConfig.BASE_URL}/docs`);

    startCronJobs();
  });
};

// Connect to db and start the server
const main = async () => {
  try {
    const promises = [
      connectMultipleDB(),
      connectToRedis(),
      executePrescriptDB(),
      executePrescriptRedis(),
    ];
    await Promise.all(promises);
    const server = startServer();
    // Handle server shutdown
    if (envConfig.NODE_ENV === "production") {
      process.on("SIGINT", async () => await handleServerShutDown(server));
      process.on("SIGTERM", async () => await handleServerShutDown(server));
    }
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};
main();
