# 1. Usar una imagen ligera de Node.js
FROM node:20-alpine

# 2. Crear y establecer el directorio de trabajo
WORKDIR /app

# 3. Copiar los archivos de dependencias
COPY package*.json ./

# 4. Instalar únicamente dependencias de producción
RUN npm ci --only=production

# 5. Copiar el resto del código del servidor
COPY . .

# 6. Exponer el puerto en el que escucha tu Express (por ejemplo 3000)
EXPOSE 3000

# 7. Definir la variable de entorno para producción
ENV NODE_ENV=production

# 8. Comando para iniciar la API
CMD ["npm", "start"]
