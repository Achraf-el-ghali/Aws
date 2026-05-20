FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
# Copy built Angular app
COPY --from=build /app/dist/cloud-health/browser /usr/share/nginx/html
# Copy nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Default API gateway host (overridable via environment variable)
ENV API_GATEWAY_HOST=api-gateway:80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
