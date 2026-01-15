# Use a single-stage build with Node for both building and serving
FROM node:22.14.0

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies, including 'serve' for static file serving
RUN npm ci && npm install -g serve

# Copy source code
COPY . ./

# Set production API URL (update to direct backend URL if needed, e.g., 'http://localhost:8000/api')
ENV VITE_API_BASE_URL='http://localhost:8000'

# Build the frontend
RUN npm run build

# Expose port (change if needed; default for serve is 3000, but you can set it)
EXPOSE 3000

# Start the static server with the built files
CMD ["serve", "-s", "dist", "-l", "3000"]