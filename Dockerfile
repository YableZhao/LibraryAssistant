FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Use nginx as a static server
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /

# Set script permissions
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Set custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
