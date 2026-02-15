# Backend Dockerfile
FROM node:22-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Add NODE_ENV arg
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# COPY application code
COPY . .

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Fixed health check using both HOST and PORT variables
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://' + (process.env.HOST || '0.0.0.0') + ':' + (process.env.PORT || 3000), (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Updated startup message
CMD echo "🔧 Backend: Node.js API starting on ${HOST:-0.0.0.0}:${PORT:-3000}" && npm start