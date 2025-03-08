# Usamos la imagen oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo package.json y package-lock.json primero (mejora la caché de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación Next.js
# RUN npm run build

# Exponer el puerto 3000
EXPOSE 3000

# Ejecutar Next.js en modo producción
# CMD ["npm", "run", "start"]

# Ejecutar Next.js en modo desarrollo
CMD ["npm", "run", "dev"]
