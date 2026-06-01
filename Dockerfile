FROM node:20-slim

WORKDIR /app

# Copy everything
COPY . .

# Install root dependencies (express, ws)
RUN npm install

# Build React frontend
RUN cd frontend && npm install && npm run build

EXPOSE 8080

CMD ["node", "local-server.js"]
