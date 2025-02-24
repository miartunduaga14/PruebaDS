# Usa una imagen oficial de Node.js como base
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de configuración para aprovechar la cache de Docker
COPY package.json package-lock.json ./

# Instalar dependencias (omite las de desarrollo en producción)
RUN npm install --omit=dev

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto donde corre la aplicación (informativo)
EXPOSE 3050

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
