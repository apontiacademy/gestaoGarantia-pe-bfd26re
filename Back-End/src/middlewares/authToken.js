const jwt = require('jsonwebtoken');

// Middleware para autenticar token JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: "Token não fornecido"});
    }
    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        console.log("erro verificação:", err);
        console.log("decoded token:", usuario);
        if(err){
            return res.status(403).json({error: "Token inválido"});
        }
        req.usuario = usuario;
        next();
    });
}
module.exports =  autenticarToken ;