FROM node:22.15.0-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Development stage
FROM node:22.15.0-slim AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]


# Production stage
FROM node:22.15.0-slim AS prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]