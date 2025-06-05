import { BuilderController } from "./builders.controller";
import { BuilderService } from "./builders.service";
import { BuilderRepositoryMongo } from "./repository/builders.repository.mongo";

export const builderRepositoryMongo = new BuilderRepositoryMongo();
export const builderService = new BuilderService(builderRepositoryMongo);
export const inyectBuilderController = new BuilderController(builderService);