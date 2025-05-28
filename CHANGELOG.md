# [1.3.0](https://github.com/LordCrainer/adaptcv-backend/compare/v1.2.0...v1.3.0) (2025-05-28)


### Bug Fixes

* update @lordcrainer/adaptcv-shared-types to version 1.17.4 and refactor login function usage in auth context ([5f8d230](https://github.com/LordCrainer/adaptcv-backend/commit/5f8d2303bf93289331a1759e358505b27db77867))


### Features

* add default values for status and authProvider in user creation ([393c92b](https://github.com/LordCrainer/adaptcv-backend/commit/393c92bdc74164d229eb632f316629ea2ea1e93e))
* add README and update docker-compose for production profile ([1d8790e](https://github.com/LordCrainer/adaptcv-backend/commit/1d8790e47c97ba9300bf63f4caae68b225405c96))
* add script to create a test user in the database ([d1c5299](https://github.com/LordCrainer/adaptcv-backend/commit/d1c5299df6153c05be7d2a65b4c0a69faa933dbb))
* update login method to use LoginInput type and enhance logout error handling in auth service tests ([bef9f1a](https://github.com/LordCrainer/adaptcv-backend/commit/bef9f1a5f48dc96d17ed082c42c0e120b038f100))

# [1.2.0](https://github.com/LordCrainer/adaptcv-backend/compare/v1.1.1...v1.2.0) (2025-05-20)


### Bug Fixes

* ensure package is marked as private in package.json ([0a53603](https://github.com/LordCrainer/adaptcv-backend/commit/0a536034196e186a2aea2e91c5fd266caa533b14))


### Features

* add @semantic-release/npm to release workflow and configuration ([7b0fde6](https://github.com/LordCrainer/adaptcv-backend/commit/7b0fde628c514544d8d158f16a834b4dc32f6e46))

## [1.1.1](https://github.com/LordCrainer/adaptcv-backend/compare/v1.1.0...v1.1.1) (2025-05-20)

# [1.1.0](https://github.com/LordCrainer/adaptcv-backend/compare/v1.0.0...v1.1.0) (2025-05-20)


### Bug Fixes

* update Node.js engine requirement to >=20.0.0 in package.json ([4744430](https://github.com/LordCrainer/adaptcv-backend/commit/474443084caacbee285a455ff1537f72db29cd2c))


### Features

* add authentication middleware to BuilderRouter ([2046052](https://github.com/LordCrainer/adaptcv-backend/commit/204605212768dac12b247525dd192bf90d645a28))

# 1.0.0 (2025-05-20)


### Bug Fixes

* make data property in IApiResponse required for better type safety ([ad76198](https://github.com/LordCrainer/adaptcv-backend/commit/ad76198caa4c15332ed89aea371682ebb8e79fbb))
* restore depends_on for acv-mongo and acv-redis services in docker-compose.yml ([154c680](https://github.com/LordCrainer/adaptcv-backend/commit/154c680ba1aa617ee5b13f19d9ef304ebfc4af3d))
* update database connection URIs for development, test, and Redis configurations ([8ec7b72](https://github.com/LordCrainer/adaptcv-backend/commit/8ec7b72d024672d92294dc50abdca34e5d4ee195))
* update NODE_AUTH_TOKEN to use NPM_TOKEN in release workflow ([7d7c6c1](https://github.com/LordCrainer/adaptcv-backend/commit/7d7c6c1ed5b87315b6889a6ef812be1b76d66507))
* update pull request trigger and token references in release workflow ([ccc02a8](https://github.com/LordCrainer/adaptcv-backend/commit/ccc02a8c5570127545242128f2049bce2d8fc558))
* update token reference in GitHub Actions workflow for repository checkout ([879c67c](https://github.com/LordCrainer/adaptcv-backend/commit/879c67c9fd7d29af19efbd090dbb5d74a75c0b98))
* update token references in release workflow to use NPM_TOKEN for consistency ([d158ca4](https://github.com/LordCrainer/adaptcv-backend/commit/d158ca4c67ed237ec1acbc3bd575151c6d799b49))


### Features

* add comprehensive end-to-end and integration tests for authentication and user services; include utility tests for query handling ([2ddbc56](https://github.com/LordCrainer/adaptcv-backend/commit/2ddbc5636e3c701aea24e49b8ede8a6d19bb2d9e))
* add method-override and short-unique-id dependencies; update type imports for better clarity ([8e93a60](https://github.com/LordCrainer/adaptcv-backend/commit/8e93a607eb446a837f5e7066b3aa5446f4f463a0))
* add Swagger documentation setup and update route handling ([c40f575](https://github.com/LordCrainer/adaptcv-backend/commit/c40f575d268e4c1d782695f1f8337e860130ef24))
* enhance environment configuration to include server URL; update Redis connection logging and Swagger server URL ([c3f1a88](https://github.com/LordCrainer/adaptcv-backend/commit/c3f1a88fe2c7e49422237908ca27ed40ce9006cd))
* implement BuilderController and related services for CV management ([6716b99](https://github.com/LordCrainer/adaptcv-backend/commit/6716b99b1a70b7512136c3100b80e9fcda80bcec))
* implement CRUD operations for Builder with E2E and integration tests ([7381157](https://github.com/LordCrainer/adaptcv-backend/commit/73811570606f9d22afe12ca62b6af32b26adc76c))
* implement MongoDB and in-memory database strategies; enhance database connection management and testing setup ([4b07a2d](https://github.com/LordCrainer/adaptcv-backend/commit/4b07a2d797f1d0bb0498d3c574d133a37ddc4a32))
* initialize Nuxt 3 application with ESLint and essential modules ([c7cafa0](https://github.com/LordCrainer/adaptcv-backend/commit/c7cafa0859556f9048882aa452d59044be92199a))
* update Auth and Users routers to include health check endpoints; enhance Swagger documentation configuration ([3727f34](https://github.com/LordCrainer/adaptcv-backend/commit/3727f34214c3f9877c372c73a1be055e14171821))
