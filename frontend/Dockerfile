# Frontend Dockerfile

# BUILD Phase - Build React SPA with Vite
FROM node:22-alpine AS build
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install ALL dependencies - needed during build phase
RUN npm ci
# COPY application code
COPY . .
# Perform the build command
RUN npm run build

# Serve only built static files with Nginx (optimized for smaller file size)
FROM nginx:alpine
# Copy built files from build phase
COPY --from=build /app/dist /usr/share/nginx/html
# Expose HTTP port (Nginx default is 80)
EXPOSE 80
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  # wget tries to connect to localhost/ port 80 (Nginx default)
  # if Nginx is running - success (exit 0)
  # if Nginx is not responding - fails (exit 1)
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Docker requires processes to run in foreground to stay active
# "nginx" is the web server used to serve the built files
# -g passes configuration directly to Nginx (g = global)
# "daemon off" prevents Nginx from running in the background
CMD echo "🌐 Frontend: React SPA served via Nginx" && nginx -g 'daemon off;'