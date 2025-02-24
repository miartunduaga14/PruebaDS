# PruebaDS

Este código es una aplicación Node.js con Express y MySQL, que maneja un sistema de conteo de visitas con almacenamiento en una base de datos.

Comenzando 🚀

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

Mira Deployment para conocer como desplegar el proyecto.

Pre-requisitos 📋

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/) (o un contenedor con MySQL)
- [Docker](https://www.docker.com/) (opcional, si usas contenedores)
- [Kubernetes](https://kubernetes.io/) (si lo usas)
- `npm` (viene con Node.js)
- [Nodemon](https://www.npmjs.com/package/nodemon) (si lo usas)
  
Instalación 🔧

Paso 1: Configurar el entorno

1.1 Instalar Node.js

node -v
npm -v

Paso 2: Crear el proyecto
2.1 Inicializar un nuevo proyecto

mkdir mi-app
cd mi-app
npm init -y


Paso 3: Instalar dependencias

npm install express ejs body-parser mysql2 dotenv

Paso 4: Crear la estructura del proyecto

![image](https://github.com/user-attachments/assets/124bd781-ae01-4985-9d85-8901d140edda)

Paso 5: Configurar el servidor en server.js

Crea y abre server.js, luego copia este código:

require('dotenv').config();

const express = require('express');

const mysql = require('mysql2');

const bodyParser = require('body-parser');


const app = express();

// Configuración de la base de datos

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'prueba',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));  // Para servir archivos estáticos
app.set('view engine', 'ejs');

// Ruta principal

app.get('/', async (req, res) => {
    try {
        const [results] = await pool.promise().query('SELECT * FROM visits LIMIT 1');
        const visits = results.length > 0 ? results[0].count : 0;

        res.render('index', { visits });
    } catch (err) {
        console.error("Error en la base de datos:", err);
        res.status(500).send("Error en la base de datos");
    }
});

// Ruta para incrementar visitas

app.post('/visits', async (req, res) => {
    try {
        const [results] = await pool.promise().query('SELECT * FROM visits');

        if (results.length > 0) {
            const newCount = results[0].count + 1;
            await pool.promise().query('UPDATE visits SET count = ?', [newCount]);
        } else {
            await pool.promise().query('INSERT INTO visits (count) VALUES (1)');
        }

        res.redirect('/');
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).send("Error en la base de datos");
    }
});

// Iniciar el servidor

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

Paso 6: Crear la base de datos

CREATE DATABASE prueba;
USE prueba;

CREATE TABLE visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    count INT DEFAULT 1,
    mode TEXT
);

Paso 7: Crear la vista en views/index.ejs

Crea la carpeta views y dentro el archivo index.ejs:

html
Copiar
Editar
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contador de Visitas</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Visitas: <%= visits %></h1>
    <form action="/visits" method="POST">
        <button type="submit">Incrementar</button>
    </form>
</body>
</html>
     
Paso 8: Iniciar el servidor

node server.js

Paso 9: Probar la app

Abre el navegador y ve a http://localhost:3050
Presiona el botón para incrementar el contador de visitas.
Revisa la base de datos para ver cómo se actualiza el conteo.

Ejecutando las pruebas ⚙️

Paso 1: Preparar la aplicacion

Crear un DOCKERFILE

![image](https://github.com/user-attachments/assets/6481c44a-5203-417e-b74b-9226fc679648)

Paso 2: Construir y probar la imagen Docker

docker build -t mi-app-node .

docker run -p 3000:3000 --env-file .env mi-app-node

Paso 3: Crear los archivos de configuración para Kubernetes
3.1 Desplegar MySQL en Kubernetes
Crear mysql-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: MYSQL_ROOT_PASSWORD
        ports:
        - containerPort: 3306


3.2 Desplegar la aplicación Node.js
Crear app-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: aplicacion
spec:
  replicas: 2  # Número de instancias
  selector:
    matchLabels:
      app: aplicacion
  template:
    metadata:
      labels:
        app: aplicacion
    spec:
      containers:
      - name: aplicacion
        image: aplicacion:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3050
        envFrom:
        - configMapRef:
            name: aplicacion-config
        - secretRef:
            name: aplicacion-secret
            
Paso 4: Desplegar en Kubernetes
4.1 Aplicar los archivos de configuración

kubectl apply -f mysql-deployment.yaml
kubectl apply -f app-deployment.yaml

Paso 5: Acceder a la aplicación

kubectl get svc mi-app-service

Construido con 🛠️

- Vscode
- docker Desktop
- NodeJS -> backend
- EJS -> frontend
- EXPRESSJS -> framework
- MySQL -> BD

Autores ✒️

Michael Artunduaga Parra
