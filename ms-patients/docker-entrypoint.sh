#!/bin/bash
set -e

# Parse DATABASE_URL to extract host (works for both local Docker Compose and AWS RDS)
# Format expected: mysql://user:pass@host:port/dbname?...
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/?]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')
DB_PORT=${DB_PORT:-3306}

# Wait for database to be ready
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
max_retries=60
counter=0
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT}', 'placeholder', 'placeholder');" 2>&1 | grep -qE 'Access denied|SQLSTATE\[HY000\] \[10' || \
      php -r "\$u=parse_url('${DATABASE_URL}'); new PDO('mysql:host='.\$u['host'].';port='.(\$u['port']??3306).';dbname='.ltrim(\$u['path'],'/'), \$u['user'], \$u['pass']);" 2>/dev/null; do
    counter=$((counter + 1))
    if [ $counter -ge $max_retries ]; then
        echo "Database not reachable after ${max_retries} attempts. Starting anyway..."
        break
    fi
    echo "Database not ready yet... (${counter}/${max_retries})"
    sleep 2
done

echo "Database is reachable!"

# Run migrations or schema update
echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration 2>/dev/null || true
echo "Ensuring schema is up to date..."
php bin/console doctrine:schema:update --force --complete 2>/dev/null || \
php bin/console doctrine:schema:update --force 2>/dev/null || \
echo "Schema update skipped"

# Clear cache for production
if [ "$APP_ENV" = "prod" ]; then
    echo "Clearing production cache..."
    php bin/console cache:clear --env=prod --no-debug 2>/dev/null || true
    php bin/console cache:warmup --env=prod --no-debug 2>/dev/null || true
fi

echo "Starting Apache..."
exec apache2-foreground
