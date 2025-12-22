# AdaptCV Backend

AdaptCV Backend is a Node.js REST API for authentication and CV management, built with Express, TypeScript, MongoDB, and Redis. This project is designed to be run in a Dockerized environment and uses private npm packages from GitHub Packages.

## Table of Contents
- [AdaptCV Backend](#adaptcv-backend)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [.npmrc for Private Packages](#npmrc-for-private-packages)
    - [Environment Variables](#environment-variables)
    - [Docker](#docker)
  - [Running the Project](#running-the-project)
  - [License](#license)
  - [Author](#author)

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd adaptcv-backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

## Configuration

### .npmrc for Private Packages
This project uses private npm packages from GitHub Packages. Ensure you have a `.npmrc` file in the root directory with the following content:

```
@lordcrainer:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<YOUR_GITHUB_TOKEN>
```
Replace `<YOUR_GITHUB_TOKEN>` with a valid GitHub personal access token with `read:packages` scope.

### Environment Variables
Copy the example environment file and edit as needed:
```sh
cp .env.example .env
```
Set the following variables in your `.env` file:
- `API_PORT`
- `MONGODB_PORT`
- `REDIS_PORT`
- ... (add other required variables)

### Docker

For **development**, only MongoDB and Redis are started with Docker Compose. Run your backend locally with `npm run dev`.

Start MongoDB and Redis for development:
```sh
docker-compose up
```

For **production**, use the Docker Compose profile to start the backend, MongoDB, and Redis as containers:
```sh
docker-compose --profile prod up --build
```

## Running the Project

- **Development:**
  ```sh
  npm run dev
  ```
- **Production:**
  ```sh
  npm run start
  ```

## Health Check Endpoint

The API includes a health check endpoint at `/health` that can be used for monitoring and uptime services like UptimeRobot.

**Endpoint:** `GET /health`

**Response (Healthy):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-22T01:30:00.000Z",
  "services": {
    "mongodb": {
      "status": "connected",
      "readyState": 1
    },
    "redis": {
      "status": "connected"
    }
  }
}
```

**Response (Unhealthy):** Returns HTTP 503 with service status details.

This endpoint:
- Does not require authentication
- Is available in all environments (development, production, test)
- Checks MongoDB and Redis connection status
- Returns HTTP 200 when healthy, HTTP 503 when unhealthy

## License

This project is licensed under the ISC License.

## Author

[LordCrainer](https://github.com/LordCrainer)

