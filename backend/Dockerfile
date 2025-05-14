FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create logs and uploads directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
