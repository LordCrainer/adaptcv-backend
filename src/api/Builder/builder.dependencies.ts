import { BuilderController } from "./builder.controller";
import { BuilderService } from "./builder.service";
import { BuilderRepositoryMongo } from "./repository/builder.repository.mongo";

export const builderRepositoryMongo = new BuilderRepositoryMongo();
export const builderService = new BuilderService(builderRepositoryMongo);
export const inyectBuilderController = new BuilderController(builderService);