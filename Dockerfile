FROM php:8.2-cli

# Install Node.js 20 + system deps
RUN apt-get update && apt-get install -y curl git unzip && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copy all source
COPY . .

# Build React frontend
RUN cd frontend && npm install && npm run build

# Install PHP dependencies
RUN cd backend && composer install --no-dev --optimize-autoloader

EXPOSE 8080

CMD ["php", "backend/server.php"]
