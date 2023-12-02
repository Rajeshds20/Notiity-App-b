const jwt = require('jsonwebtoken');
const User = require('../models/user');

const Authentication = async (req, res, next) => {
    try {
        const { authorization = '' } = req.headers;
        const [bearer, token] = authorization?.split(' ');
        if (!authorization || !token) {
            return res.status(401).send('Invalid token');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
            return res.send(403).json({ message: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (e) {
        res.status(401).json({ error: e.message, message: "Not Authenticated" });
    }
}

module.exports = Authentication;