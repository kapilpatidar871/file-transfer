FROM node:20-slim

WORKDIR /app

# Copy everything
COPY . .

# Install root dependencies (express, ws)
RUN npm install

# Build React frontend
# VITE_WS_URL and VITE_API_URL are injected at build time via Render env vars
ARG VITE_WS_URL
ARG VITE_API_URL
RUN cd frontend && npm install && npm run build

EXPOSE 10000

CMD ["node", "local-server.js"]
