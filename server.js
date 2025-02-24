require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Configuración de la base de datos con Pool de conexiones
const pool = mysql.createPool({
    host: "mysql-service",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password", // Usa variables de entorno para seguridad
    database: process.env.DB_NAME || "prueba",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Rutas
app.get('/', async (req, res) => {
    try {
        const [results] = await pool.promise().query('SELECT * FROM visits LIMIT 1');

        const visits = results.length > 0 ? results[0].count : 0;
        const mode = results.length > 0 ? results[0].mode : "Desconocido";

        res.render('index', { visits, mode });
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).send("Error en la base de datos");
    }
});

app.post('/visits', async (req, res) => {
    try {
        const mode = req.body.mode;
        const [results] = await pool.promise().query('SELECT * FROM visits');

        if (results.length > 0) {
            // Si el registro existe, actualizamos el conteo
            const newCount = results[0].count + 1;
            await pool.promise().query('UPDATE visits SET count = ?, mode = ?', [newCount, mode]);
        } else {
            // Si no existe, lo creamos
            await pool.promise().query('INSERT INTO visits (count, mode) VALUES (1, ?)', [mode]);
        }

        res.redirect('/');
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).send("Error en la base de datos");
    }
});

app.listen(3050, "0.0.0.0", () => console.log("Servidor corriendo en http://0.0.0.0:3050"));

