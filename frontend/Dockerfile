# Build stage: compile the frontend assets using Node.js
FROM node:20-alpine AS build
WORKDIR /app

# Install only what we need to build the project
COPY frontend/package*.json ./
RUN npm ci

# Copy the application source and produce the static bundle
COPY frontend/ ./
RUN npm run build

# Runtime stage: serve the compiled assets with nginx so no npm command is
# required in production.
FROM nginx:1.25-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

# The nginx configuration listens on 3000, so expose it for clarity.
EXPOSE 3000

# Use nginx as the container command so runtime never depends on npm.
CMD ["nginx", "-g", "daemon off;"]
