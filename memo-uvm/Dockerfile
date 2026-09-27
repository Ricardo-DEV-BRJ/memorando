# ETAPA 1: Compilación (Build)
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Genera la carpeta /dist
RUN npm run build-only

# ETAPA 2: Servidor Web Nginx
FROM nginx:alpine AS production-stage

# Copiar los archivos compilados de la etapa anterior a Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx para Vue Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]