# <<<<<<< codex/deploy-application-with-docker-and-apache
# Build stage: compile the frontend assets
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of the sources and build
COPY frontend/ ./
RUN npm run build

# Runtime stage: serve the compiled assets with nginx
FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 3000
# =======
# FROM nginx:alpine

# COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# COPY frontend/dist/ /usr/share/nginx/html/

# EXPOSE 3000

# >>>>>>> master
CMD ["nginx", "-g", "daemon off;"]
