const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la conexión a MySQL/MariaDB en CentOS
const db = mysql.createConnection({
    host: 'localhost',
    user: 'aetheria_user',
    password: 'tu_password_segura', // Cambia esto si configuraste contraseña en MariaDB
    database: 'aetheria_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos SQL.');
});

// Endpoint de Registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
            }
            res.json({ success: true, message: 'Usuario registrado correctamente.' });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ success: true, message: 'Login exitoso', username: user.username });
        } else {
            res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
