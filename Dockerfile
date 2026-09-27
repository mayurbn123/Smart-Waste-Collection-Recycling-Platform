# Use official minimal Node.js Alpine base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy application files
COPY package.json ./
COPY server.js ./
COPY public/ ./public/

# Configure Cloud Run environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Run lightweight native server
CMD ["node", "server.js"]
