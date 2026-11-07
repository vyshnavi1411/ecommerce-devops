
# Use Node.js 22
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY --chown=node:node src ./src

# Use non-root user for security
USER node

# Application port
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]
