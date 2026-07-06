const jwt = require('jsonwebtoken');

// Middleware para autenticar token JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = decoded;
        req.user = decoded;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: "Token expirado" });
        }
        return res.status(403).json({ error: "Token inválido" });
    }
}

module.exports = autenticarToken;